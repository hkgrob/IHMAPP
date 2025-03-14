
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
    // Default to current time if not provided
    const reminderTime = time || new Date();
    
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
    
    // Create a Date for today at the specified time
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
    
    // Make sure we're using date-based scheduling for maximum reliability
    // This ensures the notification will fire at exactly the right time
    
    // First schedule the one-time notification for the next occurrence with exact date
    return await Notifications.scheduleNotificationAsync({
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
    }).then(id => {
      console.log(`Successfully scheduled next notification with ID: ${id} for ${triggerDate.toLocaleString()}`);
      
      // Log all scheduled notifications for debugging
      Notifications.getAllScheduledNotificationsAsync().then(notifications => {
        console.log(`Total scheduled notifications: ${notifications.length}`);
        notifications.forEach(n => {
          console.log(`- ID: ${n.identifier}, Content: ${n.content.title}, Trigger: ${JSON.stringify(n.trigger)}`);
        });
      });
      
      // Schedule daily recurring notifications - but with a delay
      // This helps prevent Expo from batching notifications and causing duplicates
      setTimeout(() => {
        Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.body, 
            sound: true,
            data: { id: `${reminder.id}_recurring` },
          },
          trigger: {
            hour: hours,
            minute: minutes,
            repeats: true,
          },
          identifier: `${reminder.id}_recurring`,
        }).then(() => {
          console.log(`Successfully scheduled recurring notification for ${hours}:${minutes}`);
        }).catch(error => {
          console.error('Error scheduling recurring reminder:', error);
        });
      }, 1000); // Add 1 second delay between scheduling
      
      return id;
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
    console.log(`=== APPLYING ${reminders.length} REMINDERS ===`);
    
    // Get current scheduled notifications for debugging
    const beforeScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Before applying: ${beforeScheduled.length} notifications already scheduled`);
    
    // Cancel all existing notifications first to prevent duplicates
    console.log('Cancelling all existing notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Verify cancellation
    const afterCancel = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`After cancellation: ${afterCancel.length} notifications remain scheduled`);
    
    // If no permission, request it
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('No permission to schedule notifications');
      return false;
    }
    
    // Schedule all enabled reminders with delays between each
    let scheduledCount = 0;
    
    // Use sequential promises with delays instead of for loop
    const scheduleSequentially = async () => {
      for (let i = 0; i < reminders.length; i++) {
        const reminder = reminders[i];
        
        if (reminder.enabled) {
          console.log(`[${i+1}/${reminders.length}] Scheduling reminder ID ${reminder.id} for ${formatTime(reminder.time)}`);
          
          // Add a longer delay between scheduling to prevent rate limiting and batching
          await new Promise(resolve => setTimeout(resolve, 800));
          
          try {
            const id = await scheduleReminder(reminder);
            if (id) {
              scheduledCount++;
              console.log(`Successfully scheduled reminder ID: ${id}`);
            } else {
              console.error(`Failed to schedule reminder ID: ${reminder.id}`);
            }
          } catch (err) {
            console.error(`Error scheduling reminder ID ${reminder.id}:`, err);
          }
        } else {
          console.log(`[${i+1}/${reminders.length}] Skipping disabled reminder ID ${reminder.id}`);
        }
      }
    };
    
    // Run the sequential scheduling
    await scheduleSequentially();
    
    console.log(`Successfully scheduled ${scheduledCount} of ${reminders.length} reminders`);
    
    // Final verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    const finalScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`=== FINAL VERIFICATION: ${finalScheduled.length} notifications are scheduled ===`);
    
    if (finalScheduled.length > 0) {
      console.log('Scheduled notifications details:');
      finalScheduled.forEach((notification, index) => {
        const trigger = notification.trigger as any;
        const content = notification.content;
        console.log(`[${index + 1}] ID: ${notification.identifier}`);
        console.log(`    Title: ${content.title}`);
        console.log(`    Body: ${content.body}`);
        
        // Format trigger time information in a readable way
        if (trigger.date) {
          console.log(`    Trigger: At exact date ${new Date(trigger.date).toLocaleString()}`);
        } else if (trigger.hour !== undefined && trigger.minute !== undefined) {
          console.log(`    Trigger: Daily at ${trigger.hour}:${trigger.minute < 10 ? '0' : ''}${trigger.minute}`);
        } else {
          console.log(`    Trigger: ${JSON.stringify(trigger)}`);
        }
        
        if (content.data && content.data.scheduledFor) {
          console.log(`    Scheduled for: ${new Date(content.data.scheduledFor).toLocaleString()}`);
        }
      });
    }
    
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
