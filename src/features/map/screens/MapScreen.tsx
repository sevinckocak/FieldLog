import { Text, TouchableOpacity, View } from "react-native";
import MapView, { LongPressEvent, MapType, Marker } from "react-native-maps";
import useLocation from "../../../hooks/useLocation";
import { useTask } from "../../../hooks/useTask";
import { useState } from "react";
import { Task } from "../../../types";
import AddTaskModal from "../components/AddTaskModal";

const MAP_TYPES: { label: string; value: MapType }[] = [
  { label: "Standard", value: "standard" },
  { label: "Satellite", value: "satellite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Terrain", value: "terrain" },
];

export default function MapScreen() {
  const { location, error: locationError } = useLocation();
  const { tasks, addTask } = useTask();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapType, setMapType] = useState<MapType>("hybrid");
  const [selectorVisible, setSelectorVisible] = useState(false);

  const handleLongPress = (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedCoord({ lat: latitude, lng: longitude });
    setModalVisible(true);
  };

  const handleSave = async (input: Omit<Task, "id" | "status">): Promise<void> => {
    await addTask({ ...input, status: "draft" });
  };

  const handleSelectMapType = (type: MapType) => {
    setMapType(type);
    setSelectorVisible(false);
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
        mapType={mapType}
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

      <View className="absolute top-4 right-4">
        <TouchableOpacity
          className="bg-white rounded-lg px-3 py-2 shadow"
          onPress={() => setSelectorVisible((v) => !v)}
        >
          <Text className="text-gray-800 font-medium text-sm">
            {MAP_TYPES.find((t) => t.value === mapType)?.label ?? "Harita"}
          </Text>
        </TouchableOpacity>

        {selectorVisible && (
          <View className="mt-1 bg-white rounded-lg shadow overflow-hidden">
            {MAP_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                className={`px-4 py-2 ${mapType === type.value ? "bg-blue-50" : "bg-white"}`}
                onPress={() => handleSelectMapType(type.value)}
              >
                <Text
                  className={`text-sm ${
                    mapType === type.value
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

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
