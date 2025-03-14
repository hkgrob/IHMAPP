import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Constants
const REMINDERS_STORAGE_KEY = 'declaration_reminders';

// Define reminder interface
export interface Reminder {
  id: string;
  enabled: boolean;
  time: Date | string; // Date in memory, string in storage
  title: string;
  body: string;
}

/**
 * Initialize notifications
 */
export const initializeNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }

  try {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Create channel for Android
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
export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

/**
 * Load reminders from storage
 */
export const getReminders = async (): Promise<Reminder[]> => {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);

    // Convert time strings back to Date objects
    return parsed.map((reminder: any) => ({
      ...reminder,
      time: new Date(reminder.time)
    }));
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
};

/**
 * Save reminders to storage
 */
export const saveReminders = async (reminders: Reminder[]): Promise<boolean> => {
  try {
    // Convert Date objects to ISO strings for storage
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

// Custom UUID generator (replace with your preferred cross-platform method)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};


/**
 * Create a new reminder
 */
export const addReminder = async (time: Date): Promise<Reminder | null> => {
  try {
    // Create new reminder
    const newReminder: Reminder = {
      id: generateUUID(),
      enabled: true,
      time,
      title: 'Declaration Reminder',
      body: 'Time to speak your declarations!'
    };

    // Get existing reminders and add the new one
    const reminders = await getReminders();
    reminders.push(newReminder);

    // Save all reminders
    const saved = await saveReminders(reminders);
    if (!saved) return null;

    return newReminder;
  } catch (error) {
    console.error('Error adding reminder:', error);
    return null;
  }
};

/**
 * Update an existing reminder
 */
export const updateReminder = async (reminder: Reminder): Promise<boolean> => {
  try {
    const reminders = await getReminders();
    const index = reminders.findIndex(r => r.id === reminder.id);

    if (index === -1) {
      console.log(`Reminder with id ${reminder.id} not found`);
      return false;
    }

    reminders[index] = reminder;
    return await saveReminders(reminders);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return false;
  }
};

/**
 * Delete a reminder by id
 */
export const deleteReminder = async (id: string): Promise<boolean> => {
  try {
    const reminders = await getReminders();
    const filteredReminders = reminders.filter(r => r.id !== id);

    if (filteredReminders.length === reminders.length) {
      console.log(`Reminder with id ${id} not found`);
      return false;
    }

    return await saveReminders(filteredReminders);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return false;
  }
};

/**
 * Schedule a notification for a specific reminder
 */
export const scheduleReminder = async (reminder: Reminder): Promise<string | null> => {
  if (Platform.OS === 'web' || !reminder.enabled) return null;

  try {
    // Cancel existing notification for this reminder if it exists
    await Notifications.cancelScheduledNotificationAsync(reminder.id);

    const reminderTime = reminder.time instanceof Date ? reminder.time : new Date(reminder.time);
    const hours = reminderTime.getHours();
    const minutes = reminderTime.getMinutes();

    console.log(`Scheduling reminder for ${hours}:${minutes}`);

    // Schedule the notification
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
      },
      identifier: reminder.id,
    });
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return null;
  }
};

/**
 * Apply all reminders (schedule enabled ones, cancel disabled ones)
 */
export const applyAllReminders = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  try {
    // Get all reminders
    const reminders = await getReminders();
    console.log(`Applying ${reminders.length} reminders`);

    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // If no permission, request it
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('No permission to schedule notifications');
      return false;
    }

    // Schedule all enabled reminders
    for (const reminder of reminders) {
      if (reminder.enabled) {
        await scheduleReminder(reminder);
      }
    }

    // Log what's scheduled (for debugging)
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
  try {
    const reminders = await getReminders();
    if (reminders.length === 0) {
      // Create a reminder for 9 AM
      const morningTime = new Date();
      morningTime.setHours(9, 0, 0, 0);
      await addReminder(morningTime);
    }
  } catch (error) {
    console.error('Error creating default reminder:', error);
  }
};

/**
 * Format time for display (HH:MM AM/PM)
 */
export const formatTime = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};