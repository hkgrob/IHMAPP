import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking, Platform, FlatList, View, Modal, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('8:00 AM');
  const [reminderTime2, setReminderTime2] = useState('9:00 AM');
  const [secondReminderEnabled, setSecondReminderEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [sound, setSound] = useState(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isTimePickerVisible2, setTimePickerVisible2] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderDate2, setReminderDate2] = useState(new Date());

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        if (Notifications) {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('Notification permissions not granted');
            Alert.alert(
              'Notifications Disabled',
              'Please enable notifications in your device settings to receive reminders.',
              [{ text: 'OK' }]
            );
          } else {
            console.log('Notification permissions granted');

            // Check existing scheduled notifications
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            console.log(`Found ${scheduledNotifications.length} scheduled notifications`);
          }
        } else {
          console.log('Notifications not supported on web');
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
    loadSound();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const storedReminderTime = await AsyncStorage.getItem('reminderTime');
      const storedReminderTime2 = await AsyncStorage.getItem('reminderTime2');
      const storedSecondReminderEnabled = await AsyncStorage.getItem('secondReminderEnabled');
      const storedSound = await AsyncStorage.getItem('soundEnabled');
      const storedHaptic = await AsyncStorage.getItem('hapticEnabled');

      if (storedNotifications) setNotificationsEnabled(storedNotifications === 'true');
      if (storedReminderTime) setReminderTime(storedReminderTime);
      if (storedReminderTime2) setReminderTime2(storedReminderTime2);
      if (storedSecondReminderEnabled) setSecondReminderEnabled(storedSecondReminderEnabled === 'true');
      if (storedSound) setSoundEnabled(storedSound === 'true');
      if (storedHaptic) setHapticEnabled(storedHaptic === 'true');

      // Schedule notifications if enabled and not on web platform
      if (storedNotifications === 'true' && Platform.OS !== 'web') {
        console.log('Notifications enabled, scheduling after loading settings');
        // Use setTimeout to ensure state is updated before scheduling
        setTimeout(() => scheduleNotification(), 500);
      } else if (storedNotifications === 'true' && Platform.OS === 'web') {
        console.log('Notifications enabled but not scheduling on web platform');
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadSound = async () => {
    try {
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
      console.log('Skipping notification scheduling: Web platform or notifications disabled');
      return;
    }

    try {
      console.log('Cancelling all scheduled notifications before rescheduling');
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (notificationsEnabled) {
        console.log(`Scheduling first reminder at ${reminderTime}`);
        await scheduleReminderAtTime(reminderTime, 'first-reminder');

        if (secondReminderEnabled) {
          console.log(`Scheduling second reminder at ${reminderTime2}`);
          await scheduleReminderAtTime(reminderTime2, 'second-reminder');
        }
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      // Don't show alerts on web platform
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Notification Error',
          'There was a problem setting up your notifications. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const scheduleReminderAtTime = async (timeString, identifier) => {
    try {
      const timePattern = /(\d+):(\d+)\s*(AM|PM)/i;
      const match = timeString.match(timePattern);

      if (!match) {
        console.error(`Invalid time format: ${timeString}`);
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

    console.log(`Scheduling for ${hours}:${minutes} (${period})`);

    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0, // seconds
      0  // milliseconds
    );

    // If time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
      console.log('Time already passed today, scheduling for tomorrow');
    }

    const secondsUntilReminder = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);
    console.log(`Seconds until reminder: ${secondsUntilReminder}`);

    try {
      if (!Notifications) {
        console.log('Notifications not supported on this platform');
        Alert.alert('Reminder Set', `Daily reminder set for ${timeString}`, [{ text: 'OK' }]);
        return;
      }
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: identifier,
        content: {
          title: 'Declaration Reminder',
          body: "It's Declaration time",
          sound: true,
        },
        trigger: {
          seconds: secondsUntilReminder,
          repeats: true,
        },
      });

      console.log(`Notification scheduled for ${timeString} with ID: ${notificationId || identifier}`);

      // Show confirmation to the user
      Alert.alert('Reminder Set', `Daily reminder set for ${timeString}`, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      // Handle errors more gracefully and don't show success message on error
      if (Platform.OS !== 'web') {
        Alert.alert('Reminder Issue', `Could not set reminder for ${timeString}. Please try again.`, [{ text: 'OK' }]);
      } else {
        console.log('Notification error in web platform:', error);
      }
    }
  } catch (error) {
    console.error('Error in scheduleReminderAtTime:', error);
  }
  };

  const toggleNotifications = (value) => {
    setNotificationsEnabled(value);
    saveSettings('notificationsEnabled', value);

    if (value) {
      scheduleNotification();
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const toggleSound = async (value) => {
    setSoundEnabled(value);
    await saveSettings('soundEnabled', value.toString());
    // Test sound when enabled
    if (value && sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.error('Error playing test sound:', error);
      }
    }
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

    if (notificationsEnabled) {
      scheduleNotification();
    }
  };

  const toggleHaptic = async (value) => {
    setHapticEnabled(value);
    console.log('Setting haptic enabled to:', value);
    
    // Store as string 'true' or 'false'
    const valueToStore = value ? 'true' : 'false';
    
    try {
      await AsyncStorage.setItem('hapticEnabled', valueToStore);
      console.log('Saved haptic setting:', valueToStore);
      
      // Test haptic when enabled and not on web
      if (value && Platform.OS !== 'web') {
        console.log('Testing haptic feedback after toggle');
        
        try {
          // Force a stronger haptic for testing to ensure it's noticeable
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log('Haptic test triggered successfully with notification type');
          
          // Also try impact type as fallback
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          console.log('Haptic test also succeeded with impact type');
        } catch (hapticError) {
          console.error('Error with haptic feedback test:', hapticError);
          
          // Try vibration as fallback
          try {
            Vibration.vibrate(100);
            console.log('Fallback vibration triggered during test');
          } catch (vibError) {
            console.error('Vibration fallback also failed:', vibError);
          }
        }
      }
    } catch (storageError) {
      console.error('Error saving haptic setting:', storageError);
      Alert.alert('Settings Error', 'Failed to save haptic setting');
    }
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
              setNotificationsEnabled(false);
              setReminderTime('8:00 AM');
              setReminderTime2('9:00 AM');
              setSecondReminderEnabled(false);
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

  const showTimePicker2 = () => {
    setTimePickerVisible2(true);
  };

  const hideTimePicker2 = () => {
    setTimePickerVisible2(false);
  };

  const handleTimeConfirm2 = (date) => {
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

  // Time picker components
  const ScrollableTimePicker = ({ isVisible, onConfirm, onCancel, initialTime }) => {
    if (!isVisible) return null;

    const [selectedHour, setSelectedHour] = useState(initialTime ? parseInt(initialTime.split(':')[0]) : 8);
    const [selectedMinute, setSelectedMinute] = useState(initialTime ? parseInt(initialTime.split(':')[1].split(' ')[0]) : 0);
    const [selectedPeriod, setSelectedPeriod] = useState(initialTime ? initialTime.split(' ')[1] : 'AM');

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ['AM', 'PM'];

    const handleConfirm = () => {
      const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      const date = new Date();
      let hours24 = selectedHour;

      if (selectedPeriod === 'PM' && selectedHour < 12) {
        hours24 += 12;
      } else if (selectedPeriod === 'AM' && selectedHour === 12) {
        hours24 = 0;
      }

      date.setHours(hours24);
      date.setMinutes(parseInt(selectedMinute));
      date.setSeconds(0);

      onConfirm(date);
    };

    const renderItem = (item, selected, onSelect) => (
      <TouchableOpacity 
        style={[styles.pickerItem, selected === item && styles.selectedPickerItem]} 
        onPress={() => onSelect(item)}
      >
        <ThemedText style={[styles.pickerItemText, selected === item && styles.selectedPickerItemText]}>
          {item}
        </ThemedText>
      </TouchableOpacity>
    );

    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="light" style={styles.pickerContainer}>
            <ThemedText style={styles.pickerTitle}>Select Time</ThemedText>

            <View style={styles.pickerRowContainer}>
              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerLabel}>Hour</ThemedText>
                <FlatList
                  data={hours}
                  renderItem={({ item }) => renderItem(item, selectedHour.toString(), hour => setSelectedHour(parseInt(hour)))}
                  keyExtractor={item => `hour-${item}`}
                  showsVerticalScrollIndicator={true}
                  style={styles.pickerList}
                  contentContainerStyle={styles.pickerListContent}
                  initialScrollIndex={hours.findIndex(h => parseInt(h) === selectedHour)}
                  getItemLayout={(data, index) => ({
                    length: 44,
                    offset: 44 * index,
                    index,
                  })}
                />
              </View>

              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerLabel}>Minute</ThemedText>
                <FlatList
                  data={minutes}
                  renderItem={({ item }) => renderItem(item, selectedMinute.toString().padStart(2, '0'), minute => setSelectedMinute(minute))}
                  keyExtractor={item => `minute-${item}`}
                  showsVerticalScrollIndicator={true}
                  style={styles.pickerList}
                  contentContainerStyle={styles.pickerListContent}
                  initialScrollIndex={minutes.findIndex(m => m === selectedMinute.toString().padStart(2, '0'))}
                  getItemLayout={(data, index) => ({
                    length: 44,
                    offset: 44 * index,
                    index,
                  })}
                />
              </View>

              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerLabel}>Period</ThemedText>
                <FlatList
                  data={periods}
                  renderItem={({ item }) => renderItem(item, selectedPeriod, period => setSelectedPeriod(period))}
                  keyExtractor={item => `period-${item}`}
                  showsVerticalScrollIndicator={true}
                  style={[styles.pickerList, { height: 88 }]}
                  contentContainerStyle={styles.pickerListContent}
                  initialScrollIndex={periods.findIndex(p => p === selectedPeriod)}
                  getItemLayout={(data, index) => ({
                    length: 44,
                    offset: 44 * index,
                    index,
                  })}
                />
              </View>
            </View>

            <View style={styles.pickerButtonContainer}>
              <TouchableOpacity style={styles.pickerButton} onPress={onCancel}>
                <ThemedText style={styles.pickerButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pickerButton, styles.confirmButton]} onPress={handleConfirm}>
                <ThemedText style={[styles.pickerButtonText, { color: '#fff' }]}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    );
  };

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
                <ThemedText>Reminder Time 1</ThemedText>
                <ThemedText>{reminderTime}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
            <TouchableOpacity onPress={showTimePicker2}>
              <ThemedView style={styles.settingRow}>
                <ThemedText>Reminder Time 2</ThemedText>
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

            <ScrollableTimePicker isVisible={isTimePickerVisible} onConfirm={handleTimeConfirm} onCancel={hideTimePicker} initialTime={reminderTime} />
            <ScrollableTimePicker isVisible={isTimePickerVisible2} onConfirm={handleTimeConfirm2} onCancel={hideTimePicker2} initialTime={reminderTime2}/>
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
    paddingHorizontal: width * 0.04, // 4% of screen width for responsive padding
    paddingTop: height * 0.02, //Added paddingTop
    paddingBottom: height * 0.02 //Added paddingBottom
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: height * 0.03, 
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%', 
  },
  section: {
    borderRadius: 16,
    marginBottom: height * 0.025, 
    overflow: 'hidden',
    width: '100%', 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04, // Responsive padding
    paddingVertical: height * 0.015, //Added paddingTop and paddingBottom
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
    paddingHorizontal: width * 0.04, // Responsive padding
    paddingVertical: height * 0.015, //Added paddingTop and paddingBottom
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
    width: '100%', 
  },
  dangerButton: {
    paddingHorizontal: width * 0.04, // Responsive padding
    paddingVertical: height * 0.02, //Added paddingTop and paddingBottom
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  linkButton: {
    paddingHorizontal: width * 0.04, // Responsive padding
    paddingVertical: height * 0.02, //Added paddingTop and paddingBottom
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  linkButtonText: {
    color: '#0a7ea4',
  },
  // Scrollable Time Picker Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    width: Math.min(width * 0.85, 400), 
    borderRadius: 16,
    paddingHorizontal: width * 0.05, // Responsive padding
    paddingVertical: height * 0.02, //Added paddingTop and paddingBottom
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: height * 0.025,
  },
  pickerRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
    width: '100%', 
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: width * 0.02, 
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerList: {
    height: height * 0.18, 
    width: '100%',
  },
  pickerListContent: {
    paddingVertical: height * 0.05, 
  },
  pickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedPickerItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  pickerItemText: {
    fontSize: 18,
  },
  selectedPickerItemText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  pickerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pickerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});