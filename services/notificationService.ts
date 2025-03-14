
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'ios') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
  }

  return token;
}

// Schedule a notification
export async function scheduleNotification(hours, minutes, title, body) {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Save notification settings to AsyncStorage
export async function saveNotificationSettings(enabled, time1, time2 = null) {
  try {
    const settings = {
      enabled,
      time1,
      time2,
    };
    
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
}

// Load notification settings from AsyncStorage
export async function loadNotificationSettings() {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : { enabled: false, time1: new Date(), time2: null };
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return { enabled: false, time1: new Date(), time2: null };
  }
}

// Set up notifications based on saved settings
export async function setupNotifications() {
  const settings = await loadNotificationSettings();
  
  if (settings.enabled) {
    // Cancel existing notifications first
    await cancelAllNotifications();
    
    // Schedule first notification
    const time1 = new Date(settings.time1);
    await scheduleNotification(
      time1.getHours(),
      time1.getMinutes(),
      'Declaration Reminder',
      'Time to speak your daily declarations!'
    );
    
    // Schedule second notification if set
    if (settings.time2) {
      const time2 = new Date(settings.time2);
      await scheduleNotification(
        time2.getHours(),
        time2.getMinutes(),
        'Declaration Reminder',
        'Remember to speak your daily declarations!'
      );
    }
    
    return true;
  } else {
    // If notifications are disabled, cancel all
    await cancelAllNotifications();
    return false;
  }
}
