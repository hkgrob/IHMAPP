
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const NOTIFICATION_MORNING_TIME_KEY = 'notification_morning_time';
const NOTIFICATION_EVENING_TIME_KEY = 'notification_evening_time';
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

// Default notification times
const DEFAULT_MORNING_TIME = { hour: 9, minute: 0 };
const DEFAULT_EVENING_TIME = { hour: 20, minute: 0 };

// Configure notifications
export async function configureNotifications() {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }

  try {
    // Request permissions - required for iOS
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error configuring notifications:', error);
    return false;
  }
}

// Get stored notification times or defaults
export async function getNotificationTimes() {
  try {
    const morningTimeStr = await AsyncStorage.getItem(NOTIFICATION_MORNING_TIME_KEY);
    const eveningTimeStr = await AsyncStorage.getItem(NOTIFICATION_EVENING_TIME_KEY);
    
    const morningTime = morningTimeStr ? JSON.parse(morningTimeStr) : DEFAULT_MORNING_TIME;
    const eveningTime = eveningTimeStr ? JSON.parse(eveningTimeStr) : DEFAULT_EVENING_TIME;
    
    return { morningTime, eveningTime };
  } catch (error) {
    console.error('Error getting notification times:', error);
    return { 
      morningTime: DEFAULT_MORNING_TIME, 
      eveningTime: DEFAULT_EVENING_TIME 
    };
  }
}

// Save notification times
export async function saveNotificationTimes(morningTime, eveningTime) {
  try {
    await AsyncStorage.setItem(NOTIFICATION_MORNING_TIME_KEY, JSON.stringify(morningTime));
    await AsyncStorage.setItem(NOTIFICATION_EVENING_TIME_KEY, JSON.stringify(eveningTime));
    
    // If notifications are enabled, reschedule them with new times
    const enabled = await areNotificationsEnabled();
    if (enabled) {
      await scheduleAllNotifications();
    }
    
    return true;
  } catch (error) {
    console.error('Error saving notification times:', error);
    return false;
  }
}

// Check if notifications are enabled
export async function areNotificationsEnabled() {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking if notifications are enabled:', error);
    return false;
  }
}

// Set notifications enabled state
export async function setNotificationsEnabled(enabled) {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    
    if (enabled) {
      await scheduleAllNotifications();
    } else {
      await cancelAllNotifications();
    }
    
    return true;
  } catch (error) {
    console.error('Error setting notifications enabled:', error);
    return false;
  }
}

// Schedule all notifications
export async function scheduleAllNotifications() {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }

  try {
    // First cancel any existing notifications
    await cancelAllNotifications();
    
    // Check if notifications are enabled
    const enabled = await areNotificationsEnabled();
    if (!enabled) {
      console.log('Notifications are disabled, not scheduling');
      return false;
    }
    
    // Get notification times
    const { morningTime, eveningTime } = await getNotificationTimes();
    
    // Schedule morning notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Morning Declarations",
        body: "It's time for your morning declarations! Start your day with positivity.",
      },
      trigger: {
        hour: morningTime.hour,
        minute: morningTime.minute,
        repeats: true,
      },
      identifier: 'morning-declaration',
    });
    
    // Schedule evening notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Evening Declarations",
        body: "It's time for your evening declarations! End your day with powerful affirmations.",
      },
      trigger: {
        hour: eveningTime.hour,
        minute: eveningTime.minute,
        repeats: true,
      },
      identifier: 'evening-declaration',
    });
    
    console.log('All notifications scheduled successfully');
    return true;
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    return false;
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    return false;
  }
}
