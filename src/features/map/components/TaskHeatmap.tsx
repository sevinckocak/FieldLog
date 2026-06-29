import { useMemo } from 'react';
import { Heatmap } from 'react-native-maps';
import type { Task } from '../../../types';

// Blue → Green → Yellow → Orange → Red gradient (low → high density)
const GRADIENT = {
  colors: ['#3B82F6', '#22C55E', '#EAB308', '#F97316', '#EF4444'],
  startPoints: [0.1, 0.3, 0.55, 0.75, 1.0],
  colorMapSize: 256,
};

interface Props {
  tasks: Task[];
  radius: number;
  opacity: number;
}

/**
 * Renders a density heatmap over the map using task locations.
 * High-priority tasks carry more weight so hot-spots surface faster.
 *
 * Android: works with the bundled Google Maps SDK.
 * iOS: requires PROVIDER_GOOGLE on the parent MapView.
 */
export default function TaskHeatmap({ tasks, radius, opacity }: Props) {
  const points = useMemo(
    () =>
      tasks
        .filter((t) => t.lat !== 0 && t.lng !== 0)
        .map((t) => ({
          latitude: t.lat,
          longitude: t.lng,
          weight: t.priority === 'high' ? 3 : t.priority === 'medium' ? 2 : 1,
        })),
    [tasks],
  );

  if (points.length === 0) return null;

  return (
    <Heatmap
      points={points}
      opacity={opacity}
      radius={radius}
      gradient={GRADIENT}
    />
  );
}
