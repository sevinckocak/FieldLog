import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { TaskFilter } from "../../../types";

interface FilterOption {
  key: TaskFilter;
  labelKey: string;
}

const FILTERS: FilterOption[] = [
  { key: "all",       labelKey: "filter.all" },
  { key: "pending",   labelKey: "filter.pending" },
  { key: "completed", labelKey: "filter.completed" },
  { key: "today",     labelKey: "filter.today" },
  { key: "high",      labelKey: "filter.high" },
];

interface Props {
  active: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}

function TaskFilterBar({ active, onChange }: Props) {
  const { t } = useTranslation("tasks");

  return (
    <View className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map(({ key, labelKey }) => {
          const isActive = active === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onChange(key)}
              activeOpacity={0.7}
              className={
                isActive
                  ? "px-4 py-2 rounded-full bg-blue-500"
                  : "px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800"
              }
            >
              <Text
                className={
                  isActive
                    ? "text-sm font-semibold text-white"
                    : "text-sm font-medium text-gray-600 dark:text-gray-300"
                }
              >
                {t(labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
});

export default React.memo(TaskFilterBar);
