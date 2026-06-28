import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import {
  getAllTasks,
  createTask,
  updateTask as updateTaskInDB,
  updateTaskStatus,
  deleteTask,
  upsertTaskFromFirestore,
} from "../../db/taskRepository";
import {
  deleteTaskFromFirestore,
  syncAllPending,
  fetchTasksFromFirestore,
} from "../../services/syncService";
import { syncPendingWithProgress } from "./syncSlice";
import { Task, TaskPriority, TaskStatus } from "../../types";
import type { RootState } from "../index";

const taskAdapter = createEntityAdapter<Task>();

interface TaskSliceState extends EntityState<Task, number> {
  loading: boolean;
  error: string | null;
  syncing: boolean;
  lastFetched: number | null;
}

const initialState: TaskSliceState = taskAdapter.getInitialState({
  loading: false,
  error: null,
  syncing: false,
  lastFetched: null,
});

const CACHE_TTL_MS = 5 * 60 * 1000;

export const fetchTasks = createAsyncThunk<Task[], { force?: boolean } | void>(
  "tasks/fetchAll",
  async (_, { getState }) => {
    const uid = (getState() as RootState).auth.user?.uid;

    if (uid) {
      try {
        await syncAllPending(uid);
        const firestoreTasks = await fetchTasksFromFirestore(uid);
        const tasks: Task[] = [];
        for (const ft of firestoreTasks) {
          const task = await upsertTaskFromFirestore(ft.firestoreId, ft);
          tasks.push(task);
        }
        return tasks;
      } catch {
        return getAllTasks();
      }
    }

    return getAllTasks();
  },
  {
    condition: (arg, { getState }) => {
      const force = (arg as { force?: boolean })?.force ?? false;
      if (force) return true;

      const state = getState() as RootState;
      const { lastFetched, ids } = state.tasks;
      const hasData = (ids as number[]).length > 0;

      if (lastFetched && hasData && Date.now() - lastFetched < CACHE_TTL_MS) {
        return false;
      }
      return true;
    },
  }
);

// ─── Offline-first: SQLite'a yaz → hemen dön → arka planda sync ────────────

export const addTask = createAsyncThunk<Task, Omit<Task, "id">, { state: RootState }>(
  "tasks/add",
  async (input, { getState, dispatch }) => {
    // SQLite'a yaz (anında, ağ beklemez)
    const task = await createTask(input);

    // Arka planda sync'i tetikle — condition zaten çalışıyorsa engeller
    const uid = (getState() as RootState).auth.user?.uid;
    if (uid) {
      dispatch(syncPendingWithProgress(uid));
    }

    return task; // needsSync: true olarak döner, badge gösterilir
  }
);

export const editTask = createAsyncThunk<
  Task,
  { id: number; title: string; description: string; status: TaskStatus; priority: TaskPriority },
  { state: RootState }
>(
  "tasks/edit",
  async ({ id, title, description, status, priority }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const currentTask = state.tasks.entities[id];
    if (!currentTask) throw new Error("Task not found");

    // SQLite güncelle (needs_sync=1 otomatik set edilir)
    await updateTaskInDB(id, { title, description, status, priority });

    const uid = state.auth.user?.uid;
    if (uid) {
      dispatch(syncPendingWithProgress(uid));
    }

    return {
      ...currentTask,
      title,
      description,
      status,
      priority,
      needsSync: true,
    };
  }
);

export const updateStatus = createAsyncThunk<
  { id: number; status: TaskStatus; firestoreId?: string | null; needsSync: boolean },
  { id: number; status: TaskStatus },
  { state: RootState }
>("tasks/updateStatus", async ({ id, status }, { getState, dispatch }) => {
  // SQLite güncelle (needs_sync=1 otomatik set edilir)
  await updateTaskStatus(id, status);

  const state = getState() as RootState;
  const uid = state.auth.user?.uid;
  const firestoreId = state.tasks.entities[id]?.firestoreId ?? null;

  if (uid) {
    dispatch(syncPendingWithProgress(uid));
  }

  // firestoreId'yi koru — sync queue güncelleme mi yoksa yeni kayıt mı yapacağını bilsin
  return { id, status, firestoreId, needsSync: true };
});

export const removeTask = createAsyncThunk<number, number>(
  "tasks/remove",
  async (id, { getState }) => {
    const state = getState() as RootState;
    const uid = state.auth.user?.uid;
    const firestoreId = state.tasks.entities[id]?.firestoreId;

    await deleteTask(id);

    // Fire-and-forget: ağ yoksa sessizce geçer
    if (uid && firestoreId) {
      deleteTaskFromFirestore(firestoreId, uid).catch(() => {});
    }

    return id;
  }
);

// Eski sync (useSyncOnResume geriye dönük uyumluluk için)
export const syncPendingTasksAsync = createAsyncThunk<number>(
  "tasks/syncPending",
  async (_, { getState, dispatch }) => {
    const uid = (getState() as RootState).auth.user?.uid;
    if (!uid) return 0;
    const count = await syncAllPending(uid);
    if (count > 0) {
      dispatch(fetchTasks({ force: true }));
    }
    return count;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetched = Date.now();
        taskAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Görevler yüklenemedi";
      })

      // addTask
      .addCase(addTask.fulfilled, (state, action) => {
        taskAdapter.addOne(state, action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.error.message ?? "Görev eklenemedi";
      })

      // editTask
      .addCase(editTask.fulfilled, (state, action) => {
        taskAdapter.upsertOne(state, action.payload);
      })
      .addCase(editTask.rejected, (state, action) => {
        state.error = action.error.message ?? "Görev güncellenemedi";
      })

      // updateStatus — pending anında UI günceller (optimistic), fulfilled DB'yi yansıtır
      .addCase(updateStatus.pending, (state, action) => {
        const { id, status } = action.meta.arg;
        taskAdapter.updateOne(state, { id, changes: { status, needsSync: true } });
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        taskAdapter.updateOne(state, {
          id: action.payload.id,
          changes: {
            status: action.payload.status,
            firestoreId: action.payload.firestoreId,
            needsSync: action.payload.needsSync,
          },
        });
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.error = action.error.message ?? "Durum güncellenemedi";
      })

      // removeTask
      .addCase(removeTask.fulfilled, (state, action) => {
        taskAdapter.removeOne(state, action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.error = action.error.message ?? "Görev silinemedi";
      })

      // syncPendingTasks
      .addCase(syncPendingTasksAsync.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncPendingTasksAsync.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncPendingTasksAsync.rejected, (state) => {
        state.syncing = false;
      });
  },
});

const adapterSelectors = taskAdapter.getSelectors(
  (state: RootState) => state.tasks
);

export const selectAllTasks = adapterSelectors.selectAll;
export const selectTaskById = adapterSelectors.selectById;
export const selectTaskIds = adapterSelectors.selectIds;
export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectTasksSyncing = (state: RootState) => state.tasks.syncing;
export const selectTasksLastFetched = (state: RootState) => state.tasks.lastFetched;

export default taskSlice.reducer;
