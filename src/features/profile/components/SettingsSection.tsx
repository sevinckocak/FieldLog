import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface Props {
  title: string;
  children: ReactNode;
}

export default function SettingsSection({ title, children }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 28 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.textMuted,
          paddingHorizontal: 20,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.mapOverlayBorder,
        }}
      >
        {children}
      </View>
    </View>
  );
}
