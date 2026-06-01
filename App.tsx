import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "./global.css";
import { useAppInit } from "./src/hooks/useAppInit";
import RootNavigator from "./src/navigation/RootNavigator";
import { store } from "./src/store";

export default function App() {
  const { ready, error } = useAppInit();

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-red-500 text-center px-6">{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-gray-400">Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
