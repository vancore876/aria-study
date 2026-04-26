import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ChatScreen from './ChatScreen';
import StudyScreen from './StudyScreen';
import ScreenShareScreen from './ScreenShareScreen';
import TasksScreen from './TasksScreen';
import SettingsScreen from './SettingsScreen';
import ModelsScreen from './ModelsScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  surface: 'rgba(10,22,39,0.95)',
  accent: '#6ee7ff',
  text: '#ffffff',
  muted: '#6f87a8',
  edge: 'rgba(255,255,255,0.08)',
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 10,
          borderRadius: 22,
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.edge,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        sceneContainerStyle: { backgroundColor: '#07111f' },
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, string> = {
            Tutor: focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
            Study: focused ? 'school' : 'school-outline',
            Scan: focused ? 'scan' : 'scan-outline',
            Planner: focused ? 'calendar' : 'calendar-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tutor" component={ChatScreen} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="Scan" component={ScreenShareScreen} />
      <Tab.Screen name="Planner" component={TasksScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
