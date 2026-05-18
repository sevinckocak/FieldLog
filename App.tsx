import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { Text, View } from "react-native";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
