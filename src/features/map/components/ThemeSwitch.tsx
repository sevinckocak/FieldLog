import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useAppDispatch } from '../../../store/hooks';
import { setTheme } from '../../../store/slices/themeSlice';
import type { ThemeMode } from '../../../theme';

const MODES: { label: string; value: ThemeMode }[] = [
  { label: 'Açık', value: 'light' },
  { label: 'Koyu', value: 'dark' },
];

export default function ThemeSwitch() {
  const dispatch = useAppDispatch();
  const { colors, mode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.switchBg }]}>
      {MODES.map((item) => {
        const isActive = mode === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            onPress={() => dispatch(setTheme(item.value))}
            style={[styles.button, isActive && { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
