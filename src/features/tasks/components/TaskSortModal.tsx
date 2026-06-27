import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { SortField, SortOption, SortOrder } from "../../../types";

interface SortItem {
  field: SortField;
  order: SortOrder;
  labelKey: string;
}

const SORT_OPTIONS: SortItem[] = [
  { field: "date",     order: "desc", labelKey: "sort.dateDesc" },
  { field: "date",     order: "asc",  labelKey: "sort.dateAsc" },
  { field: "priority", order: "desc", labelKey: "sort.priorityDesc" },
  { field: "priority", order: "asc",  labelKey: "sort.priorityAsc" },
];

interface Props {
  visible: boolean;
  current: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
}

function TaskSortModal({ visible, current, onSelect, onClose }: Props) {
  const { t } = useTranslation("tasks");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";

  const isSelected = (item: SortItem) =>
    item.field === current.field && item.order === current.order;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose}>
          <View className="flex-1 bg-black/40" />
        </Pressable>

        {/* Sheet */}
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl px-6 pt-5 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              {t("sort.title")}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          {SORT_OPTIONS.map((item, index) => {
            const active = isSelected(item);
            const isLast = index === SORT_OPTIONS.length - 1;

            return (
              <TouchableOpacity
                key={`${item.field}-${item.order}`}
                onPress={() => {
                  onSelect({ field: item.field, order: item.order });
                  onClose();
                }}
                activeOpacity={0.65}
                className={`flex-row items-center py-4 ${
                  !isLast ? "border-b border-gray-100 dark:border-gray-800" : ""
                }`}
              >
                {/* Radio dot */}
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    active
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {active && (
                    <View className="w-2 h-2 rounded-full bg-white" />
                  )}
                </View>

                {/* Label */}
                <Text
                  className={`flex-1 text-base ${
                    active
                      ? "text-blue-500 font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {t(item.labelKey)}
                </Text>

                {/* Active checkmark */}
                {active && (
                  <Ionicons name="checkmark" size={18} color="#3B82F6" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

export default React.memo(TaskSortModal);
