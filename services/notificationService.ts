
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationTime {
  hour: number;
  minute: number;
}

interface NotificationSettings {
  enabled: boolean;
  morningTime: NotificationTime;
  eveningTime: NotificationTime;
  sound: boolean;
}

// Storage keys
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// Default notification settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  morningTime: { hour: 8, minute: 0 },
  eveningTime: { hour: 20, minute: 0 },
  sound: true,
};

// Configure notifications handler
export const configureNotifications = async () => {
  // Set handler for how notifications should be handled when app is in foreground
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Create channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('declarations-reminders', {
      name: 'Declaration Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
};

// Request permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  if (!Device.isDevice) {
    console.log('Must use physical device for notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  return true;
};

// Save notification settings
export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

// Get notification settings
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Schedule all notifications
export const scheduleAllNotifications = async (): Promise<void> => {
  try {
    const settings = await getNotificationSettings();
    
    // If notifications are disabled, cancel all and return
    if (!settings.enabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }
    
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule morning notification
    await scheduleNotification(
      'morning-declaration',
      'Morning Declarations',
      'Time for your morning declarations to start your day with purpose!',
      settings.morningTime,
      settings.sound
    );
    
    // Schedule evening notification
    await scheduleNotification(
      'evening-declaration',
      'Evening Declarations',
      'Time for your evening declarations to end your day with gratitude!',
      settings.eveningTime,
      settings.sound
    );
    
    // For debugging
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', scheduledNotifications);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};

// Schedule a single notification
const scheduleNotification = async (
  identifier: string,
  title: string,
  body: string,
  time: NotificationTime,
  withSound: boolean
): Promise<string> => {
  // Create trigger date for daily notification at specified time
  const now = new Date();
  const triggerDate = new Date(now);
  triggerDate.setHours(time.hour);
  triggerDate.setMinutes(time.minute);
  triggerDate.setSeconds(0);
  triggerDate.setMilliseconds(0);
  
  // If time has already passed today, schedule for tomorrow
  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }
  
  console.log(`Scheduling ${identifier} for:`, triggerDate.toLocaleString());

  // Schedule the notification
  return await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: withSound ? 'default' : null,
      // Priority settings for iOS
      priority: 'high',
      // Extra data
      data: { type: 'declaration_reminder' },
    },
    trigger: {
      // Set channel ID for Android
      channelId: Platform.OS === 'android' ? 'declarations-reminders' : undefined,
      date: triggerDate,
      repeats: true,
    },
  });
};

// Cancel all notifications
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

// Helper to format time display (12-hour format with AM/PM)
export const formatTimeDisplay = (time: NotificationTime): string => {
  const hour12 = time.hour % 12 || 12;
  const minute = time.minute.toString().padStart(2, '0');
  const period = time.hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${minute} ${period}`;
};

// Convert Date to NotificationTime
export const dateToNotificationTime = (date: Date): NotificationTime => {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
};

// Convert NotificationTime to Date
export const notificationTimeToDate = (time: NotificationTime): Date => {
  const date = new Date();
  date.setHours(time.hour);
  date.setMinutes(time.minute);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};
