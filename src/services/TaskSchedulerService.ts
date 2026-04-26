import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from './NotificationService';

export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  nextRun: number;
  interval?: number; // ms
  enabled: boolean;
  action: 'notify' | 'reminder' | 'study_check';
}

export class TaskSchedulerService {
  static async runScheduledTasks() {
    const raw = await AsyncStorage.getItem('aria_tasks');
    if (!raw) return;

    const tasks: ScheduledTask[] = JSON.parse(raw);
    const now = Date.now();

    for (const task of tasks) {
      if (!task.enabled) continue;
      if (task.nextRun > now) continue;

      await NotificationService.sendNotification(
        task.title,
        task.description,
        'aria-tasks'
      );

      if (task.interval) {
        task.nextRun = now + task.interval;
      } else {
        task.enabled = false;
      }
    }

    await AsyncStorage.setItem('aria_tasks', JSON.stringify(tasks));
  }

  static parseNaturalTime(text: string): number {
    const now = Date.now();
    const lower = text.toLowerCase();

    if (lower.includes('minute')) {
      const match = lower.match(/(\d+)\s*minute/);
      return now + (match ? parseInt(match[1]) : 1) * 60 * 1000;
    }
    if (lower.includes('hour')) {
      const match = lower.match(/(\d+)\s*hour/);
      return now + (match ? parseInt(match[1]) : 1) * 60 * 60 * 1000;
    }
    if (lower.includes('day')) {
      const match = lower.match(/(\d+)\s*day/);
      return now + (match ? parseInt(match[1]) : 1) * 24 * 60 * 60 * 1000;
    }
    if (lower.includes('tomorrow')) {
      return now + 24 * 60 * 60 * 1000;
    }

    return now + 60 * 60 * 1000;
  }
}
