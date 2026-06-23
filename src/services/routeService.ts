import { Task, LatLng } from "../types";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Seçilen görevleri kullanıcı konumuna yakınlık sırasına göre sıralar.
 */
export function nearestNeighborSort(
  start: { lat: number; lng: number },
  tasks: Task[]
): Task[] {
  const remaining = [...tasks];
  const sorted: Task[] = [];
  let current = start;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = haversineKm(current, remaining[0]);

    for (let i = 1; i < remaining.length; i++) {
      const dist = haversineKm(current, remaining[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    sorted.push(remaining[nearestIdx]);
    current = { lat: remaining[nearestIdx].lat, lng: remaining[nearestIdx].lng };
    remaining.splice(nearestIdx, 1);
  }

  return sorted;
}

/**
 * OSRM public API: gerçek yol geometrisi (polyline).
 * Başarısız olursa null döner; buildRoute düz çizgi fallback uygular.
 */
export async function fetchOSRMRoute(
  coords: Array<{ lat: number; lng: number }>
): Promise<LatLng[] | null> {
  if (coords.length < 2) return null;

  const coordStr = coords.map((c) => `${c.lng},${c.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;

    const route = data.routes[0];

    // Polyline
    const polyline: LatLng[] = (
      route.geometry.coordinates as [number, number][]
    ).map(([lng, lat]) => ({ latitude: lat, longitude: lng }));

    return polyline;
  } catch {
    clearTimeout(timer);
    return null;
  }
}
