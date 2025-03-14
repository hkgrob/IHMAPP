
import React, { useState, useEffect } from 'react';
import { View, Switch, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { 
  getSettings, 
  saveSettings, 
  applySettings, 
  requestPermissions 
} from '../services/notificationService';

export const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    morningTime: new Date(new Date().setHours(9, 0, 0, 0)),
    eveningTime: new Date(new Date().setHours(18, 0, 0, 0)),
    secondReminderEnabled: true,
  });
  
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  
  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);
  
  // Check notification permissions
  const checkPermissions = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      console.log('Notification permission status:', status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };
  
  // Load settings
  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
      console.log('Loaded settings:', savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Save and apply new settings
  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      setSettings(newSettings);
      await saveSettings(newSettings);
      console.log('Saved new settings:', newSettings);
      
      if (newSettings.enabled) {
        const success = await applySettings(newSettings);
        if (!success && Platform.OS !== 'web') {
          Alert.alert(
            'Notification Permission',
            'Please enable notifications in your device settings to receive declaration reminders.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // If notifications are disabled, cancel all scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert(
        'Error',
        'Failed to update notification settings. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle notifications
  const toggleNotifications = async (value) => {
    try {
      if (value && Platform.OS !== 'web') {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Notification Permission Required',
            'Please enable notifications in your device settings to receive declaration reminders.',
            [{ text: 'OK' }]
          );
          return;
        }
        setPermissionStatus('granted');
      }
      
      await updateSettings({ ...settings, enabled: value });
      
      // Get scheduled notifications for debugging
      if (Platform.OS !== 'web') {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        console.log('Current scheduled notifications:', scheduled.length);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };
  
  // Toggle second reminder (evening)
  const toggleSecondReminder = async (value) => {
    try {
      await updateSettings({ ...settings, secondReminderEnabled: value });
    } catch (error) {
      console.error('Error toggling second reminder:', error);
    }
  };
  
  // Handle morning time change
  const handleMorningTimeChange = (event, selectedTime) => {
    setShowMorningPicker(Platform.OS === 'ios');
    if (selectedTime) {
      updateSettings({ ...settings, morningTime: selectedTime });
    }
  };
  
  // Handle evening time change
  const handleEveningTimeChange = (event, selectedTime) => {
    setShowEveningPicker(Platform.OS === 'ios');
    if (selectedTime) {
      updateSettings({ ...settings, eveningTime: selectedTime });
    }
  };
  
  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.notSupportedContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#ff6b00" />
          <ThemedText style={styles.notSupportedText}>
            Notifications are not supported in web browsers
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Declaration Reminders</ThemedText>
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingLabelContainer}>
          <Ionicons name="notifications-outline" size={22} color="#0a7ea4" style={styles.icon} />
          <ThemedText style={styles.settingText}>Enable Reminders</ThemedText>
        </View>
        <Switch
          value={settings.enabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#767577', true: '#0a7ea4' }}
          thumbColor="#f4f3f4"
          disabled={loading}
        />
      </View>
      
      {settings.enabled && (
        <>
          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => setShowMorningPicker(true)}
            disabled={loading}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="sunny-outline" size={22} color="#0a7ea4" style={styles.icon} />
              <ThemedText style={styles.settingText}>Morning Reminder</ThemedText>
            </View>
            <ThemedText style={styles.timeText}>{formatTime(settings.morningTime)}</ThemedText>
          </TouchableOpacity>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon-outline" size={22} color="#0a7ea4" style={styles.icon} />
              <ThemedText style={styles.settingText}>Enable Evening Reminder</ThemedText>
            </View>
            <Switch
              value={settings.secondReminderEnabled}
              onValueChange={toggleSecondReminder}
              trackColor={{ false: '#767577', true: '#0a7ea4' }}
              thumbColor="#f4f3f4"
              disabled={loading}
            />
          </View>
          
          {settings.secondReminderEnabled && (
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={() => setShowEveningPicker(true)}
              disabled={loading}
            >
              <View style={styles.settingLabelContainer}>
                <Ionicons name="time-outline" size={22} color="#0a7ea4" style={styles.icon} />
                <ThemedText style={styles.settingText}>Evening Reminder Time</ThemedText>
              </View>
              <ThemedText style={styles.timeText}>{formatTime(settings.eveningTime)}</ThemedText>
            </TouchableOpacity>
          )}
          
          {showMorningPicker && (
            <DateTimePicker
              value={settings.morningTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleMorningTimeChange}
            />
          )}
          
          {showEveningPicker && (
            <DateTimePicker
              value={settings.eveningTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEveningTimeChange}
            />
          )}
          
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#0a7ea4" />
            <ThemedText style={styles.infoText}>
              You will receive reminders to speak your declarations at the times set above.
            </ThemedText>
          </View>
        </>
      )}
      
      {permissionStatus === 'denied' && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={20} color="#ff6b00" />
          <ThemedText style={styles.warningText}>
            Notifications permission denied. Please enable in device settings.
          </ThemedText>
        </View>
      )}
      
      {loading && (
        <View style={styles.infoContainer}>
          <Ionicons name="sync-outline" size={20} color="#0a7ea4" />
          <ThemedText style={styles.infoText}>
            Updating notification settings...
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  header: {
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  settingText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff0e6',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#ff6b00',
    marginLeft: 10,
    flex: 1,
  },
  notSupportedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  notSupportedText: {
    fontSize: 14,
    marginLeft: 10,
  }
});
