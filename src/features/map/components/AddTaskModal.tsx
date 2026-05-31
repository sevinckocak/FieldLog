import { useState } from "react";
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Task } from "../../../types";

interface Props {
  visible: boolean;
  lat: number;
  lng: number;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "status">) => Promise<void>;
}
export default function AddTaskModal({
  visible,
  lat,
  lng,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), lat, lng });
      setTitle("");
      setDescription("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end">
        <View className="bg-gray-900 rounded-t-3xl p-6">
          <Text className="text-white text-xl font-bold mb-4">Görev Ekle</Text>
          <Text className="text-gray-400 text-sm mb-4">
            📍 {lat.toFixed(5)}, {lng.toFixed(5)}
          </Text>
          <TextInput
            className="bg-gray-800 text-white rounded-xl p-4 mb-3"
            placeholder="Başlık"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="bg-gray-800 text-white rounded-xl p-4 mb-6"
            placeholder="Açıklama"
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            className={`rounded-xl p-4 items-center mb-3 ${saving ? "bg-blue-300" : "bg-blue-500"}`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Kaydet</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="items-center p-3" onPress={onClose}>
            <Text className="text-gray-400">İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
