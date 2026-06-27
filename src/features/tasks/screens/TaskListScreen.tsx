import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import {
  SortOption,
  Task,
  TaskFilter,
  TaskPriority,
  TaskStatus,
} from "../../../types";
import { useTask } from "../../../hooks/useTask";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { buildRoute, selectRouteLoading } from "../../../store/slices/routeSlice";
import useLocation from "../../../hooks/useLocation";
import TaskCard from "../components/TaskCard";
import EditTaskModal from "../components/EditTaskModal";
import TaskFilterBar from "../components/TaskFilterBar";
import TaskSearchBar from "../components/TaskSearchBar";
import TaskSortModal from "../components/TaskSortModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_HEIGHT = 120;

const DEFAULT_SORT: SortOption = { field: "date", order: "desc" };

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 2,
  medium: 1,
  low: 0,
};

// ─── Pure pipeline functions ───────────────────────────────────────────────────

function applyFilter(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case "pending":
      return tasks.filter((t) => t.status === "draft" || t.status === "active");
    case "completed":
      return tasks.filter((t) => t.status === "synced");
    case "today": {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const d = now.getDate();
      return tasks.filter((t) => {
        const td = new Date(t.createdAt * 1000);
        return td.getFullYear() === y && td.getMonth() === m && td.getDate() === d;
      });
    }
    case "high":
      return tasks.filter((t) => t.priority === "high");
    default:
      return tasks;
  }
}

function applySearch(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  );
}

function applySort(tasks: Task[], sort: SortOption): Task[] {
  return [...tasks].sort((a, b) => {
    if (sort.field === "date") {
      return sort.order === "desc"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt;
    }
    // priority
    const pa = PRIORITY_RANK[a.priority ?? "medium"];
    const pb = PRIORITY_RANK[b.priority ?? "medium"];
    return sort.order === "desc" ? pb - pa : pa - pb;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

function TaskListScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation("tasks");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { tasks, loading, error, editTask, changeStatus, removeTask } = useTask();
  const { location } = useLocation();
  const routeLoading = useAppSelector(selectRouteLoading);

  // ── UI state ──
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT);
  const [showSortModal, setShowSortModal] = useState(false);

  // ── Derived: filter → search → sort (no Firestore calls) ──
  const displayTasks = useMemo(
    () => applySort(applySearch(applyFilter(tasks, activeFilter), searchQuery), sortOption),
    [tasks, activeFilter, searchQuery, sortOption]
  );

  const isSortActive =
    sortOption.field !== DEFAULT_SORT.field ||
    sortOption.order !== DEFAULT_SORT.order;

  // ── Handlers ──
  const handleFilterChange = useCallback((filter: TaskFilter) => {
    setActiveFilter(filter);
    setSelectedIds([]);
  }, []);

  const handleSearchClear = useCallback(() => setSearchQuery(""), []);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleRoute = useCallback(
    async (optimize: boolean) => {
      if (!location || selectedIds.length === 0) return;

      const selectedTasks = selectedIds
        .map((id) => tasks.find((t) => t.id === id))
        .filter((t): t is Task => t !== undefined);

      await dispatch(
        buildRoute({ tasks: selectedTasks, userLocation: location, optimize })
      );

      setSelectedIds([]);
      (navigation as any).navigate("Harita");
    },
    [dispatch, location, navigation, selectedIds, tasks]
  );

  const keyExtractor = useCallback((item: Task) => String(item.id), []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Task> | null | undefined, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    []
  );

  const handleChangeStatus = useCallback(
    (id: number, status: TaskStatus) => changeStatus(id, status),
    [changeStatus]
  );

  const handleRemove = useCallback(
    (id: number) => {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      removeTask(id);
    },
    [removeTask]
  );

  const handleEdit = useCallback((task: Task) => setEditingTask(task), []);
  const handleEditClose = useCallback(() => setEditingTask(null), []);

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item }) => (
      <TaskCard
        task={item}
        onChangeStatus={handleChangeStatus}
        onRemove={handleRemove}
        onEdit={handleEdit}
        selected={selectedIds.includes(item.id)}
        onSelect={toggleSelect}
      />
    ),
    [handleChangeStatus, handleRemove, handleEdit, selectedIds, toggleSelect]
  );

  // ─── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-gray-50 dark:bg-gray-950">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const hasSelection = selectedIds.length > 0;
  const emptyIconColor = isDark ? "#374151" : "#D1D5DB";

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search bar + sort button */}
      <TaskSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleSearchClear}
        isSortActive={isSortActive}
        onSortPress={() => setShowSortModal(true)}
      />

      {/* Filter chips */}
      <TaskFilterBar active={activeFilter} onChange={handleFilterChange} />

      {/* Task list */}
      <FlatList
        data={displayTasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          displayTasks.length === 0
            ? { flex: 1 }
            : { paddingVertical: 8, paddingBottom: hasSelection ? 112 : 8 }
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6">
            {searchQuery.trim() ? (
              <>
                <Ionicons
                  name="search-outline"
                  size={44}
                  color={emptyIconColor}
                />
                <Text className="text-gray-500 dark:text-gray-400 text-base text-center mt-3">
                  {t("search.noResults", { query: searchQuery.trim() })}
                </Text>
                <TouchableOpacity
                  onPress={handleSearchClear}
                  className="mt-3 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800"
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-300">
                    {t("search.clearSearch")}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-gray-500 dark:text-gray-400 text-base">
                  {t("emptyTitle")}
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  {t("emptySubtitle")}
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Route panel */}
      {hasSelection && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
            {t("routePanel.selectedCount", { count: selectedIds.length })}
          </Text>

          {routeLoading ? (
            <View className="items-center py-2">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t("routePanel.calculating")}
              </Text>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                onPress={() => handleRoute(false)}
                disabled={!location}
              >
                <Text className="text-white font-semibold text-sm">
                  {t("routePanel.byOrder")}
                </Text>
                <Text className="text-blue-100 text-xs mt-0.5">
                  {t("routePanel.byOrderHint")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-emerald-500 rounded-xl py-3 items-center"
                onPress={() => handleRoute(true)}
                disabled={!location}
              >
                <Text className="text-white font-semibold text-sm">
                  {t("routePanel.optimize")}
                </Text>
                <Text className="text-emerald-100 text-xs mt-0.5">
                  {t("routePanel.optimizeHint")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!location && (
            <Text className="text-xs text-red-400 text-center mt-1">
              {t("routePanel.locationError")}
            </Text>
          )}

          <TouchableOpacity
            className="mt-2 items-center"
            onPress={() => setSelectedIds([])}
          >
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {t("routePanel.clearSelection")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <EditTaskModal
        visible={editingTask !== null}
        task={editingTask}
        onClose={handleEditClose}
        onSave={editTask}
      />

      <TaskSortModal
        visible={showSortModal}
        current={sortOption}
        onSelect={setSortOption}
        onClose={() => setShowSortModal(false)}
      />
    </View>
  );
}

export default React.memo(TaskListScreen);
