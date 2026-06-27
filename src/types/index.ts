export type TaskStatus = "active" | "draft" | "synced";

export type TaskPriority = "low" | "medium" | "high";

export type TaskFilter = "all" | "pending" | "completed" | "today" | "high";

export type SortField = "date" | "priority";
export type SortOrder = "asc" | "desc";

export interface SortOption {
  field: SortField;
  order: SortOrder;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: TaskStatus;
  priority?: TaskPriority;
  /** Unix timestamp in seconds (SQLite strftime('%s','now')) */
  createdAt: number;
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
