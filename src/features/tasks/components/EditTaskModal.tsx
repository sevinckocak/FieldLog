import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { Task, TaskPriority, TaskStatus } from "../../../types";

interface Props {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (input: {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
  }) => Promise<void>;
}

// NativeWind statik string gereksinimleri — tam class stringleri burada tanımlı
const SEG_ON  = "flex-1 py-2.5 rounded-xl items-center bg-blue-500";
const SEG_OFF = "flex-1 py-2.5 rounded-xl items-center bg-gray-100 dark:bg-gray-800";
const SEG_TEXT_ON  = "text-xs font-semibold text-white";
const SEG_TEXT_OFF = "text-xs font-medium text-gray-600 dark:text-gray-400";

const PRI_ON: Record<TaskPriority, string> = {
  low:    "flex-1 py-2.5 rounded-xl items-center bg-emerald-500",
  medium: "flex-1 py-2.5 rounded-xl items-center bg-amber-500",
  high:   "flex-1 py-2.5 rounded-xl items-center bg-red-500",
};
const PRI_TEXT_ON = "text-xs font-semibold text-white";

export default function EditTaskModal({ visible, task, onClose, onSave }: Props) {
  const { t } = useTranslation("tasks");
  const { t: tCommon } = useTranslation("common");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("draft");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Görevi modal açıldığında form alanlarına yükle
  useEffect(() => {
    if (task && visible) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority ?? "medium");
      setValidationError("");
      setSaveError("");
    }
  }, [task, visible]);

  const handleSave = async () => {
    if (!title.trim()) {
      setValidationError(t("editTask.validationTitle"));
      return;
    }
    if (!task || saving) return;

    setValidationError("");
    setSaveError("");
    setSaving(true);

    try {
      await onSave({
        id: task.id,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
      });
      onClose();
    } catch {
      setSaveError(t("editTask.errorSave"));
    } finally {
      setSaving(false);
    }
  };

  const STATUS_LABEL: Record<TaskStatus, string> = {
    draft: t("status.draft"),
    active: t("status.active"),
    synced: t("status.synced"),
  };

  const PRIORITY_LABEL: Record<TaskPriority, string> = {
    low: t("priority.low"),
    medium: t("priority.medium"),
    high: t("priority.high"),
  };

  const iconColor = isDark ? "#9CA3AF" : "#6B7280";
  const placeholderColor = isDark ? "#4B5563" : "#9CA3AF";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl">
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            >
              {/* ── Başlık satırı ── */}
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-gray-900 dark:text-white text-xl font-bold">
                  {t("editTask.modalTitle")}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={iconColor} />
                </TouchableOpacity>
              </View>

              {/* ── Konum bilgisi ── */}
              {task && (
                <Text className="text-gray-400 dark:text-gray-500 text-xs mb-5">
                  📍 {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
                </Text>
              )}

              {/* ── Başlık inputu ── */}
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                {t("editTask.titleLabel")}{" "}
                <Text className="text-red-400">*</Text>
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 mb-1"
                placeholder={t("editTask.titlePlaceholder")}
                placeholderTextColor={placeholderColor}
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  if (validationError) setValidationError("");
                }}
              />
              {validationError ? (
                <Text className="text-red-400 text-xs mb-3">{validationError}</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* ── Açıklama inputu ── */}
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                {t("editTask.descriptionLabel")}
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 mb-5"
                placeholder={t("editTask.descriptionPlaceholder")}
                placeholderTextColor={placeholderColor}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 80 }}
              />

              {/* ── Durum seçici ── */}
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                {t("editTask.statusLabel")}
              </Text>
              <View className="flex-row gap-2 mb-5">
                {(["draft", "active", "synced"] as TaskStatus[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    className={status === s ? SEG_ON : SEG_OFF}
                    activeOpacity={0.7}
                  >
                    <Text className={status === s ? SEG_TEXT_ON : SEG_TEXT_OFF}>
                      {STATUS_LABEL[s]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Öncelik seçici ── */}
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                {t("editTask.priorityLabel")}
              </Text>
              <View className="flex-row gap-2 mb-6">
                {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    className={priority === p ? PRI_ON[p] : SEG_OFF}
                    activeOpacity={0.7}
                  >
                    <Text className={priority === p ? PRI_TEXT_ON : SEG_TEXT_OFF}>
                      {PRIORITY_LABEL[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Kayıt hatası ── */}
              {saveError ? (
                <View className="flex-row items-center gap-2 mb-3 px-3 py-2 bg-red-50 dark:bg-red-950 rounded-xl">
                  <Ionicons name="alert-circle-outline" size={16} color="#F87171" />
                  <Text className="text-red-400 text-sm flex-1">{saveError}</Text>
                </View>
              ) : null}

              {/* ── Kaydet butonu ── */}
              <TouchableOpacity
                className={`rounded-xl py-4 items-center mb-3 ${saving ? "bg-blue-300" : "bg-blue-500"}`}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {tCommon("save")}
                  </Text>
                )}
              </TouchableOpacity>

              {/* ── İptal butonu ── */}
              <TouchableOpacity
                className="items-center py-3"
                onPress={onClose}
                disabled={saving}
              >
                <Text className="text-gray-500 dark:text-gray-400">
                  {tCommon("cancel")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
