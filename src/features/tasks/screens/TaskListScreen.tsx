import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Task, TaskStatus } from "../../../types";
import { useTask } from "../../../hooks/useTask";
import { useAppDispatch } from "../../../store/hooks";
import { buildRoute, selectRouteLoading } from "../../../store/slices/routeSlice";
import { useAppSelector } from "../../../store/hooks";
import useLocation from "../../../hooks/useLocation";
import TaskCard from "../components/TaskCard";

const CARD_HEIGHT = 120;

function TaskListScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { tasks, loading, error, changeStatus, removeTask } = useTask();
  const { location } = useLocation();
  const routeLoading = useAppSelector(selectRouteLoading);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
    (id: number, status: TaskStatus) => {
      changeStatus(id, status);
    },
    [changeStatus]
  );

  const handleRemove = useCallback(
    (id: number) => {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      removeTask(id);
    },
    [removeTask]
  );

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item }) => (
      <TaskCard
        task={item}
        onChangeStatus={handleChangeStatus}
        onRemove={handleRemove}
        selected={selectedIds.includes(item.id)}
        onSelect={toggleSelect}
      />
    ),
    [handleChangeStatus, handleRemove, selectedIds, toggleSelect]
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
      <FlatList
        data={tasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        contentContainerStyle={
          tasks.length === 0
            ? { flex: 1 }
            : { paddingVertical: 8, paddingBottom: hasSelection ? 112 : 8 }
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 dark:text-gray-400 text-base">Henüz görev yok</Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Haritada uzun bas ve görev ekle
            </Text>
          </View>
        }
      />

      {/* Rota oluştur paneli */}
      {hasSelection && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
            {selectedIds.length} görev seçildi
          </Text>

          {routeLoading ? (
            <View className="items-center py-2">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">Rota hesaplanıyor...</Text>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                onPress={() => handleRoute(false)}
                disabled={!location}
              >
                <Text className="text-white font-semibold text-sm">Sıraya Göre</Text>
                <Text className="text-blue-100 text-xs mt-0.5">Seçtiğin sıra</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-emerald-500 rounded-xl py-3 items-center"
                onPress={() => handleRoute(true)}
                disabled={!location}
              >
                <Text className="text-white font-semibold text-sm">Optimize Et</Text>
                <Text className="text-emerald-100 text-xs mt-0.5">En yakından başla</Text>
              </TouchableOpacity>
            </View>
          )}

          {!location && (
            <Text className="text-xs text-red-400 text-center mt-1">
              Konum alınamadı, lütfen bekleyin
            </Text>
          )}

          <TouchableOpacity
            className="mt-2 items-center"
            onPress={() => setSelectedIds([])}
          >
            <Text className="text-xs text-gray-400 dark:text-gray-500">Seçimi Temizle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default React.memo(TaskListScreen);
