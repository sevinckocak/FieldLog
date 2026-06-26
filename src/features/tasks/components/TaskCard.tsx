import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Task, TaskStatus } from "../../../types";

interface TaskCardProps {
  task: Task;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onRemove: (id: number) => void;
  selected?: boolean;
  onSelect?: (id: number) => void;
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  draft: "active",
  active: "synced",
  synced: "draft",
};

// NativeWind tam sınıf string'lerini statik görmeli — parçalara bölme
const STATUS_STYLES: Record<TaskStatus, { badge: string; text: string }> = {
  draft:  { badge: "bg-gray-100 dark:bg-gray-800",  text: "text-gray-600 dark:text-gray-400" },
  active: { badge: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-400" },
  synced: { badge: "bg-blue-100 dark:bg-blue-950",   text: "text-blue-700 dark:text-blue-400" },
};

function TaskCard({ task, onChangeStatus, onRemove, selected, onSelect }: TaskCardProps) {
  const { t } = useTranslation('tasks');

  const STATUS_LABEL: Record<TaskStatus, string> = {
    draft: t('status.draft'),
    active: t('status.active'),
    synced: t('status.synced'),
  };

  const handleCycleStatus = () => {
    onChangeStatus(task.id, STATUS_CYCLE[task.status]);
  };

  return (
    <View className="mx-4 my-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
      <View className="flex-row items-start">
        {/* Seçim checkbox'ı */}
        {onSelect !== undefined && (
          <TouchableOpacity
            onPress={() => onSelect(task.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mr-3 mt-1"
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center ${
                selected
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              }`}
            >
              {selected && (
                <Text className="text-white text-xs font-bold leading-none">✓</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* İçerik */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-semibold text-gray-900 dark:text-gray-100"
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.description.length > 0 && (
                <Text
                  className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCycleStatus}
              className={`px-2 py-1 rounded-full ${STATUS_STYLES[task.status].badge}`}
            >
              <Text className={`text-xs font-medium ${STATUS_STYLES[task.status].text}`}>
                {STATUS_LABEL[task.status]}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onRemove(task.id)} className="mt-3 self-end">
            <Text className="text-xs text-red-400">{t('deleteButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default React.memo(TaskCard);
