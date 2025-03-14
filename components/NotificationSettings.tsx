
import React, { useState, useEffect } from 'react';
import { View, Switch, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { 
  saveNotificationSettings, 
  loadNotificationSettings,
  setupNotifications 
} from '../services/notificationService';

export const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  // Load saved settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadNotificationSettings();
        setNotificationsEnabled(settings.enabled);
        if (settings.time1) {
          setReminderTime(new Date(settings.time1));
        }
        
        // Check notification permissions
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Toggle notifications
  const toggleNotifications = async (value) => {
    try {
      if (value && permissionStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status);
        
        if (status !== 'granted') {
          console.log('Notification permission denied');
          return;
        }
      }
      
      setNotificationsEnabled(value);
      await saveNotificationSettings(value, reminderTime);
      await setupNotifications();
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  // Handle time picker change
  const handleTimeChange = async (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      setReminderTime(selectedTime);
      await saveNotificationSettings(notificationsEnabled, selectedTime);
      
      if (notificationsEnabled) {
        await setupNotifications();
      }
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <ThemedText style={styles.settingText}>Enable Reminders</ThemedText>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#767577', true: '#0a7ea4' }}
          thumbColor="#f4f3f4"
        />
      </View>
      
      {notificationsEnabled && (
        <>
          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => setShowTimePicker(true)}
            disabled={!notificationsEnabled}
          >
            <ThemedText style={styles.settingText}>Reminder Time</ThemedText>
            <ThemedText style={styles.timeText}>{formatTime(reminderTime)}</ThemedText>
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
      
      {permissionStatus === 'denied' && (
        <ThemedText style={styles.warningText}>
          Notifications permission denied. Please enable in device settings.
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  warningText: {
    color: '#ff6b00',
    marginTop: 8,
    fontSize: 14,
  }
});
