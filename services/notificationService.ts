
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Simple notification service with minimal dependencies
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }

  try {
    // Check if device can receive notifications
    if (!Device.isDevice) {
      console.log('Must use physical device for notifications');
      return false;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleNotification(title, body, hour, minute, identifier) {
  if (Platform.OS === 'web') return null;

  try {
    // Cancel any existing notification with same ID
    await Notifications.cancelScheduledNotificationAsync(identifier);
    
    // Calculate trigger time
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hour);
    scheduledTime.setMinutes(minute);
    scheduledTime.setSeconds(0);
    scheduledTime.setMilliseconds(0);
    
    // If time is in the past, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log(`Scheduling notification "${title}" for ${scheduledTime.toLocaleString()}`);

    // Schedule notification
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
      identifier,
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function cancelAllNotifications() {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all scheduled notifications');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

export async function setupNotificationHandler(options = { sound: true }) {
  if (Platform.OS === 'web') return;

  // Set up notification handler
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: options.sound,
      shouldSetBadge: false,
    }),
  });

  // Set up Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('declaration-reminders', {
      name: 'Declaration Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function getScheduledNotifications() {
  if (Platform.OS === 'web') return [];
  
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}
