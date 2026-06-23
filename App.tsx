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
import { useAppDispatch } from './src/store/hooks';
import { setUser } from './src/store/slices/authSlice';
import { store } from './src/store';

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
  const { ready, error } = useAppInit();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

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

  if (!ready || onboardingDone === null) {
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
