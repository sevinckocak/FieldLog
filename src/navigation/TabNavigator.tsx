import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from "../features/map/screens/MapScreen";
import TaskListScreen from "../features/tasks/screens/TaskListScreen";
const Tab = createBottomTabNavigator();
export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Tasks" component={TaskListScreen} />
    </Tab.Navigator>
  );
}
