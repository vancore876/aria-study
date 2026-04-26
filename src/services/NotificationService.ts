import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export class NotificationService {
  static async initialize() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('[ARIA] Notification permission denied');
        return;
      }
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('aria-default', {
        name: 'ARIA Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00d4ff',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('aria-tasks', {
        name: 'ARIA Scheduled Tasks',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('aria-study', {
        name: 'ARIA Study Alerts',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 500, 200, 500],
      });
    }
  }

  static async sendNotification(title: string, body: string, channel = 'aria-default') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: channel }),
      },
      trigger: null, // immediate
    });
  }

  static async scheduleNotification(
    title: string,
    body: string,
    seconds: number,
    channel = 'aria-tasks'
  ) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: channel }),
      },
      trigger: { seconds },
    });
  }

  static async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static handleResponse(response: Notifications.NotificationResponse) {
    const action = response.notification.request.content.data?.action;
    console.log('[ARIA] Notification action:', action);
  }
}
