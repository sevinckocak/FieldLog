import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { runSyncQueue, type SyncProgress } from "../../services/syncQueue";

export type SyncPhase = "idle" | "syncing" | "success";

interface SyncState {
  phase: SyncPhase;
  total: number;
  done: number;
  failed: number;
  currentTaskTitle: string;
}

const initialState: SyncState = {
  phase: "idle",
  total: 0,
  done: 0,
  failed: 0,
  currentTaskTitle: "",
};

// Defined before createSlice so extraReducers can reference it.
// Thunk body references syncSlice.actions which is defined by the time
// the thunk is dispatched (JS closure — safe at runtime).
export const syncPendingWithProgress = createAsyncThunk<
  { synced: number; failed: number },
  string,
  { state: RootState }
>(
  "sync/run",
  async (uid, { dispatch }) => {
    return runSyncQueue(
      uid,
      (total) => dispatch(syncSlice.actions.startSync({ total })),
      (progress) => dispatch(syncSlice.actions.setProgress(progress))
    );
  },
  {
    // Only one sync at a time; rejected immediately if already running
    condition: (_, { getState }) => getState().sync.phase === "idle",
  }
);

const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    startSync(state, action: PayloadAction<{ total: number }>) {
      state.phase = "syncing";
      state.total = action.payload.total;
      state.done = 0;
      state.failed = 0;
      state.currentTaskTitle = "";
    },
    setProgress(state, action: PayloadAction<SyncProgress>) {
      state.done = action.payload.done;
      state.failed = action.payload.failed;
      state.currentTaskTitle = action.payload.currentTaskTitle;
    },
    resetSync(state) {
      state.phase = "idle";
      state.total = 0;
      state.done = 0;
      state.failed = 0;
      state.currentTaskTitle = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncPendingWithProgress.fulfilled, (state, action) => {
        const { synced } = action.payload;
        // Only show success UI if at least one task was synced
        state.phase = synced > 0 ? "success" : "idle";
      })
      .addCase(syncPendingWithProgress.rejected, (state) => {
        state.phase = "idle";
      });
  },
});

export const { startSync, setProgress, resetSync } = syncSlice.actions;

export const selectSyncPhase = (state: RootState) => state.sync.phase;
export const selectSyncTotal = (state: RootState) => state.sync.total;
export const selectSyncDone = (state: RootState) => state.sync.done;
export const selectSyncFailed = (state: RootState) => state.sync.failed;
export const selectSyncCurrentTask = (state: RootState) =>
  state.sync.currentTaskTitle;

export default syncSlice.reducer;
