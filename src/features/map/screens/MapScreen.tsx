import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, {
  LongPressEvent,
  MapType,
  Marker,
  Polyline,
} from "react-native-maps";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../hooks/useTheme";
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
import { Task } from "../../../types";
import AddTaskModal from "../components/AddTaskModal";
import ThemeSwitch from "../components/ThemeSwitch";

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
  const { colors } = useTheme();
  const { t: tMap } = useTranslation('map');
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
        <Text className="text-gray-500">{tMap('locationLoading')}</Text>
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
                    ? tMap('route.startPoint')
                    : index === routePoints.length - 1
                    ? tMap('route.lastStop', { title: point.title })
                    : tMap('route.stop', { index, title: point.title })
                }
                description={
                  index === 0
                    ? tMap('route.currentLocation')
                    : `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
                }
                pinColor={routeMarkerColor(index, routePoints.length)}
              />
            ))}
          </>
        )}
      </MapView>

      {/* Theme switch - sol üst */}
      <View className="absolute top-4 left-4">
        <ThemeSwitch />
      </View>

      {/* Harita tipi seçici - sağ üst */}
      <View className="absolute top-4 right-4">
        <TouchableOpacity
          className="rounded-lg px-3 py-2"
          style={[styles.shadow, { backgroundColor: colors.mapOverlay }]}
          onPress={() => setSelectorVisible((v) => !v)}
        >
          <Text className="font-medium text-sm" style={{ color: colors.textPrimary }}>
            {MAP_TYPES.find((t) => t.value === mapType)?.label ?? tMap('mapTypeButton')}
          </Text>
        </TouchableOpacity>

        {selectorVisible && (
          <View
            className="mt-1 rounded-lg overflow-hidden"
            style={[styles.shadow, { backgroundColor: colors.mapOverlay }]}
          >
            {MAP_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                className="px-4 py-2"
                style={{
                  backgroundColor:
                    mapType === type.value ? colors.primaryLight : 'transparent',
                }}
                onPress={() => handleSelectMapType(type.value)}
              >
                <Text
                  className="text-sm"
                  style={{
                    color: mapType === type.value ? colors.primary : colors.textSecondary,
                    fontWeight: mapType === type.value ? '600' : 'normal',
                  }}
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
        <View
          className="absolute bottom-0 left-0 right-0 px-4 py-3"
          style={{
            backgroundColor: colors.mapOverlay,
            borderTopWidth: 1,
            borderTopColor: colors.mapOverlayBorder,
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
              {routeOptimized ? tMap('route.optimized') : tMap('route.selectedOrder')}
            </Text>
            <TouchableOpacity
              onPress={() => dispatch(clearRoute())}
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: colors.dangerLight }}
            >
              <Text className="text-xs font-medium" style={{ color: colors.dangerText }}>
                {tMap('route.cancel')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Durak listesi */}
          <View className="flex-row flex-wrap gap-1">
            {routePoints.map((point, index) => {
              const isStart = index === 0;
              const isEnd = index === routePoints.length - 1;
              const badgeBg = isStart
                ? colors.successLight
                : isEnd
                ? colors.dangerLight
                : colors.warningLight;
              const dotColor = isStart
                ? colors.success
                : isEnd
                ? colors.danger
                : colors.warning;
              return (
                <View
                  key={index}
                  className="flex-row items-center px-2 py-1 rounded-full"
                  style={{ backgroundColor: badgeBg }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      marginRight: 4,
                      backgroundColor: dotColor,
                    }}
                  />
                  <Text
                    className="text-xs"
                    style={{ color: colors.textPrimary, maxWidth: 80 }}
                    numberOfLines={1}
                  >
                    {isStart ? tMap('route.startLabel') : point.title}
                  </Text>
                </View>
              );
            })}
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

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
