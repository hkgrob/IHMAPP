import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking, Platform, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

// New NotificationSettings component
const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [reminderTime2, setReminderTime2] = useState(new Date());
  const [secondReminderEnabled, setSecondReminderEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTimePicker2, setShowTimePicker2] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.multiGet([
          'notificationsEnabled',
          'reminderTime',
          'reminderTime2',
          'secondReminderEnabled',
          'soundEnabled',
          'hapticEnabled',
        ]);

        const [
          [_, notifEnabled],
          [__, rTime],
          [___, rTime2],
          [____, secondRemEnabled],
          [_____, sndEnabled],
          [______, haptEnabled],
        ] = settings;

        const defaultTime = new Date();
        defaultTime.setHours(8, 0, 0, 0);
        const defaultTime2 = new Date();
        defaultTime2.setHours(20, 0, 0, 0); // 8 PM

        setNotificationsEnabled(notifEnabled === 'true');
        setReminderTime(rTime ? new Date(parseInt(rTime)) : defaultTime);
        setReminderTime2(rTime2 ? new Date(parseInt(rTime2)) : defaultTime2);
        setSecondReminderEnabled(secondRemEnabled === 'true');
        setSoundEnabled(sndEnabled !== 'false');
        setHapticEnabled(haptEnabled !== 'false');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };


  const scheduleNotifications = useCallback(async () => {
    if (Platform.OS === 'web' || !notificationsEnabled) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await scheduleNotification(reminderTime, 'first-reminder');

      if (secondReminderEnabled) {
        await scheduleNotification(reminderTime2, 'second-reminder');
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }, [notificationsEnabled, reminderTime, reminderTime2, secondReminderEnabled]);

  const scheduleNotification = async (time, identifier) => {
    try {
      const now = new Date();
      const triggerDate = new Date(now);
      triggerDate.setHours(time.getHours());
      triggerDate.setMinutes(time.getMinutes());
      triggerDate.setSeconds(0);
      triggerDate.setMilliseconds(0);

      if (triggerDate < now) {
        triggerDate.setDate(now.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: 'Declaration Reminder',
          body: "It's Declaration time!",
          sound: soundEnabled ? 'default' : undefined, // undefined for no sound
        },
        trigger: {
          date: triggerDate,
          repeats: true,
        },
      });
    } catch (error) {
      console.error(`Error scheduling ${identifier}:`, error);
    }
  };

  const toggleNotifications = async (value) => {
    try {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Notification Access Required',
            'Please enable notifications in your device settings to receive declaration reminders.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      setNotificationsEnabled(value);
      await saveSettings('notificationsEnabled', value);
      scheduleNotifications();
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const toggleSecondReminder = async (value) => {
    setSecondReminderEnabled(value);
    await saveSettings('secondReminderEnabled', value);
    scheduleNotifications();
  };

  const toggleSound = async (value) => {
    setSoundEnabled(value);
    await saveSettings('soundEnabled', value);
    scheduleNotifications();
  };

  const handleTimeChange = async (event, selectedDate) => {
    if (selectedDate) {
      setReminderTime(selectedDate);
      await saveSettings('reminderTime', selectedDate.getTime());
      scheduleNotifications();
      setShowTimePicker(Platform.OS !== 'ios'); // Close picker on Android
    } else {
      setShowTimePicker(false);
    }
  };

  const handleTimeChange2 = async (event, selectedDate) => {
    if (selectedDate) {
      setReminderTime2(selectedDate);
      await saveSettings('reminderTime2', selectedDate.getTime());
      scheduleNotifications();
      setShowTimePicker2(Platform.OS !== 'ios'); // Close picker on Android
    } else {
      setShowTimePicker2(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <View style={styles.settingRow}>
        <ThemedText style={styles.settingText}>ENABLE REMINDERS</ThemedText>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#767577', true: '#0a7ea4' }}
          thumbColor="#f4f3f4"
        />
      </View>
      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <View style={styles.settingRow}>
          <ThemedText style={styles.settingText}>REMINDER TIME 1</ThemedText>
          <ThemedText style={styles.timeText}>{formatTime(reminderTime)}</ThemedText>
        </View>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
      <View style={styles.settingRow}>
        <ThemedText style={styles.settingText}>ENABLE REMINDER 2</ThemedText>
        <Switch
          value={secondReminderEnabled}
          onValueChange={toggleSecondReminder}
          trackColor={{ false: '#767577', true: '#0a7ea4' }}
          thumbColor="#f4f3f4"
        />
      </View>
      {secondReminderEnabled && (
        <>
          <TouchableOpacity onPress={() => setShowTimePicker2(true)}>
            <View style={styles.settingRow}>
              <ThemedText style={styles.settingText}>REMINDER TIME 2</ThemedText>
              <ThemedText style={styles.timeText}>{formatTime(reminderTime2)}</ThemedText>
            </View>
          </TouchableOpacity>
          {showTimePicker2 && (
            <DateTimePicker
              value={reminderTime2}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange2}
            />
          )}
        </>
      )}
      <View style={styles.settingRow}>
        <ThemedText style={styles.settingText}>SOUND EFFECTS</ThemedText>
        <Switch
          value={soundEnabled}
          onValueChange={toggleSound}
          trackColor={{ false: '#767577', true: '#0a7ea4' }}
          thumbColor="#f4f3f4"
        />
      </View>
    </>
  );
};


const SettingsScreen = () => {
  const [hapticEnabled, setHapticEnabled] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.multiGet(['hapticEnabled']);
        const [[_, haptEnabled]] = settings;
        setHapticEnabled(haptEnabled !== 'false');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleHaptic = async (value) => {
    setHapticEnabled(value);
    await saveSettings('hapticEnabled', value);
    if (value && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
    <ThemedView style={styles.section}>
      <ThemedView style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#11181C" />
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </ThemedView>
      {children}
    </ThemedView>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ThemedText style={styles.title}>Settings</ThemedText>
      <ScrollView style={styles.scrollView} contentInsetAdjustmentBehavior="automatic">
        {renderSettingSection("NOTIFICATIONS", "notifications-outline", <NotificationSettings />)}
        {renderSettingSection("FEEDBACK", "options-outline", (
          <>
            <View style={styles.settingRow}>
              <ThemedText style={styles.settingText}>HAPTIC FEEDBACK</ThemedText>
              <Switch
                value={hapticEnabled}
                onValueChange={toggleHaptic}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </View>
          </>
        ))}
        {renderSettingSection("DATA MANAGEMENT", "server-outline", (
          <TouchableOpacity style={styles.dangerButton} onPress={resetAllData}>
            <ThemedText style={styles.dangerButtonText}>Reset All Data</ThemedText>
          </TouchableOpacity>
        ))}
        {renderSettingSection("ABOUT", "information-circle-outline", (
          <>
            <View style={styles.settingRow}>
              <ThemedText style={styles.settingText}>Version</ThemedText>
              <ThemedText style={styles.timeText}>1.0.4</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL('https://ignitinghope.com/privacy')}
            >
              <ThemedText style={styles.linkButtonText}>Privacy Policy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL('https://ignitinghope.com/terms')}
            >
              <ThemedText style={styles.linkButtonText}>Terms of Service</ThemedText>
            </TouchableOpacity>
          </>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
    borderBottomColor: '#e5e5e5',
    color: '#000',
    marginTop: Platform.OS === 'ios' ? 0 : 8,
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    width: '92%',
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#11181C',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a7ea4',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 15,
  },
  linkButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
  },
});

export default SettingsScreen;