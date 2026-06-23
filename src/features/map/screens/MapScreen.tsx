import { useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MapView, {
  LongPressEvent,
  MapType,
  Marker,
  Polyline,
} from "react-native-maps";
import useLocation from "../../../hooks/useLocation";
import { useTask } from "../../../hooks/useTask";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  clearRoute,
  selectRouteActive,
  selectRouteOptimized,
  selectRoutePoints,
  selectRoutePolyline,
} from "../../../store/slices/routeSlice";
import { useState } from "react";
import { Task } from "../../../types";
import AddTaskModal from "../components/AddTaskModal";

const MAP_TYPES: { label: string; value: MapType }[] = [
  { label: "Standard", value: "standard" },
  { label: "Satellite", value: "satellite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Terrain", value: "terrain" },
];

// Rota noktası tipine göre marker rengi
function routeMarkerColor(index: number, total: number): string {
  if (index === 0) return "#22c55e";     // Başlangıç → yeşil
  if (index === total - 1) return "#ef4444"; // Son → kırmızı
  return "#f97316";                          // Ara durak → turuncu
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const dispatch = useAppDispatch();
  const { location, error: locationError } = useLocation();
  const { tasks, addTask } = useTask();

  // Rota state
  const routeActive = useAppSelector(selectRouteActive);
  const routePoints = useAppSelector(selectRoutePoints);
  const routePolyline = useAppSelector(selectRoutePolyline);
  const routeOptimized = useAppSelector(selectRouteOptimized);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapType, setMapType] = useState<MapType>("hybrid");
  const [selectorVisible, setSelectorVisible] = useState(false);

  // Rota aktif olduğunda tüm noktaları ekrana sığdır
  useEffect(() => {
    if (!routeActive || routePoints.length === 0 || !mapRef.current) return;

    const coords = routePoints.map((p) => ({
      latitude: p.lat,
      longitude: p.lng,
    }));

    // Kısa gecikme: harita tam render olduktan sonra fit et
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 50, bottom: 160, left: 50 },
        animated: true,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [routeActive, routePoints]);

  const handleLongPress = (event: LongPressEvent) => {
    if (routeActive) return; // Rota modunda uzun basma devre dışı
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
        ref={mapRef}
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
        {/* Normal mod: tüm görev marker'ları */}
        {!routeActive &&
          tasks.map((task) => (
            <Marker
              key={task.id}
              coordinate={{ latitude: task.lat, longitude: task.lng }}
              title={task.title}
              description={task.description}
              pinColor={task.status === "active" ? "#22c55e" : "#3b82f6"}
            />
          ))}

        {/* Rota modu: rota noktaları + polyline */}
        {routeActive && (
          <>
            {/* Gerçek yol veya düz çizgi */}
            {routePolyline && routePolyline.length > 0 && (
              <Polyline
                coordinates={routePolyline}
                strokeColor="#3b82f6"
                strokeWidth={4}
                lineDashPattern={undefined}
              />
            )}

            {/* Rota marker'ları */}
            {routePoints.map((point, index) => (
              <Marker
                key={`route-${index}`}
                coordinate={{ latitude: point.lat, longitude: point.lng }}
                title={
                  index === 0
                    ? "Başlangıç"
                    : index === routePoints.length - 1
                    ? `Son Durak • ${point.title}`
                    : `${index}. Durak • ${point.title}`
                }
                description={
                  index === 0
                    ? "Mevcut konumunuz"
                    : `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
                }
                pinColor={routeMarkerColor(index, routePoints.length)}
              />
            ))}
          </>
        )}
      </MapView>

      {/* Harita tipi seçici */}
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
                className={`px-4 py-2 ${
                  mapType === type.value ? "bg-blue-50" : "bg-white"
                }`}
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

      {/* Rota bilgi paneli */}
      {routeActive && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-800">
              {routeOptimized ? "Optimize Edilmiş Rota" : "Seçili Sıra Rotası"}
            </Text>
            <TouchableOpacity
              onPress={() => dispatch(clearRoute())}
              className="bg-red-50 px-3 py-1.5 rounded-lg"
            >
              <Text className="text-red-500 text-xs font-medium">Rotayı İptal Et</Text>
            </TouchableOpacity>
          </View>

          {/* Durak listesi */}
          <View className="flex-row flex-wrap gap-1">
            {routePoints.map((point, index) => (
              <View
                key={index}
                className={`flex-row items-center px-2 py-1 rounded-full ${
                  index === 0
                    ? "bg-green-100"
                    : index === routePoints.length - 1
                    ? "bg-red-100"
                    : "bg-orange-100"
                }`}
              >
                <View
                  className={`w-3 h-3 rounded-full mr-1 ${
                    index === 0
                      ? "bg-green-500"
                      : index === routePoints.length - 1
                      ? "bg-red-500"
                      : "bg-orange-500"
                  }`}
                />
                <Text
                  className="text-xs text-gray-700"
                  numberOfLines={1}
                  style={{ maxWidth: 80 }}
                >
                  {index === 0 ? "Konum" : point.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Görev ekleme modal'ı (sadece normal modda) */}
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
