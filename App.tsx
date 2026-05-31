import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { initDatabase } from "./src/db/client";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((e: unknown) => {
        setDbError(e instanceof Error ? e.message : "Veritabanı başlatılamadı");
      });
  }, []);

  if (dbError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-red-500 text-center px-6">{dbError}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-gray-400">Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
