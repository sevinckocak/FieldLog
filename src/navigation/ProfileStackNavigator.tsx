import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import AnalyticsScreen from '../features/analytics/screens/AnalyticsScreen';
import { useTheme } from '../hooks/useTheme';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Analytics: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const { colors } = useTheme();
  const { t } = useTranslation('profile');
  const { t: tCommon } = useTranslation('common');

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.headerText,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: tCommon('tabs.profile') }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: t('analytics.title') }}
      />
    </Stack.Navigator>
  );
}
