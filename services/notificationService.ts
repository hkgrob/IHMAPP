
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Constants
const REMINDERS_KEY = 'declaration_reminders';

// Reminder interface
export interface Reminder {
  id: string;
  enabled: boolean;
  time: Date;
  title: string;
  body: string;
}

/**
 * Initialize notifications configuration
 */
export const initializeNotifications = async () => {
  if (Platform.OS === 'web') return false;
  
  try {
    // Configure notification handler
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
    return true;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
};

/**
 * Request notification permissions
 */
export const requestPermissions = async () => {
  if (Platform.OS === 'web') return false;
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
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
 * Get current reminders
 */
export const getReminders = async (): Promise<Reminder[]> => {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    if (!data) return [];
    
    const reminders = JSON.parse(data);
    
    // Convert string dates back to Date objects
    return reminders.map(reminder => ({
      ...reminder,
      time: new Date(reminder.time)
    }));
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
};

/**
 * Save reminders
 */
export const saveReminders = async (reminders: Reminder[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    return true;
  } catch (error) {
    console.error('Error saving reminders:', error);
    return false;
  }
};

/**
 * Create a new reminder
 */
export const createReminder = async (time: Date = new Date()): Promise<Reminder> => {
  // Default to 9 AM if time not specified
  if (!time) {
    time = new Date();
    time.setHours(9, 0, 0, 0);
  }
  
  const reminder: Reminder = {
    id: Date.now().toString(),
    enabled: true,
    time,
    title: 'Declaration Reminder',
    body: 'Time to speak your declarations!'
  };
  
  const reminders = await getReminders();
  reminders.push(reminder);
  await saveReminders(reminders);
  
  return reminder;
};

/**
 * Update a reminder
 */
export const updateReminder = async (updatedReminder: Reminder): Promise<boolean> => {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === updatedReminder.id);
  
  if (index === -1) return false;
  
  reminders[index] = updatedReminder;
  return await saveReminders(reminders);
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (id: string): Promise<boolean> => {
  const reminders = await getReminders();
  const filteredReminders = reminders.filter(r => r.id !== id);
  
  if (filteredReminders.length === reminders.length) return false;
  
  return await saveReminders(filteredReminders);
};

/**
 * Schedule a notification for a specific reminder
 */
export const scheduleReminder = async (reminder: Reminder): Promise<string | null> => {
  if (Platform.OS === 'web' || !reminder.enabled) return null;
  
  try {
    // Extract hours and minutes
    const hours = reminder.time.getHours();
    const minutes = reminder.time.getMinutes();
    
    console.log(`Scheduling reminder ${reminder.id} for ${hours}:${minutes}`);
    
    // Cancel existing notification with this ID if it exists
    await Notifications.cancelScheduledNotificationAsync(reminder.id);
    
    // Schedule new notification
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: true,
        data: { id: reminder.id },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
        channelId: Platform.OS === 'android' ? 'declarations' : undefined,
      },
      identifier: reminder.id,
    });
  } catch (error) {
    console.error(`Error scheduling reminder ${reminder.id}:`, error);
    return null;
  }
};

/**
 * Apply all reminders (schedule or cancel as needed)
 */
export const applyReminders = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  
  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Get all reminders
    const reminders = await getReminders();
    
    // If no reminders or none enabled, just return after canceling
    const enabledReminders = reminders.filter(r => r.enabled);
    if (enabledReminders.length === 0) {
      console.log('No enabled reminders found');
      return true;
    }
    
    // Request permissions if needed
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return false;
    }
    
    // Schedule all enabled reminders
    for (const reminder of enabledReminders) {
      await scheduleReminder(reminder);
    }
    
    // Log scheduled notifications for debugging
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Successfully scheduled ${scheduled.length} notifications`);
    
    return true;
  } catch (error) {
    console.error('Error applying reminders:', error);
    return false;
  }
};

/**
 * Create a default reminder if none exist
 */
export const ensureDefaultReminder = async (): Promise<void> => {
  const reminders = await getReminders();
  if (reminders.length === 0) {
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    await createReminder(defaultTime);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications canceled');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

/**
 * Format time for display
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
