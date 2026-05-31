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
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
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

export async function createTask(
  input: Omit<Task, "id">
): Promise<Task> {
  const db = getDatabase();
  const result = await db.runAsync(
    "INSERT INTO tasks (title, description, lat, lng, status) VALUES (?, ?, ?, ?, ?)",
    [input.title, input.description, input.lat, input.lng, input.status]
  );
  return { id: result.lastInsertRowId, ...input };
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus
): Promise<void> {
  const db = getDatabase();
  await db.runAsync("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteTask(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
}
