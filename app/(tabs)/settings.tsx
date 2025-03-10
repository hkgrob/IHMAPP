import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('8:00 AM');
  const [reminderTime2, setReminderTime2] = useState('9:00 AM'); // Added second reminder time
  const [secondReminderEnabled, setSecondReminderEnabled] = useState(false); // Added flag for second reminder
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [sound, setSound] = useState(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isTimePickerVisible2, setTimePickerVisible2] = useState(false); // Added second time picker
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderDate2, setReminderDate2] = useState(new Date()); // Added second reminder date

  useEffect(() => {
    loadSettings();
    loadSound();
    registerForPushNotificationsAsync();
  }, []);

  const loadSettings = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const storedReminderTime = await AsyncStorage.getItem('reminderTime');
      const storedReminderTime2 = await AsyncStorage.getItem('reminderTime2'); // Added to load second reminder time
      const storedSecondReminderEnabled = await AsyncStorage.getItem('secondReminderEnabled'); // Added to load second reminder enable flag
      const storedSound = await AsyncStorage.getItem('soundEnabled');
      const storedHaptic = await AsyncStorage.getItem('hapticEnabled');

      if (storedNotifications) setNotificationsEnabled(storedNotifications === 'true');
      if (storedReminderTime) setReminderTime(storedReminderTime);
      if (storedReminderTime2) setReminderTime2(storedReminderTime2); // Added to set second reminder time
      if (storedSecondReminderEnabled) setSecondReminderEnabled(storedSecondReminderEnabled === 'true'); // Added to set second reminder enable flag
      if (storedSound) setSoundEnabled(storedSound === 'true');
      if (storedHaptic) setHapticEnabled(storedHaptic === 'true');
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadSound = async () => {
    try {
      // Use require directly to ensure proper asset resolution
      const soundAsset = require('../../assets/sounds/click.mp3');
      console.log('Loading sound asset in settings:', soundAsset);

      const { sound } = await Audio.Sound.createAsync(
        soundAsset,
        { shouldPlay: false }
      );

      if (sound) {
        setSound(sound);
        console.log('Sound loaded successfully in settings');
      } else {
        console.error('Sound object is null or undefined');
      }
    } catch (error) {
      console.error('Error loading sound in settings:', error);
    }
  };


  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return;
      }

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      console.log('Notification permissions granted');
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const scheduleNotification = async () => {
    if (Platform.OS === 'web' || !notificationsEnabled) {
      return;
    }

    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (notificationsEnabled) {
        // Schedule first reminder
        await scheduleReminderAtTime(reminderTime, 'first-reminder');

        // Schedule second reminder if enabled
        if (secondReminderEnabled) {
          await scheduleReminderAtTime(reminderTime2, 'second-reminder');
        }
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const scheduleReminderAtTime = async (timeString, identifier) => {
    // Parse hours and minutes from time string
    const timePattern = /(\d+):(\d+)\s*(AM|PM)/i;
    const match = timeString.match(timePattern);

    if (!match) {
      console.error('Invalid time format');
      return;
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Create a date object for today with the specified time
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntilReminder = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);

    await Notifications.scheduleNotificationAsync({
      identifier: identifier,
      content: {
        title: 'Declaration Reminder',
        body: 'Remember to make your daily declarations!',
        sound: true,
      },
      trigger: {
        seconds: secondsUntilReminder,
        repeats: true,
      },
    });

    console.log(`Notification scheduled for ${timeString} with ID: ${identifier}`);
  };

  const toggleNotifications = (value) => {
    setNotificationsEnabled(value);
    saveSettings('notificationsEnabled', value);

    // Schedule or cancel notifications based on the toggle
    if (value) {
      scheduleNotification();
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const toggleSound = (value) => {
    setSoundEnabled(value);
    saveSettings('soundEnabled', value);
  };

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleTimeConfirm = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

    setReminderTime(formattedTime);
    setReminderDate(date);
    saveSettings('reminderTime', formattedTime);
    hideTimePicker();

    // Reschedule notification with new time
    if (notificationsEnabled) {
      scheduleNotification();
    }
  };

  const toggleHaptic = (value) => {
    setHapticEnabled(value);
    saveSettings('hapticEnabled', value);
  };

  const resetAllData = () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure you want to reset all your declaration counts and settings? This cannot be undone.",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Success", "All data has been reset.");
              // Reset the state
              setNotificationsEnabled(false);
              setReminderTime('8:00 AM');
              setReminderTime2('9:00 AM'); // Reset second reminder time
              setSecondReminderEnabled(false); // Reset second reminder enabled flag
              setSoundEnabled(true);
              setHapticEnabled(true);
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert("Error", "Failed to reset data. Please try again.");
            }
          }
        }
      ]
    );
  };

  const showTimePicker2 = () => { // Added second time picker show function
    setTimePickerVisible2(true);
  };

  const hideTimePicker2 = () => { // Added second time picker hide function
    setTimePickerVisible2(false);
  };

  const handleTimeConfirm2 = (date) => { // Added second time picker confirm function
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

    setReminderTime2(formattedTime);
    setReminderDate2(date);
    saveSettings('reminderTime2', formattedTime);
    hideTimePicker2();

    // Reschedule notification with new time
    if (notificationsEnabled) {
      scheduleNotification();
    }
  };


  const renderSettingSection = (title, icon, children) => (
    <BlurView 
      intensity={80} 
      tint={colorScheme === 'dark' ? 'dark' : 'light'} 
      style={styles.section}
    >
      <ThemedView style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} />
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </ThemedView>
      {children}
    </BlurView>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedText style={styles.title}>Settings</ThemedText>

      <ScrollView style={styles.scrollView}>
        {renderSettingSection("Notifications", "notifications-outline", (
          <>
            <ThemedView style={styles.settingRow}>
              <ThemedText>Enable Reminders</ThemedText>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </ThemedView>
            <TouchableOpacity onPress={showTimePicker}>
              <ThemedView style={styles.settingRow}>
                <ThemedText>Reminder Time 1</ThemedText> {/* Added "1" for clarity */}
                <ThemedText>{reminderTime}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
            <TouchableOpacity onPress={showTimePicker2}> {/* Added second time picker */}
              <ThemedView style={styles.settingRow}>
                <ThemedText>Reminder Time 2</ThemedText> {/* Added "2" for clarity */}
                <ThemedText>{reminderTime2}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
            <ThemedView style={styles.settingRow}>
              <ThemedText>Enable Reminder 2</ThemedText>
              <Switch
                value={secondReminderEnabled}
                onValueChange={setSecondReminderEnabled}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </ThemedView>

            {Platform.OS !== 'web' && (
              <>
                <DateTimePickerModal
                  isVisible={isTimePickerVisible}
                  mode="time"
                  onConfirm={handleTimeConfirm}
                  onCancel={hideTimePicker}
                  date={reminderDate}
                />
                <DateTimePickerModal
                  isVisible={isTimePickerVisible2}
                  mode="time"
                  onConfirm={handleTimeConfirm2}
                  onCancel={hideTimePicker2}
                  date={reminderDate2}
                />
              </>
            )}
          </>
        ))}

        {renderSettingSection("Feedback", "options-outline", (
          <>
            <ThemedView style={styles.settingRow}>
              <ThemedText>Sound Effects</ThemedText>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </ThemedView>
            <ThemedView style={styles.settingRow}>
              <ThemedText>Haptic Feedback</ThemedText>
              <Switch
                value={hapticEnabled}
                onValueChange={toggleHaptic}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </ThemedView>
          </>
        ))}

        {renderSettingSection("Data Management", "server-outline", (
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={resetAllData}
          >
            <ThemedText style={styles.dangerButtonText}>Reset All Data</ThemedText>
          </TouchableOpacity>
        ))}

        {renderSettingSection("About", "information-circle-outline", (
          <>
            <ThemedView style={styles.settingRow}>
              <ThemedText>Version</ThemedText>
              <ThemedText>1.0.0</ThemedText>
            </ThemedView>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => Linking.openURL('https://yourwebsite.com/privacy')}
            >
              <ThemedText style={styles.linkButtonText}>Privacy Policy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => Linking.openURL('https://yourwebsite.com/terms')}
            >
              <ThemedText style={styles.linkButtonText}>Terms of Service</ThemedText>
            </TouchableOpacity>
          </>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 24,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  dangerButton: {
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  linkButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  linkButtonText: {
    color: '#0a7ea4',
  },
});