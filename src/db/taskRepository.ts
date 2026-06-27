import { getDatabase } from "./client";
import { Task, TaskPriority, TaskStatus } from "../types";

interface TaskRow {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: TaskStatus;
  priority: TaskPriority | null;
  created_at: number;
  firestore_id: string | null;
  needs_sync: number;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    priority: row.priority ?? 'medium',
    createdAt: row.created_at,
    firestoreId: row.firestore_id ?? null,
    needsSync: row.needs_sync === 1,
  };
}

export async function getAllTasks(): Promise<Task[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks ORDER BY created_at DESC"
  );
  return rows.map(rowToTask);
}

export async function getTaskById(id: number): Promise<Task | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<TaskRow>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );
  return row ? rowToTask(row) : null;
}

export async function createTask(input: Omit<Task, "id">): Promise<Task> {
  const db = getDatabase();
  const priority = input.priority ?? 'medium';
  const result = await db.runAsync(
    "INSERT INTO tasks (title, description, lat, lng, status, priority, needs_sync) VALUES (?, ?, ?, ?, ?, ?, 1)",
    [input.title, input.description, input.lat, input.lng, input.status, priority]
  );
  return {
    id: result.lastInsertRowId,
    title: input.title,
    description: input.description,
    lat: input.lat,
    lng: input.lng,
    status: input.status,
    priority,
    createdAt: Math.floor(Date.now() / 1000),
    firestoreId: null,
    needsSync: true,
  };
}

export async function updateTask(
  id: number,
  data: { title: string; description: string; status: TaskStatus; priority: TaskPriority }
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, needs_sync = 1 WHERE id = ?",
    [data.title, data.description, data.status, data.priority, id]
  );
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "UPDATE tasks SET status = ?, needs_sync = 1 WHERE id = ?",
    [status, id]
  );
}

export async function deleteTask(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
}

// --- Sync yardımcı metodlar ---

export async function getPendingTasks(): Promise<Task[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE needs_sync = 1 ORDER BY created_at ASC"
  );
  return rows.map(rowToTask);
}

export async function markAsSynced(
  id: number,
  firestoreId: string
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "UPDATE tasks SET needs_sync = 0, firestore_id = ? WHERE id = ?",
    [firestoreId, id]
  );
}

/**
 * Firestore'dan gelen task'ı SQLite'a yazar.
 * firestore_id eşleşirse günceller, yoksa yeni kayıt açar.
 */
export async function upsertTaskFromFirestore(
  firestoreId: string,
  data: {
    title: string;
    description: string;
    lat: number;
    lng: number;
    status: TaskStatus;
    priority?: TaskPriority;
  }
): Promise<Task> {
  const db = getDatabase();
  const priority = data.priority ?? 'medium';
  const existing = await db.getFirstAsync<TaskRow>(
    "SELECT * FROM tasks WHERE firestore_id = ?",
    [firestoreId]
  );

  if (existing) {
    await db.runAsync(
      "UPDATE tasks SET title = ?, description = ?, lat = ?, lng = ?, status = ?, priority = ?, needs_sync = 0 WHERE firestore_id = ?",
      [data.title, data.description, data.lat, data.lng, data.status, priority, firestoreId]
    );
    return rowToTask({ ...existing, ...data, priority, needs_sync: 0 });
  }

  const result = await db.runAsync(
    "INSERT INTO tasks (title, description, lat, lng, status, priority, needs_sync, firestore_id) VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
    [data.title, data.description, data.lat, data.lng, data.status, priority, firestoreId]
  );
  return {
    id: result.lastInsertRowId,
    title: data.title,
    description: data.description,
    lat: data.lat,
    lng: data.lng,
    status: data.status,
    priority,
    createdAt: Math.floor(Date.now() / 1000),
    firestoreId,
    needsSync: false,
  };
}
