export type TaskStatus = "active" | "draft" | "synced";

export interface Task {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: TaskStatus;
  firestoreId?: string | null;
  needsSync?: boolean;
}

export interface RoutePoint {
  taskId: number | "start";
  title: string;
  lat: number;
  lng: number;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}


