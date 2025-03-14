
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Constants
const SETTINGS_KEY = 'notification_settings';

// Default settings
const DEFAULT_SETTINGS = {
  enabled: false,
  morningTime: new Date(new Date().setHours(9, 0, 0, 0)),
  eveningTime: new Date(new Date().setHours(18, 0, 0, 0)),
  secondReminderEnabled: true,
};

/**
 * Initialize notifications configuration
 */
export const initializeNotifications = async () => {
  if (Platform.OS === 'web') return;
  
  try {
    // Configure how notifications appear when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    
    // Create notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('declarations', {
        name: 'Declaration Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    console.log('Notifications initialized successfully');
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};

/**
 * Request permissions for notifications
 */
export const requestPermissions = async () => {
  if (Platform.OS === 'web') return false;
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Only ask if permissions haven't been determined or were denied
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get current notification settings
 */
export const getSettings = async () => {
  try {
    const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!storedSettings) return DEFAULT_SETTINGS;
    
    const parsedSettings = JSON.parse(storedSettings);
    
    // Convert date strings back to Date objects
    return {
      ...parsedSettings,
      morningTime: parsedSettings.morningTime ? new Date(parsedSettings.morningTime) : DEFAULT_SETTINGS.morningTime,
      eveningTime: parsedSettings.eveningTime ? new Date(parsedSettings.eveningTime) : DEFAULT_SETTINGS.eveningTime,
    };
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save notification settings
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
};

/**
 * Schedule a notification for a specific time
 */
export const scheduleNotification = async (time, identifier, title, body) => {
  if (Platform.OS === 'web') return null;
  
  try {
    // Create a trigger for the specified time
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    console.log(`Scheduling notification "${identifier}" for ${hours}:${minutes}`);
    
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'Declaration Reminder',
        body: body || 'It\'s time to speak your daily declarations!',
        sound: true,
        data: { identifier },
      },
      trigger: {
        hour: hours,
        minute: minutes, 
        repeats: true,
        channelId: Platform.OS === 'android' ? 'declarations' : undefined,
      },
      identifier,
    });
  } catch (error) {
    console.error(`Error scheduling notification "${identifier}":`, error);
    return null;
  }
};

/**
 * Apply notification settings by scheduling/canceling as needed
 */
export const applySettings = async (settings) => {
  if (Platform.OS === 'web') return false;
  
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // If disabled, just return after canceling
    if (!settings.enabled) {
      console.log('Notifications disabled, all scheduled notifications canceled');
      return true;
    }
    
    // Request permissions if needed
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return false;
    }
    
    // Schedule morning notification
    await scheduleNotification(
      settings.morningTime,
      'morning-declaration',
      'Morning Declaration Reminder',
      'Start your day by speaking your declarations!'
    );
    
    // Schedule evening notification if enabled
    if (settings.secondReminderEnabled) {
      await scheduleNotification(
        settings.eveningTime,
        'evening-declaration',
        'Evening Declaration Reminder',
        'End your day by speaking your declarations!'
      );
    }
    
    // Log all scheduled notifications for debugging
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Successfully scheduled ${scheduled.length} notifications`);
    
    return true;
  } catch (error) {
    console.error('Error applying notification settings:', error);
    return false;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications canceled');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};
