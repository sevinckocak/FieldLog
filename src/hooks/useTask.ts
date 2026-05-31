import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus } from "../types";
import {
  getAllTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../db/taskRepository";

interface UseTaskReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (input: Omit<Task, "id">) => Promise<Task>;
  changeStatus: (id: number, status: TaskStatus) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTask(): UseTaskReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görevler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(async (input: Omit<Task, "id">): Promise<Task> => {
    const created = await createTask(input);
    setTasks((prev) => [created, ...prev]);
    return created;
  }, []);

  const changeStatus = useCallback(
    async (id: number, status: TaskStatus): Promise<void> => {
      await updateTaskStatus(id, status);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    },
    []
  );

  const removeTask = useCallback(async (id: number): Promise<void> => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, error, addTask, changeStatus, removeTask, refresh: load };
}
