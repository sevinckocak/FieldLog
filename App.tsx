// i18n ilk satırda import edilmeli — her şeyden önce initialize olsun
import './src/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import './global.css';
import { auth } from './src/config/firebase/firebaseConfig';
import i18n, { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './src/i18n';
import { useAppInit } from './src/hooks/useAppInit';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import { useColorScheme } from 'nativewind';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { setUser } from './src/store/slices/authSlice';
import { setLocale, selectLocale } from './src/store/slices/languageSlice';
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

  // ── Theme ──────────────────────────────────────────
  const themeMode = useAppSelector(selectThemeMode);
  const [themeHydrated, setThemeHydrated] = useState(false);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(themeMode);
  }, [themeMode, setColorScheme]);

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((value) => {
      if (value === 'light' || value === 'dark') {
        dispatch(setTheme(value as ThemeMode));
      }
      setThemeHydrated(true);
    });
  }, [dispatch]);

  useEffect(() => {
    if (!themeHydrated) return;
    AsyncStorage.setItem('app_theme', themeMode);
  }, [themeMode, themeHydrated]);

  // ── Language ────────────────────────────────────────
  const locale = useAppSelector(selectLocale);
  const [localeHydrated, setLocaleHydrated] = useState(false);

  useEffect(() => {
    const loadLocale = async () => {
      const saved = await AsyncStorage.getItem('app_locale');
      if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
        const validLocale = saved as Locale;
        dispatch(setLocale(validLocale));
        await i18n.changeLanguage(validLocale);
      } else {
        // Sistem dilini algıla, desteklenen bir locale varsa kullan
        const systemLang = getLocales()[0]?.languageCode ?? '';
        const detected = SUPPORTED_LOCALES.includes(systemLang as Locale)
          ? (systemLang as Locale)
          : DEFAULT_LOCALE;
        dispatch(setLocale(detected));
        await i18n.changeLanguage(detected);
      }
      setLocaleHydrated(true);
    };
    loadLocale();
  }, [dispatch]);

  useEffect(() => {
    if (!localeHydrated) return;
    AsyncStorage.setItem('app_locale', locale);
    i18n.changeLanguage(locale);
  }, [locale, localeHydrated]);

  // ── Onboarding ──────────────────────────────────────
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

  if (!ready || onboardingDone === null || !themeHydrated || !localeHydrated) {
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
