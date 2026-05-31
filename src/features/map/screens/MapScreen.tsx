import { Text, View } from "react-native";
import MapView, { LongPressEvent, Marker } from "react-native-maps";
import useLocation from "../../../hooks/useLocation";
import { useTask } from "../../../hooks/useTask";
import { useState } from "react";
import { Task } from "../../../types";
import AddTaskModal from "../components/AddTaskModal";

export default function MapScreen() {
  const { location, error: locationError } = useLocation();
  const { tasks, addTask } = useTask();

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

  const handleSave = async (input: Omit<Task, "id" | "status">): Promise<void> => {
    await addTask({ ...input, status: "draft" });
  };

  if (locationError) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{locationError}</Text>
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
      >
        {tasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{ latitude: task.lat, longitude: task.lng }}
            title={task.title}
            description={task.description}
            pinColor={task.status === "active" ? "#22c55e" : "#3b82f6"}
          />
        ))}
      </MapView>

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
