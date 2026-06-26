import { useAppSelector } from '../store/hooks';
import { selectThemeMode } from '../store/slices/themeSlice';
import { darkColors, lightColors } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import type { ThemeMode } from '../theme';

export interface UseThemeResult {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
}

export function useTheme(): UseThemeResult {
  const mode = useAppSelector(selectThemeMode);
  const isDark = mode === 'dark';
  return {
    colors: isDark ? darkColors : lightColors,
    mode,
    isDark,
  };
}
