import { useCallback, useEffect } from "react";
import { Task, TaskStatus } from "../types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchTasks,
  addTask,
  updateStatus,
  removeTask,
  selectAllTasks,
  selectTasksLoading,
  selectTasksError,
} from "../store/slices/taskSlice";

interface UseTaskReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (input: Omit<Task, "id">) => Promise<Task>;
  changeStatus: (id: number, status: TaskStatus) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
  refresh: () => void;
}

export function useTask(): UseTaskReturn {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);
  const loading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);

  const refresh = useCallback(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleAddTask = useCallback(
    async (input: Omit<Task, "id">): Promise<Task> => {
      const result = await dispatch(addTask(input)).unwrap();
      return result;
    },
    [dispatch]
  );

  const changeStatus = useCallback(
    async (id: number, status: TaskStatus): Promise<void> => {
      await dispatch(updateStatus({ id, status })).unwrap();
    },
    [dispatch]
  );

  const handleRemoveTask = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(removeTask(id)).unwrap();
    },
    [dispatch]
  );

  return {
    tasks,
    loading,
    error,
    addTask: handleAddTask,
    changeStatus,
    removeTask: handleRemoveTask,
    refresh,
  };
}
