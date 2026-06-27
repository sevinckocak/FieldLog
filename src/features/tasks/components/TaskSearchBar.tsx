import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  isSortActive: boolean;
  onSortPress: () => void;
}

function TaskSearchBar({
  value,
  onChangeText,
  onClear,
  isSortActive,
  onSortPress,
}: Props) {
  const { t } = useTranslation("tasks");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#9CA3AF" : "#6B7280";
  const placeholderColor = isDark ? "#4B5563" : "#9CA3AF";

  return (
    <View
      style={styles.row}
      className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
    >
      {/* Search input */}
      <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5">
        <Ionicons
          name="search-outline"
          size={16}
          color={iconColor}
          style={styles.searchIcon}
        />
        <TextInput
          className="flex-1 text-sm text-gray-900 dark:text-gray-100"
          placeholder={t("search.placeholder")}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={17} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort button */}
      <TouchableOpacity
        onPress={onSortPress}
        activeOpacity={0.7}
        className={`p-2.5 rounded-xl ${
          isSortActive ? "bg-blue-500" : "bg-gray-100 dark:bg-gray-800"
        }`}
      >
        <Ionicons
          name="swap-vertical-outline"
          size={18}
          color={isSortActive ? "#ffffff" : iconColor}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
});

export default React.memo(TaskSearchBar);
