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
} from "../../db/taskRepository";
import { Task, TaskStatus } from "../../types";
import type { RootState } from "../index";

const taskAdapter = createEntityAdapter<Task>();

interface TaskSliceState extends EntityState<Task, number> {
  loading: boolean;
  error: string | null;
}

const initialState: TaskSliceState = taskAdapter.getInitialState({
  loading: false,
  error: null,
});

export const fetchTasks = createAsyncThunk<Task[]>(
  "tasks/fetchAll",
  async () => getAllTasks()
);

export const addTask = createAsyncThunk<Task, Omit<Task, "id">>(
  "tasks/add",
  async (input) => createTask(input)
);

export const updateStatus = createAsyncThunk<
  { id: number; status: TaskStatus },
  { id: number; status: TaskStatus }
>("tasks/updateStatus", async ({ id, status }) => {
  await updateTaskStatus(id, status);
  return { id, status };
});

export const removeTask = createAsyncThunk<number, number>(
  "tasks/remove",
  async (id) => {
    await deleteTask(id);
    return id;
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        taskAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Görevler yüklenemedi";
      })

      .addCase(addTask.fulfilled, (state, action) => {
        taskAdapter.addOne(state, action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.error.message ?? "Görev eklenemedi";
      })

      .addCase(updateStatus.fulfilled, (state, action) => {
        taskAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { status: action.payload.status },
        });
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.error = action.error.message ?? "Durum güncellenemedi";
      })

      .addCase(removeTask.fulfilled, (state, action) => {
        taskAdapter.removeOne(state, action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.error = action.error.message ?? "Görev silinemedi";
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

export default taskSlice.reducer;
