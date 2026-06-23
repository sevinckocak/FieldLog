import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Task, RoutePoint, LatLng } from "../../types";
import { fetchOSRMRoute, nearestNeighborSort } from "../../services/routeService";
import type { RootState } from "../index";

interface RouteState {
  active: boolean;
  points: RoutePoint[];
  polyline: LatLng[] | null;
  loading: boolean;
  error: string | null;
  optimized: boolean;
}

const initialState: RouteState = {
  active: false,
  points: [],
  polyline: null,
  loading: false,
  error: null,
  optimized: false,
};

interface BuildRouteArgs {
  tasks: Task[];
  userLocation: { lat: number; lng: number };
  optimize: boolean;
}

interface BuildRouteResult {
  points: RoutePoint[];
  polyline: LatLng[];
  optimized: boolean;
}

/**
 * Seçili görevlerden rota oluşturur.
 * optimize: true → nearest-neighbor ile sıralar
 * optimize: false → kullanıcının seçtiği sırayı korur
 * OSRM başarısız olursa düz çizgi fallback uygulanır; thunk hiçbir zaman reject edilmez.
 */
export const buildRoute = createAsyncThunk<BuildRouteResult, BuildRouteArgs>(
  "route/build",
  async ({ tasks, userLocation, optimize }) => {
    const orderedTasks = optimize
      ? nearestNeighborSort(userLocation, tasks)
      : tasks;

    const allCoords = [
      userLocation,
      ...orderedTasks.map((t) => ({ lat: t.lat, lng: t.lng })),
    ];

    const points: RoutePoint[] = [
      {
        taskId: "start",
        title: "Mevcut Konumunuz",
        lat: userLocation.lat,
        lng: userLocation.lng,
      },
      ...orderedTasks.map((t) => ({
        taskId: t.id,
        title: t.title,
        lat: t.lat,
        lng: t.lng,
      })),
    ];

    // Gerçek yol verisi; başarısız olursa düz çizgi
    const osrmPolyline = await fetchOSRMRoute(allCoords);
    const polyline: LatLng[] =
      osrmPolyline ??
      allCoords.map((c) => ({ latitude: c.lat, longitude: c.lng }));

    return { points, polyline, optimized: optimize };
  }
);

const routeSlice = createSlice({
  name: "route",
  initialState,
  reducers: {
    clearRoute: (state) => {
      state.active = false;
      state.points = [];
      state.polyline = null;
      state.error = null;
      state.optimized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(buildRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.active = false;
      })
      .addCase(buildRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.active = true;
        state.points = action.payload.points;
        state.polyline = action.payload.polyline;
        state.optimized = action.payload.optimized;
      })
      .addCase(buildRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Rota oluşturulamadı";
      });
  },
});

export const { clearRoute } = routeSlice.actions;

export const selectRouteActive = (state: RootState) => state.route.active;
export const selectRoutePoints = (state: RootState) => state.route.points;
export const selectRoutePolyline = (state: RootState) => state.route.polyline;
export const selectRouteLoading = (state: RootState) => state.route.loading;
export const selectRouteError = (state: RootState) => state.route.error;
export const selectRouteOptimized = (state: RootState) => state.route.optimized;

export default routeSlice.reducer;
