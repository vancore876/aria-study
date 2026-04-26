import React, { useEffect, useRef } from 'react';
import { StatusBar, Platform, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import MainNavigator from './src/screens/MainNavigator';
import AppNavigator from './src/AppNavigator';
import { ARIAProvider } from './src/services/ARIAContext';

import { NotificationService } from './src/services/NotificationService';
import { VoiceWakeService } from './src/services/VoiceWakeService';
import { TaskSchedulerService } from './src/services/TaskSchedulerService';

const BACKGROUND_TASK = 'ARIA_BACKGROUND_TASK';

// Register background task
TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    await TaskSchedulerService.runScheduledTasks();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    NotificationService.initialize();
    VoiceWakeService.initialize();
    
    // Register background fetch
    BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    }).catch(() => {});

    // Notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        NotificationService.handleResponse(response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ARIAProvider>
          <AppNavigator />
        </ARIAProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
