import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import {
  getAllTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  markAsSynced,
  upsertTaskFromFirestore,
} from "../../db/taskRepository";
import {
  pushTaskToFirestore,
  deleteTaskFromFirestore,
  syncAllPending,
  fetchTasksFromFirestore,
} from "../../services/syncService";
import { Task, TaskStatus } from "../../types";
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

// 5 dakika önce fetch edilmişse Firestore'a tekrar gidilmez
const CACHE_TTL_MS = 5 * 60 * 1000;

export const fetchTasks = createAsyncThunk<Task[], { force?: boolean } | void>(
  "tasks/fetchAll",
  async (_, { getState }) => {
    const uid = (getState() as RootState).auth.user?.uid;

    if (uid) {
      try {
        // Önce offline bekleyenleri gönder, sonra Firestore'u kaynak al
        await syncAllPending(uid);
        const firestoreTasks = await fetchTasksFromFirestore(uid);
        const tasks: Task[] = [];
        for (const ft of firestoreTasks) {
          const task = await upsertTaskFromFirestore(ft.firestoreId, ft);
          tasks.push(task);
        }
        return tasks;
      } catch {
        // Offline: SQLite'tan yükle
        return getAllTasks();
      }
    }

    return getAllTasks();
  },
  {
    // Koşul: force değilse ve cache tazeyse Firestore'a gitme
    condition: (arg, { getState }) => {
      const force = (arg as { force?: boolean })?.force ?? false;
      if (force) return true;

      const state = getState() as RootState;
      const { lastFetched, ids } = state.tasks;
      const hasData = (ids as number[]).length > 0;

      if (lastFetched && hasData && Date.now() - lastFetched < CACHE_TTL_MS) {
        return false; // thunk iptal, loading state tetiklenmez
      }
      return true;
    },
  }
);

export const addTask = createAsyncThunk<Task, Omit<Task, "id">>(
  "tasks/add",
  async (input, { getState }) => {
    const task = await createTask(input);
    const uid = (getState() as RootState).auth.user?.uid;
    if (uid) {
      try {
        const firestoreId = await pushTaskToFirestore(task, uid);
        await markAsSynced(task.id, firestoreId);
        return { ...task, firestoreId, needsSync: false };
      } catch {
        // Offline: needs_sync = 1 SQLite'ta zaten var, sonraki senkronda gönderilir
      }
    }
    return task;
  }
);

export const updateStatus = createAsyncThunk<
  { id: number; status: TaskStatus; firestoreId?: string | null; needsSync: boolean },
  { id: number; status: TaskStatus }
>("tasks/updateStatus", async ({ id, status }, { getState }) => {
  await updateTaskStatus(id, status);

  const state = getState() as RootState;
  const uid = state.auth.user?.uid;
  const currentTask = state.tasks.entities[id];

  if (uid && currentTask) {
    try {
      const firestoreId = await pushTaskToFirestore({ ...currentTask, status }, uid);
      await markAsSynced(id, firestoreId);
      return { id, status, firestoreId, needsSync: false };
    } catch {
      // Offline: bir sonraki sync'te gönderilecek
    }
  }

  return { id, status, firestoreId: currentTask?.firestoreId, needsSync: true };
});

export const removeTask = createAsyncThunk<number, number>(
  "tasks/remove",
  async (id, { getState }) => {
    const state = getState() as RootState;
    const uid = state.auth.user?.uid;
    const firestoreId = state.tasks.entities[id]?.firestoreId;

    await deleteTask(id);

    if (uid && firestoreId) {
      try {
        await deleteTaskFromFirestore(firestoreId, uid);
      } catch {
        // Silme başarısız olsa da local zaten silindi
      }
    }

    return id;
  }
);

/**
 * SQLite'ta bekleyen tüm task'ları Firestore'a gönderir.
 * Uygulama açılırken ve ön plana gelirken çağrılır.
 */
export const syncPendingTasksAsync = createAsyncThunk<number>(
  "tasks/syncPending",
  async (_, { getState, dispatch }) => {
    const uid = (getState() as RootState).auth.user?.uid;
    if (!uid) return 0;
    const count = await syncAllPending(uid);
    if (count > 0) {
      // Sync sonrası firestoreId'lerin Redux'a yansıması için zorla yenile
      dispatch(fetchTasks({ force: true }));
    }
    return count;
  }
);

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

      // updateStatus
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
