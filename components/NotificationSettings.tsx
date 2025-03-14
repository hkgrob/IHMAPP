import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import * as NotificationService from '../services/notificationService';
import { Ionicons } from '@expo/vector-icons';

export function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [morningTime, setMorningTime] = useState({ hour: 9, minute: 0 });
  const [eveningTime, setEveningTime] = useState({ hour: 20, minute: 0 });
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const enabled = await NotificationService.areNotificationsEnabled();
        setNotificationsEnabled(enabled);

        const times = await NotificationService.getNotificationTimes();
        setMorningTime(times.morningTime);
        setEveningTime(times.eveningTime);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const toggleNotifications = async (value) => {
    try {
      await NotificationService.setNotificationsEnabled(value);
      setNotificationsEnabled(value);

      if (value) {
        // If enabling notifications, request permissions
        const permissionGranted = await NotificationService.configureNotifications();
        if (!permissionGranted) {
          // If permissions not granted, revert switch
          setNotificationsEnabled(false);
          await NotificationService.setNotificationsEnabled(false);
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const formatTimeDisplay = (time) => {
    const hours = time.hour;
    const minutes = time.minute;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleMorningTimeChange = async (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowMorningPicker(false);
    }

    if (selectedDate) {
      const newTime = {
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes()
      };
      setMorningTime(newTime);

      try {
        await NotificationService.saveNotificationTimes(newTime, eveningTime);
      } catch (error) {
        console.error('Error saving morning time:', error);
      }
    }
  };

  const handleEveningTimeChange = async (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEveningPicker(false);
    }

    if (selectedDate) {
      const newTime = {
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes()
      };
      setEveningTime(newTime);

      try {
        await NotificationService.saveNotificationTimes(morningTime, newTime);
      } catch (error) {
        console.error('Error saving evening time:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading notification settings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.settingRow}>
        <ThemedText style={styles.settingLabel}>Enable Notifications</ThemedText>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#767577', true: '#FF6B00' }}
          thumbColor={notificationsEnabled ? '#FF6B00' : '#f4f3f4'}
        />
      </View>

      {notificationsEnabled && (
        <>
          <View style={styles.timeSettingRow}>
            <ThemedText style={styles.settingLabel}>Morning Reminder</ThemedText>
            <View style={styles.timeContainer}>
              <Ionicons name="sunny-outline" size={20} color="#FF6B00" style={styles.timeIcon} />
              <TouchableOpacity 
                onPress={() => setShowMorningPicker(true)}
                style={styles.timeButton}
              >
                <ThemedText style={styles.timeText}>{formatTimeDisplay(morningTime)}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeSettingRow}>
            <ThemedText style={styles.settingLabel}>Evening Reminder</ThemedText>
            <View style={styles.timeContainer}>
              <Ionicons name="moon-outline" size={20} color="#FF6B00" style={styles.timeIcon} />
              <TouchableOpacity 
                onPress={() => setShowEveningPicker(true)}
                style={styles.timeButton}
              >
                <ThemedText style={styles.timeText}>{formatTimeDisplay(eveningTime)}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {showMorningPicker && (
            <DateTimePicker
              value={new Date().setHours(morningTime.hour, morningTime.minute)}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleMorningTimeChange}
              onDismiss={() => setShowMorningPicker(false)}
            />
          )}

          {showEveningPicker && (
            <DateTimePicker
              value={new Date().setHours(eveningTime.hour, eveningTime.minute)}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEveningTimeChange}
              onDismiss={() => setShowEveningPicker(false)}
            />
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 8,
  },
  timeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B00',
  },
});