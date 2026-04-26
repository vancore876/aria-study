import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './services/NavigationService';

import LoginScreen from './screens/LoginScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import MainNavigator from './screens/MainNavigator';
import AdminDashboard from './screens/AdminDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
