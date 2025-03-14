
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const NOTIFICATION_SETTINGS_KEY = 'notificationSettings';

// Default notification settings
const DEFAULT_SETTINGS = {
  enabled: false,
  morningTime: new Date(new Date().setHours(9, 0, 0, 0)),
  eveningTime: new Date(new Date().setHours(18, 0, 0, 0)),
};

// Initialize notification handler
export const initializeNotifications = () => {
  if (Platform.OS === 'web') return;
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  
  // Create notification channel for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('declarations-reminders', {
      name: 'Declaration Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};

// Request permissions
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

// Schedule notification
export const scheduleNotification = async (time, id) => {
  if (Platform.OS === 'web') return null;
  
  try {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Declaration Reminder',
        body: 'Time to speak your daily declarations!',
        sound: true,
        ios: {
          sound: true,
        }
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
      identifier: id,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

// Save notification settings
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
};

// Load notification settings
export const getNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!settings) return DEFAULT_SETTINGS;
    
    const parsedSettings = JSON.parse(settings);
    
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

// Apply notification settings
export const applyNotificationSettings = async () => {
  try {
    if (Platform.OS === 'web') return false;
    
    const settings = await getNotificationSettings();
    
    // Cancel existing notifications
    await cancelAllNotifications();
    
    // If notifications are disabled, just return
    if (!settings.enabled) return false;
    
    // Check permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return false;
    
    // Schedule morning notification
    await scheduleNotification(settings.morningTime, 'morning-declaration');
    
    // Schedule evening notification
    await scheduleNotification(settings.eveningTime, 'evening-declaration');
    
    return true;
  } catch (error) {
    console.error('Error applying notification settings:', error);
    return false;
  }
};
