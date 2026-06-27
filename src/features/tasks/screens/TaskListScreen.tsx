import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Task, TaskFilter, TaskStatus } from "../../../types";
import { useTask } from "../../../hooks/useTask";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { buildRoute, selectRouteLoading } from "../../../store/slices/routeSlice";
import useLocation from "../../../hooks/useLocation";
import TaskCard from "../components/TaskCard";
import EditTaskModal from "../components/EditTaskModal";
import TaskFilterBar from "../components/TaskFilterBar";

const CARD_HEIGHT = 120;

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
        // created_at is Unix seconds in SQLite
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

function TaskListScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation("tasks");
  const { tasks, loading, error, editTask, changeStatus, removeTask } = useTask();
  const { location } = useLocation();
  const routeLoading = useAppSelector(selectRouteLoading);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

  const filteredTasks = useMemo(
    () => applyFilter(tasks, activeFilter),
    [tasks, activeFilter]
  );

  const handleFilterChange = useCallback((filter: TaskFilter) => {
    setActiveFilter(filter);
    setSelectedIds([]);
  }, []);

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

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditingTask(null);
  }, []);

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

  const hasSelection = selectedIds.length > 0;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <TaskFilterBar active={activeFilter} onChange={handleFilterChange} />

      <FlatList
        data={filteredTasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        contentContainerStyle={
          filteredTasks.length === 0
            ? { flex: 1 }
            : { paddingVertical: 8, paddingBottom: hasSelection ? 112 : 8 }
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 dark:text-gray-400 text-base">
              {t("emptyTitle")}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {t("emptySubtitle")}
            </Text>
          </View>
        }
      />

      {/* Rota oluştur paneli */}
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

      {/* Edit Modal */}
      <EditTaskModal
        visible={editingTask !== null}
        task={editingTask}
        onClose={handleEditClose}
        onSave={editTask}
      />
    </View>
  );
}

export default React.memo(TaskListScreen);
