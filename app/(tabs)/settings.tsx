import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking, Platform, View, Modal, Dimensions } from 'react-native';
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

  useEffect(() => {
    const initialize = async () => {
      await registerForPushNotificationsAsync();
      await loadSound();
      await loadSettings();
    };
    initialize();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const updateNotifications = async () => {
      if (notificationsEnabled && Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          await scheduleNotification();
        }
      }
    };
    updateNotifications();
  }, [notificationsEnabled, reminderTime, reminderTime2, secondReminderEnabled]);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.multiGet([
        'notificationsEnabled',
        'reminderTime',
        'reminderTime2',
        'secondReminderEnabled',
        'soundEnabled',
        'hapticEnabled'
      ]);

      const [
        [_, notifEnabled],
        [__, rTime],
        [___, rTime2],
        [____, secondRemEnabled],
        [_____, sndEnabled],
        [______, haptEnabled]
      ] = settings;

      setNotificationsEnabled(notifEnabled === 'true');
      setReminderTime(rTime || '8:00 AM');
      setReminderTime2(rTime2 || '9:00 AM');
      setSecondReminderEnabled(secondRemEnabled === 'true');
      setSoundEnabled(sndEnabled !== 'false'); // Default to true if not set
      setHapticEnabled(haptEnabled !== 'false'); // Default to true if not set
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/click.mp3'),
        { shouldPlay: false }
      );
      setSound(sound);
    } catch (error) {
      console.error('Error loading sound:', error);
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
    if (Platform.OS === 'web') return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }]
        );
        return false;
      }

      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: soundEnabled,
          shouldSetBadge: false,
        }),
      });
      return true;
    } catch (error) {
      console.error('Error setting up notifications:', error);
      return false;
    }
  };

  const scheduleNotification = async () => {
    if (Platform.OS === 'web' || !notificationsEnabled) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await scheduleReminderAtTime(reminderTime, 'first-reminder');

      if (secondReminderEnabled) {
        await scheduleReminderAtTime(reminderTime2, 'second-reminder');
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to schedule notifications');
      }
    }
  };

  const scheduleReminderAtTime = async (timeString, identifier) => {
    try {
      const timePattern = /(\d+):(\d+)\s*(AM|PM)/i;
      const match = timeString.match(timePattern);

      if (!match) return;

      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      // Cancel existing notification before scheduling new one
      await Notifications.cancelScheduledNotificationAsync(identifier);

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: 'Declaration Reminder',
          body: "It's Declaration time",
          sound: soundEnabled ? 'default' : false,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      }).catch(error => {
        console.error('Failed to schedule notification:', error);
      });
    } catch (error) {
      console.error('Error in scheduleReminderAtTime:', error);
    }
  };

  const toggleNotifications = async (value) => {
    try {
      if (value) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              "Notification Permission",
              "Please enable notifications for this app in your device settings to receive reminders.",
              [{ text: "OK" }]
            );
            return;
          }
        }
      }

      setNotificationsEnabled(value);
      await saveSettings('notificationsEnabled', value);

      if (!value) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const toggleSound = async (value) => {
    setSoundEnabled(value);
    await saveSettings('soundEnabled', value);
    if (value && sound) await sound.replayAsync();
  };

  const toggleHaptic = async (value) => {
    setHapticEnabled(value);
    await saveSettings('hapticEnabled', value);
    if (value && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleTimeConfirm = async (date) => {
    try {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

      setTimePickerVisible(false);
      setReminderTime(formattedTime);
      await saveSettings('reminderTime', formattedTime);

      if (notificationsEnabled) {
        await scheduleNotification();
      }
    } catch (error) {
      console.error('Error in handleTimeConfirm:', error);
    }
  };

  const handleTimeConfirm2 = async (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

    setReminderTime2(formattedTime);
    await saveSettings('reminderTime2', formattedTime)
      .then(() => {
        if (notificationsEnabled && secondReminderEnabled) {
          // Small delay to ensure state is saved before scheduling
          setTimeout(() => scheduleNotification(), 300);
        }
      });
    setTimePickerVisible2(false);
  };

  const resetAllData = async () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure you want to reset all data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setNotificationsEnabled(false);
              setReminderTime('8:00 AM');
              setReminderTime2('9:00 AM');
              setSecondReminderEnabled(false);
              setSoundEnabled(true);
              setHapticEnabled(true);
              Alert.alert("Success", "All data has been reset.");
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert("Error", "Failed to reset data.");
            }
          }
        }
      ]
    );
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

  const SimpleTimePicker = ({ isVisible, onConfirm, onCancel, initialTime }) => {
    const [selectedHour, setSelectedHour] = useState(initialTime ? parseInt(initialTime.split(':')[0]) : 8);
    const [selectedMinute, setSelectedMinute] = useState(initialTime ? parseInt(initialTime.split(':')[1].split(' ')[0]) : 0);
    const [selectedPeriod, setSelectedPeriod] = useState(initialTime ? initialTime.split(' ')[1] : 'AM');

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ['AM', 'PM'];

    const handleConfirm = () => {
      const date = new Date();
      let hours24 = selectedHour;
      if (selectedPeriod === 'PM' && selectedHour < 12) hours24 += 12;
      if (selectedPeriod === 'AM' && selectedHour === 12) hours24 = 0;
      date.setHours(hours24);
      date.setMinutes(parseInt(selectedMinute));
      date.setSeconds(0);
      onConfirm(date);
    };

    if (!isVisible) return null;

    return (
      <Modal visible={isVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="light" style={styles.pickerContainer}>
            <ThemedText style={styles.pickerTitle}>Select Time</ThemedText>
            <View style={styles.pickerRowContainer}>
              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerColumnLabel}>Hour</ThemedText>
                <ScrollView style={styles.simplePickerList}>
                  {hours.map(hour => (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.pickerItem, selectedHour === parseInt(hour) && styles.selectedItem]}
                      onPress={() => setSelectedHour(parseInt(hour))}
                    >
                      <ThemedText style={[styles.pickerItemText, selectedHour === parseInt(hour) && styles.selectedText]}>
                        {hour}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerColumnLabel}>Minute</ThemedText>
                <ScrollView style={styles.simplePickerList}>
                  {minutes.map(minute => (
                    <TouchableOpacity
                      key={minute}
                      style={[styles.pickerItem, selectedMinute === parseInt(minute) && styles.selectedItem]}
                      onPress={() => setSelectedMinute(parseInt(minute))}
                    >
                      <ThemedText style={[styles.pickerItemText, selectedMinute === parseInt(minute) && styles.selectedText]}>
                        {minute}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={[styles.pickerColumn, styles.periodContainer]}>
                <ThemedText style={styles.pickerColumnLabel}>Period</ThemedText>
                <View>
                  {periods.map(period => (
                    <TouchableOpacity
                      key={period}
                      style={[styles.periodItem, selectedPeriod === period && styles.selectedItem]}
                      onPress={() => setSelectedPeriod(period)}
                    >
                      <ThemedText style={[styles.pickerItemText, selectedPeriod === period && styles.selectedText]}>
                        {period}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
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
            <TouchableOpacity onPress={() => setTimePickerVisible(true)}>
              <ThemedView style={styles.settingRow}>
                <ThemedText>Reminder Time 1</ThemedText>
                <ThemedText>{reminderTime}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTimePickerVisible2(true)}>
              <ThemedView style={styles.settingRow}>
                <ThemedText>Reminder Time 2</ThemedText>
                <ThemedText>{reminderTime2}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
            <ThemedView style={styles.settingRow}>
              <ThemedText>Enable Reminder 2</ThemedText>
              <Switch
                value={secondReminderEnabled}
                onValueChange={(value) => {
                  setSecondReminderEnabled(value);
                  saveSettings('secondReminderEnabled', value);
                }}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </ThemedView>
            <SimpleTimePicker
              isVisible={isTimePickerVisible}
              onConfirm={handleTimeConfirm}
              onCancel={() => setTimePickerVisible(false)}
              initialTime={reminderTime}
            />
            <SimpleTimePicker
              isVisible={isTimePickerVisible2}
              onConfirm={handleTimeConfirm2}
              onCancel={() => setTimePickerVisible2(false)}
              initialTime={reminderTime2}
            />
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
          <TouchableOpacity style={styles.dangerButton} onPress={resetAllData}>
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
    padding: width * 0.04,
  },
  scrollViewContent: {
    paddingBottom: height * 0.1,
  },
  section: {
    marginBottom: height * 0.04,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  timeText: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  buttonContainer: {
    marginTop: height * 0.04,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    width: Math.min(width * 0.85, 400),
    maxHeight: height * 0.7,
    borderRadius: 16,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
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
  pickerColumnLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  simplePickerList: {
    height: 150,
    width: '100%',
  },
  pickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  selectedText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  periodContainer: {
    height: 150,
    justifyContent: 'center',
  },
  periodItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
  pickerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
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