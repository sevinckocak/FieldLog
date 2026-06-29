import { useState } from 'react';
import { Alert, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../hooks/useTheme';
import SettingsRow from '../components/SettingsRow';
import SettingsSection from '../components/SettingsSection';
import LanguagePickerModal from '../components/LanguagePickerModal';
import { useProfile } from '../hooks/useProfile';
import type { ProfileStackParamList } from '../../../navigation/ProfileStackNavigator';

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { profile, logout, changeTheme, locale, currentLanguageName, changeLocale } = useProfile();
  const { t } = useTranslation('profile');
  const { t: tCommon } = useTranslation('common');
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('logout.title'),
      t('logout.message'),
      [
        { text: tCommon('cancel'), style: 'cancel' },
        { text: t('logout.confirm'), style: 'destructive', onPress: logout },
      ],
    );
  };

  const pageBg = isDark ? colors.background : colors.surface;

  return (
    <>
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
            {profile.displayName || t('defaultUser')}
          </Text>

          {profile.email ? (
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {profile.email}
            </Text>
          ) : null}
        </View>

        {/* ── Görünüm ─────────────────────────────────── */}
        <SettingsSection title={t('sections.appearance')}>
          <SettingsRow
            icon="moon-outline"
            title={t('rows.theme')}
            value={isDark ? tCommon('themeMode.dark') : tCommon('themeMode.light')}
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
        <SettingsSection title={t('sections.preferences')}>
          <SettingsRow
            icon="language-outline"
            title={t('rows.language')}
            value={currentLanguageName}
            showChevron
            onPress={() => setLangModalVisible(true)}
          />
          <SettingsRow
            icon="notifications-outline"
            title={t('rows.notifications')}
            showChevron
            isLast
          />
        </SettingsSection>

        {/* ── İstatistikler ───────────────────────────── */}
        <SettingsSection title={t('sections.insights')}>
          <SettingsRow
            icon="bar-chart-outline"
            title={t('rows.analytics')}
            showChevron
            isLast
            onPress={() => navigation.navigate('Analytics')}
          />
        </SettingsSection>

        {/* ── Hakkında ────────────────────────────────── */}
        <SettingsSection title={t('sections.about')}>
          <SettingsRow
            icon="information-circle-outline"
            title={t('rows.version')}
            value="1.0.0"
          />
          <SettingsRow
            icon="shield-outline"
            title={t('rows.privacy')}
            showChevron
            isLast
          />
        </SettingsSection>

        {/* ── Hesap ───────────────────────────────────── */}
        <SettingsSection title={t('sections.account')}>
          <SettingsRow
            icon="log-out-outline"
            title={t('rows.logout')}
            onPress={handleLogout}
            destructive
            isLast
          />
        </SettingsSection>
      </ScrollView>

      <LanguagePickerModal
        visible={langModalVisible}
        currentLocale={locale}
        onSelect={changeLocale}
        onClose={() => setLangModalVisible(false)}
      />
    </>
  );
}
