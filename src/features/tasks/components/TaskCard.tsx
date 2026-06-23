import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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

const STATUS_LABEL: Record<TaskStatus, string> = {
  draft: "Taslak",
  active: "Aktif",
  synced: "Senkronize",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  synced: "bg-blue-100 text-blue-700",
};

function TaskCard({ task, onChangeStatus, onRemove, selected, onSelect }: TaskCardProps) {
  const handleCycleStatus = () => {
    onChangeStatus(task.id, STATUS_CYCLE[task.status]);
  };

  return (
    <View className="mx-4 my-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <View className="flex-row items-start">
        {/* Checkbox (seçim modunda gösterilir) */}
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
                  : "border-gray-300 bg-white"
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
                className="text-base font-semibold text-gray-900"
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.description.length > 0 && (
                <Text
                  className="text-sm text-gray-500 mt-1"
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}
              <Text className="text-xs text-gray-400 mt-2">
                {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCycleStatus}
              className={`px-2 py-1 rounded-full ${STATUS_COLOR[task.status].split(" ")[0]}`}
            >
              <Text
                className={`text-xs font-medium ${STATUS_COLOR[task.status].split(" ")[1]}`}
              >
                {STATUS_LABEL[task.status]}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onRemove(task.id)} className="mt-3 self-end">
            <Text className="text-xs text-red-400">Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default React.memo(TaskCard);
