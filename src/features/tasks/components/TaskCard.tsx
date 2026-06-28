import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Task, TaskPriority, TaskStatus } from "../../../types";

interface TaskCardProps {
  task: Task;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onRemove: (id: number) => void;
  onEdit: (task: Task) => void;
  selected?: boolean;
  onSelect?: (id: number) => void;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low:    "w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500",
  medium: "w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500",
  high:   "w-2 h-2 rounded-full bg-red-400 dark:bg-red-500",
};

function TaskCard({
  task,
  onChangeStatus,
  onRemove,
  onEdit,
  selected,
  onSelect,
}: TaskCardProps) {
  const { t } = useTranslation("tasks");

  // "synced" = tamamlandı, diğerleri = beklemede
  const isCompleted = task.status === "synced";

  const handleToggleCompletion = () => {
    onChangeStatus(task.id, isCompleted ? "active" : "synced");
  };

  const priority = task.priority ?? "medium";

  return (
    <View
      className={`mx-4 my-2 rounded-xl shadow-sm border p-4 ${
        isCompleted
          ? "bg-gray-50 dark:bg-gray-900 border-emerald-100 dark:border-emerald-900"
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
      }`}
    >
      <View className="flex-row items-start">
        {/* Rota seçim checkbox'ı — yalnızca rota-mod aktifken, orijinal konumda */}
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
                <Text className="text-white text-xs font-bold leading-none">
                  ✓
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* İçerik */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            {/* Sol: başlık, açıklama, meta */}
            <View className="flex-1 mr-3">
              <Text
                className={`text-base font-semibold ${
                  isCompleted
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-900 dark:text-gray-100"
                }`}
                numberOfLines={1}
              >
                {task.title}
              </Text>

              {/* Offline'da oluşturulup henüz senkronize edilmemiş task'lar */}
              {task.needsSync && !isCompleted && (
                <View className="flex-row items-center gap-0.5 mt-0.5">
                  <Ionicons name="cloud-upload-outline" size={10} color="#F59E0B" />
                  <Text className="text-xs text-amber-500 leading-none">
                    {t("pendingSync")}
                  </Text>
                </View>
              )}

              {task.description.length > 0 && (
                <Text
                  className={`text-sm mt-1 ${
                    isCompleted
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}

              <View className="flex-row items-center gap-1.5 mt-2">
                <View className={PRIORITY_DOT[priority]} />
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
                </Text>
              </View>
            </View>

            {/* Sağ üst: tamamlama toggle ikonu */}
            <TouchableOpacity
              onPress={handleToggleCompletion}
              activeOpacity={0.65}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
                size={26}
                color={isCompleted ? "#10B981" : "#D1D5DB"}
              />
            </TouchableOpacity>
          </View>

          {/* Alt aksiyonlar */}
          <View className="flex-row items-center justify-end gap-4 mt-3">
            <TouchableOpacity
              onPress={() => onEdit(task)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="flex-row items-center gap-1"
            >
              <Ionicons name="pencil-outline" size={13} color="#60A5FA" />
              <Text className="text-xs text-blue-400">{t("editButton")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onRemove(task.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-xs text-red-400">{t("deleteButton")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(TaskCard);
