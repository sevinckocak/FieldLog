import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { useSyncOnResume } from '../hooks/useSyncOnResume';
import { useAppSelector } from '../store/hooks';
import { selectAuthInitialized, selectUser } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

export default function RootNavigator() {
  const user = useAppSelector(selectUser);
  const initialized = useAppSelector(selectAuthInitialized);

  useSyncOnResume();

  if (!initialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#030712' }}>
        <Text style={{ color: '#6B7280' }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
