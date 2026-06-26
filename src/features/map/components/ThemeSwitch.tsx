import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import { useAppDispatch } from '../../../store/hooks';
import { setTheme } from '../../../store/slices/themeSlice';
import type { ThemeMode } from '../../../theme';

export default function ThemeSwitch() {
  const dispatch = useAppDispatch();
  const { colors, mode } = useTheme();
  const { t } = useTranslation('common');

  const modes: { label: string; value: ThemeMode }[] = [
    { label: t('themeMode.light'), value: 'light' },
    { label: t('themeMode.dark'), value: 'dark' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.switchBg }]}>
      {modes.map((item) => {
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
