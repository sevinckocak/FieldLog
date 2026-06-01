import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  View,
} from "react-native";
import { Task, TaskStatus } from "../../../types";
import { useTask } from "../../../hooks/useTask";
import TaskCard from "../components/TaskCard";

const CARD_HEIGHT = 120;

function TaskListScreen() {
  const { tasks, loading, error, changeStatus, removeTask } = useTask();

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
      />
    ),
    [handleChangeStatus, handleRemove]
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      removeClippedSubviews
      contentContainerStyle={tasks.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-base">Henüz görev yok</Text>
          <Text className="text-gray-300 text-sm mt-1">
            Haritada uzun bas ve görev ekle
          </Text>
        </View>
      }
    />
  );
}

export default React.memo(TaskListScreen);
