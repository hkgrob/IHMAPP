
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from './ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  requestNotificationPermissions,
  scheduleNotification,
  cancelAllNotifications,
  setupNotificationHandler,
  getScheduledNotifications
} from '../services/notificationService';

export default function NotificationSettings() {
  // Skip on web platform
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.webNotice}>
          Notifications are not available on web. Please use the mobile app.
        </ThemedText>
      </View>
    );
  }

  const [enabled, setEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings and schedule notifications when settings change
  useEffect(() => {
    if (enabled) {
      setupAndScheduleNotifications();
    } else {
      cancelAllNotifications();
    }
    
    saveSettings();
  }, [enabled, notificationTime, soundEnabled]);

  const loadSettings = async () => {
    try {
      const storedEnabled = await AsyncStorage.getItem('notificationsEnabled');
      const storedTime = await AsyncStorage.getItem('notificationTime');
      const storedSound = await AsyncStorage.getItem('soundEnabled');
      
      if (storedEnabled) setEnabled(storedEnabled === 'true');
      if (storedTime) setNotificationTime(new Date(parseInt(storedTime)));
      if (storedSound !== null) setSoundEnabled(storedSound === 'true');
      
      // Check current permission status
      const hasPermission = await requestNotificationPermissions();
      setPermissionStatus(hasPermission ? 'granted' : 'denied');
      
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', String(enabled));
      await AsyncStorage.setItem('notificationTime', String(notificationTime.getTime()));
      await AsyncStorage.setItem('soundEnabled', String(soundEnabled));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const setupAndScheduleNotifications = async () => {
    // Request permissions if not already granted
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      setEnabled(false);
      setPermissionStatus('denied');
      return;
    }
    
    setPermissionStatus('granted');
    
    // Setup notification handler with sound preference
    await setupNotificationHandler({ sound: soundEnabled });
    
    // Schedule daily reminder
    await scheduleNotification(
      'Declaration Reminder',
      "It's time for your daily declarations",
      notificationTime.getHours(),
      notificationTime.getMinutes(),
      'daily-declaration-reminder'
    );
    
    // Log scheduled notifications for debugging
    const scheduled = await getScheduledNotifications();
    console.log('Scheduled notifications:', scheduled);
  };

  const handleToggleNotifications = (value) => {
    setEnabled(value);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNotificationTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <ThemedText style={styles.settingLabel}>
          Enable Daily Reminders
        </ThemedText>
        <Switch
          value={enabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={enabled ? '#0a7ea4' : '#f4f3f4'}
        />
      </View>
      
      {permissionStatus === 'denied' && (
        <ThemedText style={styles.permissionWarning}>
          Notification permission is required. Please enable it in your device settings.
        </ThemedText>
      )}

      {enabled && (
        <>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>
              Reminder Time
            </ThemedText>
            <View style={styles.timeSelector}>
              <ThemedText 
                style={styles.timeText}
                onPress={() => setShowTimePicker(true)}
              >
                {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>
              Enable Sound
            </ThemedText>
            <Switch
              value={soundEnabled}
              onValueChange={(value) => setSoundEnabled(value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={soundEnabled ? '#0a7ea4' : '#f4f3f4'}
            />
          </View>
          
          {showTimePicker && (
            <DateTimePicker
              value={notificationTime}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 8,
  },
  webNotice: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeSelector: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  permissionWarning: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
