import { useEffect, useState } from "react";
import * as Location from "expo-location";

interface LocationState {
  lat: number;
  lng: number;
}

export default function useLocation() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError("Konum izni verilmedi");
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          lat: current.coords.latitude,
          lng: current.coords.longitude,
        });
      } catch {
        setError("Konum alınamadı. Lütfen tekrar deneyin.");
      }
    })();
  }, []);

  return { location, error };
}
