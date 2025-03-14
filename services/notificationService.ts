
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Simple ID generator to replace uuid which has crypto dependency issues on some mobile platforms
const generateId = () => {
  return 'reminder_' + Math.random().toString(36).substring(2, 11) + 
         '_' + Date.now().toString(36);
};

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
    
    // Cancel all existing notifications to prevent duplicate firing
    // This is important when the app launches
    await Notifications.cancelAllScheduledNotificationsAsync();
    
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

/**
 * Create a new reminder
 */
export const addReminder = async (time?: Date): Promise<Reminder | null> => {
  try {
    // If no time provided, set default time to 1 hour from now
    let reminderTime;
    if (!time) {
      reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + 1);
      // Round to nearest 5 minutes for better UX
      reminderTime.setMinutes(Math.ceil(reminderTime.getMinutes() / 5) * 5, 0, 0);
    } else {
      reminderTime = time;
    }
    
    console.log(`Creating reminder for future time: ${reminderTime.toLocaleString()}`);
    
    // Create reminder object
    const newReminder: Reminder = {
      id: generateId(),
      enabled: true,
      time: reminderTime,
      title: 'Declaration Reminder',
      body: 'Time to speak your declarations!'
    };
    
    // Get existing reminders and add the new one
    const reminders = await getReminders();
    reminders.push(newReminder);
    
    // Save all reminders
    const saved = await saveReminders(reminders);
    if (!saved) return null;
    
    // DO NOT schedule here or call applyAllReminders
    // The caller should handle this to prevent duplicate scheduling
    
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
    // Cancel existing notifications for this reminder if they exist
    await Notifications.cancelScheduledNotificationAsync(reminder.id);
    await Notifications.cancelScheduledNotificationAsync(`${reminder.id}_recurring`);
    
    const reminderTime = reminder.time instanceof Date ? reminder.time : new Date(reminder.time);
    const hours = reminderTime.getHours();
    const minutes = reminderTime.getMinutes();
    
    console.log(`Scheduling reminder for ${formatTime(reminderTime)}`);
    
    // Get current time
    const now = new Date();
    
    // Create a Date for the next occurrence of this time
    const triggerDate = new Date();
    triggerDate.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    
    // Calculate hours and minutes until trigger time for logging
    const msTillTrigger = triggerDate.getTime() - now.getTime();
    const hoursTillTrigger = Math.floor(msTillTrigger / (1000 * 60 * 60));
    const minutesTillTrigger = Math.floor((msTillTrigger % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(`Next notification will trigger in ${hoursTillTrigger}h ${minutesTillTrigger}m (${triggerDate.toLocaleString()})`);
    
    // For debugging
    const formattedTriggerTime = `${triggerDate.toLocaleTimeString()} on ${triggerDate.toLocaleDateString()}`;
    console.log(`Will schedule notification to trigger at: ${formattedTriggerTime}`);
    
    // IMPORTANT: Only schedule if the trigger time is at least 60 seconds in the future
    // This prevents immediate triggering when creating a new reminder
    if (msTillTrigger < 60000) {
      console.log('Trigger time is too soon, scheduling for tomorrow instead');
      triggerDate.setDate(triggerDate.getDate() + 1);
      console.log(`Rescheduled for: ${triggerDate.toLocaleString()}`);
      
      // Recalculate msTillTrigger after updating the date
      msTillTrigger = triggerDate.getTime() - now.getTime();
      console.log(`New time until trigger: ${Math.floor(msTillTrigger / (1000 * 60 * 60))}h ${Math.floor((msTillTrigger % (1000 * 60 * 60)) / (1000 * 60))}m`);
    }
    
    // Schedule the one-time notification with the adjusted date
    const oneTimeId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: true,
        data: { id: reminder.id, scheduledFor: triggerDate.toISOString() },
      },
      trigger: {
        date: triggerDate,  // Use exact date object
        repeats: false,
      },
      identifier: reminder.id,
    });
    
    console.log(`Successfully scheduled notification with ID: ${oneTimeId} for ${triggerDate.toLocaleString()}`);
    
    // Log all scheduled notifications for debugging
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Total scheduled notifications: ${allNotifications.length}`);
    
    return oneTimeId;
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
    console.log(`=== APPLYING ${reminders.length} REMINDERS ===`);
    
    // Get current scheduled notifications for debugging
    const beforeScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Before applying: ${beforeScheduled.length} notifications already scheduled`);
    
    // Cancel all existing notifications first to prevent duplicates
    console.log('Cancelling all existing notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Wait for cancellation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Double-check cancellation completed
    const afterCancel = await Notifications.getAllScheduledNotificationsAsync();
    if (afterCancel.length > 0) {
      console.warn(`Warning: ${afterCancel.length} notifications still exist after cancellation!`);
      
      // Try to cancel each one individually
      for (const notification of afterCancel) {
        if (notification.identifier) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      // Additional wait to ensure cancellation completes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Final cancellation check
      const finalCancel = await Notifications.getAllScheduledNotificationsAsync();
      if (finalCancel.length > 0) {
        console.error(`Failed to cancel all notifications. ${finalCancel.length} remain.`);
      }
    }
    
    // If no permission, request it
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('No permission to schedule notifications');
      return false;
    }
    
    // Schedule all enabled reminders one at a time
    let scheduledCount = 0;
    let scheduledIds = new Map(); // Track which reminders we've scheduled to prevent duplicates
    
    // Schedule sequentially with longer delays between each reminder
    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i];
      
      if (reminder.enabled && !scheduledIds.has(reminder.id)) {
        console.log(`[${i+1}/${reminders.length}] Scheduling reminder ID ${reminder.id} for ${formatTime(reminder.time)}`);
        
        // Add a longer delay to prevent batching issues
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        try {
          const id = await scheduleReminder(reminder);
          if (id) {
            scheduledCount++;
            scheduledIds.set(reminder.id, id);
            console.log(`Successfully scheduled reminder ID: ${id}`);
          } else {
            console.log(`Skipped scheduling reminder ID: ${reminder.id} (likely too soon)`);
          }
        } catch (err) {
          console.error(`Error scheduling reminder ID ${reminder.id}:`, err);
        }
      } else if (!reminder.enabled) {
        console.log(`[${i+1}/${reminders.length}] Skipping disabled reminder ID ${reminder.id}`);
      } else {
        console.log(`[${i+1}/${reminders.length}] Skipping already scheduled reminder ID ${reminder.id}`);
      }
    }
    
    console.log(`Successfully scheduled ${scheduledCount} of ${reminders.length} reminders`);
    
    // Final verification after a longer delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Double check what actually got scheduled
    const finalScheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    if (finalScheduled.length !== scheduledCount) {
      console.warn(`Expected ${scheduledCount} notifications, but found ${finalScheduled.length}`);
      
      // Log details of each scheduled notification for debugging
      finalScheduled.forEach((notification, index) => {
        const triggerDate = notification.trigger.value;
        console.log(`Notification ${index + 1} (ID: ${notification.identifier}): Scheduled for ${new Date(triggerDate).toLocaleString()}`);
      });
    }
    
    console.log(`=== FINAL VERIFICATION: ${finalScheduled.length} notifications are scheduled ===`);
    
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
