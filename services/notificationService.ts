import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const generateId = () => {
  return 'reminder_' + Math.random().toString(36).substring(2, 11);
};

const REMINDERS_STORAGE_KEY = 'declaration_reminders';

export interface Reminder {
  id: string;
  enabled: boolean;
  time: Date | string;
  title: string;
  body: string;
}

export const initializeNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        ios: {
          sound: true,
          _displayInForeground: true
        },
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('declarations', {
        name: 'Declaration Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
};

export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

export const getReminders = async (): Promise<Reminder[]> => {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return parsed.map((reminder: any) => ({
      ...reminder,
      time: new Date(reminder.time)
    }));
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
};

export const saveReminders = async (reminders: Reminder[]): Promise<boolean> => {
  try {
    const remindersToSave = reminders.map(reminder => ({
      ...reminder,
      time: reminder.time instanceof Date ? reminder.time.toISOString() : reminder.time
    }));

    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(remindersToSave));
    return true;
  } catch (error) {
    console.error('Error saving reminders:', error);
    return false;
  }
};

export const addReminder = async (time?: Date): Promise<Reminder | null> => {
  try {
    let reminderTime = time || new Date(Date.now() + 3600000); // 1 hour from now if no time
    reminderTime.setMinutes(Math.ceil(reminderTime.getMinutes() / 5) * 5, 0, 0);

    const newReminder: Reminder = {
      id: generateId(),
      enabled: true,
      time: reminderTime,
      title: 'Declaration Reminder',
      body: 'Time to speak your declarations!'
    };

    const reminders = await getReminders();
    reminders.push(newReminder);
    await saveReminders(reminders);

    return newReminder;
  } catch (error) {
    console.error('Error adding reminder:', error);
    return null;
  }
};

export const updateReminder = async (reminder: Reminder): Promise<boolean> => {
  try {
    const reminders = await getReminders();
    const index = reminders.findIndex(r => r.id === reminder.id);
    if (index === -1) return false;

    reminders[index] = reminder;
    return await saveReminders(reminders);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return false;
  }
};

export const deleteReminder = async (id: string): Promise<boolean> => {
  try {
    const reminders = await getReminders();
    const filteredReminders = reminders.filter(r => r.id !== id);
    return await saveReminders(filteredReminders);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return false;
  }
};

export const safeCancelAllNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const remaining = await Notifications.getAllScheduledNotificationsAsync();
    return remaining.length === 0;
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    return false;
  }
};

export const scheduleReminder = async (reminder: Reminder): Promise<string | null> => {
  if (Platform.OS === 'web' || !reminder.enabled) return null;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.length >= 60) {
      console.warn('Approaching iOS notification limit, cancelling oldest');
      await Notifications.cancelScheduledNotificationAsync(scheduled[0].identifier);
    }

    await Notifications.cancelScheduledNotificationAsync(reminder.id);

    const reminderTime = reminder.time instanceof Date ? reminder.time : new Date(reminder.time);
    if (isNaN(reminderTime.getTime())) return null;

    const now = new Date();
    const nextOccurrence = new Date(now);
    nextOccurrence.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);

    // Ensure the first occurrence is in the future
    if (nextOccurrence <= now) {
      nextOccurrence.setDate(nextOccurrence.getDate() + 1);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: true,
        badge: 1,
        data: { id: reminder.id, nextSchedule: nextOccurrence.toISOString() },
      },
      trigger: {
        date: nextOccurrence,
        repeats: false, // One-time trigger
      },
      identifier: reminder.id,
    });

    console.log(`Scheduled reminder ${reminder.id} for ${formatTime(nextOccurrence)}`);
    return notificationId;
  } catch (error) {
    console.error(`Error scheduling reminder ${reminder.id}:`, error);
    return null;
  }
};

// Reschedule for the next day when notification is received
export const rescheduleNextDay = async (reminderId: string): Promise<void> => {
  try {
    const reminders = await getReminders();
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder || !reminder.enabled) return;

    const nextOccurrence = new Date(reminder.time instanceof Date ? reminder.time : new Date(reminder.time));
    nextOccurrence.setHours(nextOccurrence.getHours(), nextOccurrence.getMinutes(), 0, 0);
    nextOccurrence.setDate(nextOccurrence.getDate() + 1);

    await Notifications.cancelScheduledNotificationAsync(reminder.id);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: true,
        badge: 1,
        data: { id: reminder.id, nextSchedule: nextOccurrence.toISOString() },
      },
      trigger: {
        date: nextOccurrence,
        repeats: false,
      },
      identifier: reminder.id,
    });

    console.log(`Rescheduled reminder ${reminder.id} for ${formatTime(nextOccurrence)}`);
  } catch (error) {
    console.error(`Error rescheduling reminder ${reminderId}:`, error);
  }
};

export const applyAllReminders = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  try {
    await safeCancelAllNotifications();
    const reminders = await getReminders();
    const enabledReminders = reminders.filter(r => r.enabled);

    if (!await requestPermissions()) return false;
    if (enabledReminders.length === 0) return true;

    const results = await Promise.all(enabledReminders.map(scheduleReminder));
    return results.every(r => r !== null);
  } catch (error) {
    console.error('Error applying reminders:', error);
    return false;
  }
};

export const ensureDefaultReminder = async (): Promise<void> => {
  try {
    const reminders = await getReminders();
    if (reminders.length === 0) {
      const morningTime = new Date();
      morningTime.setHours(9, 0, 0, 0);
      await addReminder(morningTime);
      await applyAllReminders();
    }
  } catch (error) {
    console.error('Error creating default reminder:', error);
  }
};

export const formatTime = (date: Date | string): string => {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};