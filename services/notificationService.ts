
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
    // Cancel any existing notifications with this ID first
    try {
      await Notifications.cancelScheduledNotificationAsync(reminder.id);
      // Wait to ensure cancellation completes
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      console.log(`No existing notification found for ID: ${reminder.id}`);
    }
    
    // Parse the reminder time carefully
    const reminderTime = reminder.time instanceof Date ? reminder.time : new Date(reminder.time);
    
    // Ensure it's a valid date
    if (isNaN(reminderTime.getTime())) {
      console.error(`Invalid reminder time for ID ${reminder.id}`);
      return null;
    }
    
    const hours = reminderTime.getHours();
    const minutes = reminderTime.getMinutes();
    
    console.log(`Preparing to schedule reminder ID ${reminder.id} for ${hours}:${minutes.toString().padStart(2, '0')}`);
    
    // Get current time
    const now = new Date();
    
    // Create a Date for the next occurrence of this time
    // Start with today's date but with the specified hours/minutes
    const triggerDate = new Date();
    triggerDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
    
    // If the time is in the past today, schedule for tomorrow
    if (triggerDate <= now) {
      console.log(`Time ${formatTime(triggerDate)} is in the past, scheduling for tomorrow`);
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    
    // Calculate time until trigger for logging
    const msTillTrigger = triggerDate.getTime() - now.getTime();
    
    // CRITICAL: Force scheduling for next day if less than 5 minutes in the future
    // This provides a safety buffer to prevent immediate triggering
    if (msTillTrigger < 5 * 60 * 1000) { // 5 minutes in ms
      console.log(`Warning: Trigger time too soon (${Math.floor(msTillTrigger/1000)} seconds from now)`);
      triggerDate.setDate(triggerDate.getDate() + 1);
      console.log(`Forced reschedule to next day: ${triggerDate.toLocaleString()}`);
    }
    
    // Final time calculation for logging
    const finalMsTillTrigger = triggerDate.getTime() - now.getTime();
    const hoursTillTrigger = Math.floor(finalMsTillTrigger / (1000 * 60 * 60));
    const minutesTillTrigger = Math.floor((finalMsTillTrigger % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(`Scheduling notification to trigger in ${hoursTillTrigger}h ${minutesTillTrigger}m (${triggerDate.toLocaleString()})`);
    
    // Prepare a unique identifier with a timestamp to ensure uniqueness
    const uniqueId = `${reminder.id}_${Date.now()}`;
    
    // Set up notification content
    const notificationContent = {
      title: reminder.title || 'Declaration Reminder',
      body: reminder.body || 'Time to speak your declarations!',
      sound: true,
      data: { 
        id: reminder.id, 
        scheduledFor: triggerDate.toISOString(),
        createdAt: new Date().toISOString()
      },
    };
    
    // Schedule with delay to ensure cancellation completed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Schedule notification with the unique ID
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: {
        date: triggerDate,
        repeats: false,
      },
      identifier: uniqueId, // Use unique ID with timestamp
    });
    
    console.log(`Successfully scheduled notification with ID: ${notificationId} for ${triggerDate.toLocaleString()}`);
    
    return notificationId;
  } catch (error) {
    console.error(`Error scheduling reminder ID ${reminder.id}:`, error);
    return null;
  }
};

/**
 * Deeply cancel all scheduled notifications with retries
 * This is a more aggressive approach to ensure all notifications are canceled
 */
const deepCancelAllNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;
  
  try {
    // First attempt - standard cancel all
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Wait for cancellation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if cancellation was successful
    let remaining = await Notifications.getAllScheduledNotificationsAsync();
    
    // If notifications remain, try more aggressive approaches
    if (remaining.length > 0) {
      console.warn(`First cancellation attempt left ${remaining.length} notifications. Trying individual cancellation...`);
      
      // Try to cancel each notification individually
      for (const notification of remaining) {
        if (notification.identifier) {
          try {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between each cancel
          } catch (err) {
            console.error(`Failed to cancel notification ID ${notification.identifier}:`, err);
          }
        }
      }
      
      // Wait longer to ensure cancellations complete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check again
      remaining = await Notifications.getAllScheduledNotificationsAsync();
      
      if (remaining.length > 0) {
        console.warn(`Individual cancellation left ${remaining.length} notifications. Last resort attempt...`);
        
        // Last resort - try one more global cancellation
        await Notifications.cancelAllScheduledNotificationsAsync();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Final check
        remaining = await Notifications.getAllScheduledNotificationsAsync();
        if (remaining.length > 0) {
          console.error(`CRITICAL: Could not cancel all notifications. ${remaining.length} remain.`);
          return false;
        }
      }
    }
    
    console.log('All notifications successfully canceled');
    return true;
  } catch (error) {
    console.error('Error in deep cancellation:', error);
    return false;
  }
};

/**
 * Apply all reminders (schedule enabled ones, cancel disabled ones)
 */
export const applyAllReminders = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  
  try {
    // Log all existing notifications for debugging - before anything happens
    const beforeAll = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`=== STARTING WITH ${beforeAll.length} EXISTING NOTIFICATIONS ===`);
    
    // Get all reminders
    const reminders = await getReminders();
    const enabledReminders = reminders.filter(r => r.enabled);
    console.log(`=== APPLYING ${enabledReminders.length} ENABLED REMINDERS (${reminders.length} total) ===`);
    
    // Deeply cancel all existing notifications first - this is crucial
    console.log('Performing deep cancellation of all existing notifications...');
    const cancelSuccess = await deepCancelAllNotifications();
    if (!cancelSuccess) {
      console.error('Failed to completely cancel existing notifications. Continuing anyway...');
    }
    
    // Verify we have permission
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('No permission to schedule notifications');
      return false;
    }
    
    // If no enabled reminders, we're done
    if (enabledReminders.length === 0) {
      console.log('No enabled reminders to schedule');
      return true;
    }
    
    // Schedule each enabled reminder with careful tracking and spacing
    let scheduledCount = 0;
    let scheduledIds = new Set(); // Use a Set for more reliable tracking
    
    // Schedule sequentially with substantial delays between each
    for (let i = 0; i < enabledReminders.length; i++) {
      const reminder = enabledReminders[i];
      
      // Skip if already scheduled in this session
      if (scheduledIds.has(reminder.id)) {
        console.log(`Skipping already scheduled reminder ID ${reminder.id}`);
        continue;
      }
      
      console.log(`[${i+1}/${enabledReminders.length}] Scheduling reminder ID ${reminder.id} for ${formatTime(reminder.time)}`);
      
      // Add a substantial delay between each scheduling operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Schedule the reminder
        const id = await scheduleReminder(reminder);
        
        if (id) {
          scheduledCount++;
          scheduledIds.add(reminder.id);
          console.log(`Successfully scheduled reminder ID: ${id} for ${formatTime(reminder.time)}`);
          
          // Add extra delay after successful scheduling
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.warn(`Failed to schedule reminder ID: ${reminder.id} (returned null ID)`);
        }
      } catch (err) {
        console.error(`Error scheduling reminder ID ${reminder.id}:`, err);
      }
    }
    
    console.log(`Scheduled ${scheduledCount} of ${enabledReminders.length} enabled reminders`);
    
    // Final verification after a significant delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check what actually got scheduled
    const finalScheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    console.log(`=== FINAL VERIFICATION: ${finalScheduled.length} notifications are scheduled ===`);
    
    if (finalScheduled.length !== scheduledCount) {
      console.warn(`DISCREPANCY: Expected ${scheduledCount} notifications, but found ${finalScheduled.length}`);
      
      // Log details of each scheduled notification for debugging
      finalScheduled.forEach((notification, index) => {
        try {
          const triggerDate = notification.trigger.value;
          if (triggerDate) {
            console.log(`Notification ${index + 1} (ID: ${notification.identifier}): Scheduled for ${new Date(triggerDate).toLocaleString()}`);
          } else {
            console.log(`Notification ${index + 1} (ID: ${notification.identifier}): No trigger date found`);
          }
        } catch (err) {
          console.error(`Error logging notification details:`, err);
        }
      });
    }
    
    return scheduledCount > 0;
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
