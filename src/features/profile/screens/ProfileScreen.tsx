import { Alert, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import SettingsRow from '../components/SettingsRow';
import SettingsSection from '../components/SettingsSection';
import { useProfile } from '../hooks/useProfile';

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { profile, logout, changeTheme } = useProfile();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğinden emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ],
    );
  };

  // Light modda ince gri sayfa zemini, dark modda çok koyu zemin
  const pageBg = isDark ? colors.background : colors.surface;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: pageBg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Kullanıcı Kartı ─────────────────────────── */}
      <View
        style={{
          alignItems: 'center',
          paddingTop: 32,
          paddingBottom: 28,
          paddingHorizontal: 16,
          marginBottom: 32,
          backgroundColor: colors.surfaceElevated,
          borderBottomWidth: 1,
          borderBottomColor: colors.mapOverlayBorder,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 14,
            elevation: 10,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '700' }}>
            {profile.avatarLetter}
          </Text>
        </View>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 4,
          }}
        >
          {profile.displayName}
        </Text>

        {profile.email ? (
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {profile.email}
          </Text>
        ) : null}
      </View>

      {/* ── Görünüm ─────────────────────────────────── */}
      <SettingsSection title="Görünüm">
        <SettingsRow
          icon="moon-outline"
          title="Tema"
          value={isDark ? 'Koyu' : 'Açık'}
          isLast
          rightElement={
            <Switch
              value={isDark}
              onValueChange={changeTheme}
              trackColor={{ false: colors.switchBg, true: colors.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              ios_backgroundColor={colors.switchBg}
            />
          }
        />
      </SettingsSection>

      {/* ── Tercihler ───────────────────────────────── */}
      <SettingsSection title="Tercihler">
        <SettingsRow
          icon="language-outline"
          title="Dil"
          value="Türkçe"
          showChevron
        />
        <SettingsRow
          icon="notifications-outline"
          title="Bildirimler"
          showChevron
          isLast
        />
      </SettingsSection>

      {/* ── Hakkında ────────────────────────────────── */}
      <SettingsSection title="Hakkında">
        <SettingsRow
          icon="information-circle-outline"
          title="Uygulama Versiyonu"
          value="1.0.0"
        />
        <SettingsRow
          icon="shield-outline"
          title="Gizlilik Politikası"
          showChevron
          isLast
        />
      </SettingsSection>

      {/* ── Hesap ───────────────────────────────────── */}
      <SettingsSection title="Hesap">
        <SettingsRow
          icon="log-out-outline"
          title="Çıkış Yap"
          onPress={handleLogout}
          destructive
          isLast
        />
      </SettingsSection>
    </ScrollView>
  );
}
