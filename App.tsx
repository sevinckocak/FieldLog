import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import './global.css';
import { auth } from './src/config/firebase/firebaseConfig';
import { useAppInit } from './src/hooks/useAppInit';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import { useColorScheme } from 'nativewind';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { setUser } from './src/store/slices/authSlice';
import { selectThemeMode, setTheme } from './src/store/slices/themeSlice';
import { store } from './src/store';
import type { ThemeMode } from './src/theme';

function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      dispatch(
        setUser(
          firebaseUser
            ? {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
              }
            : null,
        ),
      );
    });
    return unsubscribe;
  }, [dispatch]);

  return null;
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { ready, error } = useAppInit();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const themeMode = useAppSelector(selectThemeMode);
  const [themeHydrated, setThemeHydrated] = useState(false);

  // NativeWind engine'i Redux state ile senkronize eder
  const { setColorScheme } = useColorScheme();
  useEffect(() => {
    setColorScheme(themeMode);
  }, [themeMode, setColorScheme]);

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((value) => {
      if (value === 'light' || value === 'dark') {
        dispatch(setTheme(value as ThemeMode));
      }
      setThemeHydrated(true);
    });
  }, [dispatch]);

  // Persist theme changes after initial hydration
  useEffect(() => {
    if (!themeHydrated) return;
    AsyncStorage.setItem('app_theme', themeMode);
  }, [themeMode, themeHydrated]);

  useEffect(() => {
    AsyncStorage.getItem('onboardingCompleted').then((value) => {
      setOnboardingDone(value === 'true');
    });
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-red-500 text-center px-6">{error}</Text>
      </View>
    );
  }

  if (!ready || onboardingDone === null || !themeHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-gray-400">Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthListener />
      {onboardingDone ? (
        <RootNavigator />
      ) : (
        <OnboardingScreen onComplete={() => setOnboardingDone(true)} />
      )}
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
