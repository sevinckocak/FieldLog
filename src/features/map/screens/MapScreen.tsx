import { Text, View } from "react-native";
import MapView, { LongPressEvent } from "react-native-maps";
import useLocation from "../../../hooks/useLocation";
import { useState } from "react";
import { Task } from "../../../types";
import AddTaskModal from "../components/AddTaskModal";

export default function MapScreen() {
  const { location, error } = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const handleLongPress = (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedCoord({ lat: latitude, lng: longitude });
    setModalVisible(true);
  };
  const handleSave = (task: Omit<Task, "id" | "status">) => {
    console.log("Yeni görev:", task);
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Konum alınıyor...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        mapType="hybrid"
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        onLongPress={handleLongPress}
      />
      {selectedCoord && (
        <AddTaskModal
          visible={modalVisible}
          lat={selectedCoord.lat}
          lng={selectedCoord.lng}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
        />
      )}
    </View>
  );
}
