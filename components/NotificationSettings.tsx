import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Platform, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { 
  areNotificationsEnabled, 
  setNotificationsEnabled, 
  getNotificationTimes, 
  saveNotificationTimes, 
  configureNotifications 
} from '../services/notificationService';

export const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [morningTime, setMorningTime] = useState({ hour: 9, minute: 0 });
  const [eveningTime, setEveningTime] = useState({ hour: 20, minute: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if notifications are configured and enabled
        const enabled = await areNotificationsEnabled();
        setNotificationsEnabledState(enabled);

        // Get notification times
        const times = await getNotificationTimes();
        setMorningTime(times.morningTime);
        setEveningTime(times.eveningTime);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        // If turning on notifications, configure them first
        const configured = await configureNotifications();
        if (!configured) {
          Alert.alert(
            "Notification Permission Required",
            "Please enable notifications in your device settings to receive declaration reminders.",
            [{ text: "OK" }]
          );
          return;
        }
      }

      // Update local state
      setNotificationsEnabledState(value);

      // Save setting and schedule or cancel notifications
      await setNotificationsEnabled(value);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert(
        "Error",
        "There was a problem setting up notifications. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleMorningTimeChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowMorningPicker(Platform.OS === 'ios');

    if (selectedDate) {
      const newMorningTime = {
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes()
      };

      setMorningTime(newMorningTime);

      try {
        await saveNotificationTimes(newMorningTime, eveningTime);
        if (notificationsEnabled) {
          await setNotificationsEnabled(true); // This will reschedule notifications
        }
      } catch (error) {
        console.error('Error saving morning time:', error);
      }
    }
  };

  const handleEveningTimeChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEveningPicker(Platform.OS === 'ios');

    if (selectedDate) {
      const newEveningTime = {
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes()
      };

      setEveningTime(newEveningTime);

      try {
        await saveNotificationTimes(morningTime, newEveningTime);
        if (notificationsEnabled) {
          await setNotificationsEnabled(true); // This will reschedule notifications
        }
      } catch (error) {
        console.error('Error saving evening time:', error);
      }
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;
    return `${displayHour}:${displayMinute} ${period}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading notification settings...</ThemedText>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.notSupportedText}>
          Notifications are not supported on web. Please use the mobile app to set up notifications.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <ThemedText style={styles.settingLabel}>Enable Notifications</ThemedText>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: '#d3d3d3', true: '#0a7ea4' }}
          thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <View style={[styles.settingRow, { opacity: notificationsEnabled ? 1 : 0.5 }]}>
        <ThemedText style={styles.settingLabel}>Morning Reminder</ThemedText>
        <TouchableOpacity
          onPress={() => notificationsEnabled && setShowMorningPicker(true)}
          disabled={!notificationsEnabled}
          style={styles.timeButton}
        >
          <ThemedText style={styles.timeButtonText}>
            {formatTime(morningTime.hour, morningTime.minute)}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={[styles.settingRow, { opacity: notificationsEnabled ? 1 : 0.5 }]}>
        <ThemedText style={styles.settingLabel}>Evening Reminder</ThemedText>
        <TouchableOpacity
          onPress={() => notificationsEnabled && setShowEveningPicker(true)}
          disabled={!notificationsEnabled}
          style={styles.timeButton}
        >
          <ThemedText style={styles.timeButtonText}>
            {formatTime(eveningTime.hour, eveningTime.minute)}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {(showMorningPicker || Platform.OS === 'ios') && notificationsEnabled && (
        <DateTimePicker
          value={new Date().setHours(morningTime.hour, morningTime.minute)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleMorningTimeChange}
          style={{ display: showMorningPicker ? 'flex' : 'none' }}
        />
      )}

      {(showEveningPicker || Platform.OS === 'ios') && notificationsEnabled && (
        <DateTimePicker
          value={new Date().setHours(eveningTime.hour, eveningTime.minute)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEveningTimeChange}
          style={{ display: showEveningPicker ? 'flex' : 'none' }}
        />
      )}

      <ThemedText style={styles.helpText}>
        Notifications will remind you to say your declarations twice daily.
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  helpText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
  },
  notSupportedText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  }
});