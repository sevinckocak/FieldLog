import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPendingTasks, markAsSynced } from "../db/taskRepository";
import { pushTaskToFirestore } from "./syncService";

const RETRY_KEY = "@fieldlog/sync_retries";
const MAX_RETRIES = 5;

type RetryMap = Record<string, number>;

export interface SyncProgress {
  done: number;
  failed: number;
  currentTaskTitle: string;
}

export interface SyncResult {
  synced: number;
  failed: number;
}

// Mutex: prevents concurrent sync runs (belt-and-suspenders on top of Redux condition)
let _isRunning = false;

async function getRetryMap(): Promise<RetryMap> {
  try {
    const raw = await AsyncStorage.getItem(RETRY_KEY);
    return raw ? (JSON.parse(raw) as RetryMap) : {};
  } catch {
    return {};
  }
}

async function incrementRetry(taskId: number): Promise<void> {
  try {
    const map = await getRetryMap();
    const key = String(taskId);
    map[key] = (map[key] ?? 0) + 1;
    await AsyncStorage.setItem(RETRY_KEY, JSON.stringify(map));
  } catch {}
}

async function clearRetry(taskId: number): Promise<void> {
  try {
    const map = await getRetryMap();
    delete map[String(taskId)];
    await AsyncStorage.setItem(RETRY_KEY, JSON.stringify(map));
  } catch {}
}

async function hasExceededRetries(taskId: number): Promise<boolean> {
  const map = await getRetryMap();
  return (map[String(taskId)] ?? 0) >= MAX_RETRIES;
}

/**
 * Runs the offline sync queue. Iterates all pending SQLite tasks, pushes each
 * to Firestore, and tracks per-task progress via callbacks.
 *
 * @param uid   Firebase user UID
 * @param onStart   Called once with total eligible task count (triggers UI modal)
 * @param onProgress  Called after each task attempt with running totals
 */
export async function runSyncQueue(
  uid: string,
  onStart: (total: number) => void,
  onProgress: (progress: SyncProgress) => void
): Promise<SyncResult> {
  if (_isRunning) return { synced: 0, failed: 0 };
  _isRunning = true;

  try {
    const pending = await getPendingTasks();
    if (pending.length === 0) return { synced: 0, failed: 0 };

    // Skip tasks that have exceeded the retry limit
    const eligible: typeof pending = [];
    for (const task of pending) {
      if (!(await hasExceededRetries(task.id))) {
        eligible.push(task);
      }
    }

    if (eligible.length === 0) return { synced: 0, failed: 0 };

    onStart(eligible.length);

    let synced = 0;
    let failed = 0;

    for (const task of eligible) {
      onProgress({ done: synced, failed, currentTaskTitle: task.title });

      try {
        const firestoreId = await pushTaskToFirestore(task, uid);
        await markAsSynced(task.id, firestoreId);
        await clearRetry(task.id);
        synced++;
      } catch {
        failed++;
        await incrementRetry(task.id);
      }

      onProgress({ done: synced, failed, currentTaskTitle: task.title });
    }

    return { synced, failed };
  } finally {
    _isRunning = false;
  }
}
