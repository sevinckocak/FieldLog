import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface Props {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  value?: string;
  rightElement?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  destructive?: boolean;
}

export default function SettingsRow({
  icon,
  title,
  value,
  rightElement,
  onPress,
  showChevron = false,
  isLast = false,
  destructive = false,
}: Props) {
  const { colors } = useTheme();

  const titleColor = destructive ? colors.dangerText : colors.textPrimary;
  const iconColor = destructive ? colors.dangerText : colors.textSecondary;
  const iconBg = destructive ? colors.dangerLight : colors.surface;

  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      {/* Sol ikon */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>

      {/* Başlık */}
      <Text
        style={{ flex: 1, fontSize: 15, fontWeight: '500', color: titleColor }}
      >
        {title}
      </Text>

      {/* Sağ alan: değer, custom element ve/veya chevron */}
      {(value || rightElement || showChevron) ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {value ? (
            <Text style={{ fontSize: 14, color: colors.textMuted }}>{value}</Text>
          ) : null}
          {rightElement ?? null}
          {showChevron ? (
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.65}>
          {inner}
        </TouchableOpacity>
      ) : (
        inner
      )}

      {!isLast && (
        <View
          style={{
            height: 1,
            marginLeft: 60,
            backgroundColor: colors.mapOverlayBorder,
          }}
        />
      )}
    </>
  );
}
