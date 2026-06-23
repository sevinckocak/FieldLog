import { getDatabase } from "./client";
import { Task, TaskStatus } from "../types";

interface TaskRow {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: TaskStatus;
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
  const result = await db.runAsync(
    "INSERT INTO tasks (title, description, lat, lng, status, needs_sync) VALUES (?, ?, ?, ?, ?, 1)",
    [input.title, input.description, input.lat, input.lng, input.status]
  );
  return {
    id: result.lastInsertRowId,
    title: input.title,
    description: input.description,
    lat: input.lat,
    lng: input.lng,
    status: input.status,
    firestoreId: null,
    needsSync: true,
  };
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus
): Promise<void> {
  const db = getDatabase();
  // Status değişince yeniden sync gerekiyor
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
  data: { title: string; description: string; lat: number; lng: number; status: TaskStatus }
): Promise<Task> {
  const db = getDatabase();
  const existing = await db.getFirstAsync<TaskRow>(
    "SELECT * FROM tasks WHERE firestore_id = ?",
    [firestoreId]
  );

  if (existing) {
    await db.runAsync(
      "UPDATE tasks SET title = ?, description = ?, lat = ?, lng = ?, status = ?, needs_sync = 0 WHERE firestore_id = ?",
      [data.title, data.description, data.lat, data.lng, data.status, firestoreId]
    );
    return rowToTask({ ...existing, ...data, needs_sync: 0 });
  }

  const result = await db.runAsync(
    "INSERT INTO tasks (title, description, lat, lng, status, needs_sync, firestore_id) VALUES (?, ?, ?, ?, ?, 0, ?)",
    [data.title, data.description, data.lat, data.lng, data.status, firestoreId]
  );
  return {
    id: result.lastInsertRowId,
    title: data.title,
    description: data.description,
    lat: data.lat,
    lng: data.lng,
    status: data.status,
    firestoreId,
    needsSync: false,
  };
}
