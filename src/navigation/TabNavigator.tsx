import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import MapScreen from "../features/map/screens/MapScreen";
import TaskListScreen from "../features/tasks/screens/TaskListScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import { useTheme } from "../hooks/useTheme";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { colors } = useTheme();
  const { t } = useTranslation('common');

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
        },
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerTintColor: colors.headerText,
      }}
    >
      <Tab.Screen
        name="Harita"
        component={MapScreen}
        options={{
          title: t('tabs.map'),
          tabBarLabel: t('tabs.map'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Görevler"
        component={TaskListScreen}
        options={{
          title: t('tabs.tasks'),
          tabBarLabel: t('tabs.tasks'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          title: t('tabs.profile'),
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
