import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking, Platform, View, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [reminderTime2, setReminderTime2] = useState(new Date());
  const [secondReminderEnabled, setSecondReminderEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [sound, setSound] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTimePicker2, setShowTimePicker2] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await registerForPushNotificationsAsync();
      await loadSound();
      await loadSettings();
    };
    initialize();

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

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

      const defaultTime = new Date();
      defaultTime.setHours(8, 0, 0, 0);
      const defaultTime2 = new Date();
      defaultTime2.setHours(9, 0, 0, 0);

      setNotificationsEnabled(notifEnabled === 'true');
      setReminderTime(rTime ? new Date(parseInt(rTime)) : defaultTime);
      setReminderTime2(rTime2 ? new Date(parseInt(rTime2)) : defaultTime2);
      setSecondReminderEnabled(secondRemEnabled === 'true');
      setSoundEnabled(sndEnabled !== 'false');
      setHapticEnabled(haptEnabled !== 'false');
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
    if (Platform.OS === 'web') return false;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in settings.',
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

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('declaration-reminders', {
          name: 'Declaration Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error setting up notifications:', error);
      return false;
    }
  };

  const scheduleNotifications = useCallback(async () => {
    if (Platform.OS === 'web' || !notificationsEnabled) return;

    try {
      console.log('Canceling all scheduled notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();

      console.log('Scheduling first reminder at:', reminderTime.toLocaleTimeString());
      await scheduleNotification(reminderTime, 'first-reminder');

      if (secondReminderEnabled) {
        console.log('Scheduling second reminder at:', reminderTime2.toLocaleTimeString());
        await scheduleNotification(reminderTime2, 'second-reminder');
      }

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', scheduled);
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }, [notificationsEnabled, reminderTime, reminderTime2, secondReminderEnabled, soundEnabled]);

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

      console.log(`Scheduling ${identifier} for:`, triggerDate.toISOString());

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: 'Declaration Reminder',
          body: "It's Declaration time",
          sound: soundEnabled ? 'default' : false,
        },
        trigger: {
          channelId: 'declaration-reminders',
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
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to use this feature.',
              [{ text: 'OK' }]
            );
            return;
          }
        }

        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: soundEnabled,
            shouldSetBadge: false,
          }),
        });

        setNotificationsEnabled(true);
        await saveSettings('notificationsEnabled', true);
        await scheduleNotifications();
      } else {
        setNotificationsEnabled(false);
        await saveSettings('notificationsEnabled', false);
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert(
        'Error',
        'Failed to update notification settings. Please try again.',
        [{ text: 'OK' }]
      );
      // Revert the toggle state on error
      setNotificationsEnabled(!value);
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

  const handleTimeChange = async (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    if (selectedDate) {
      setReminderTime(selectedDate);
      await saveSettings('reminderTime', selectedDate.getTime());
      if (Platform.OS !== 'ios') {
        setShowTimePicker(false);
      }
      if (notificationsEnabled) {
        await scheduleNotifications();
      }
    }
  };

  const handleTimeChange2 = async (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowTimePicker2(false);
      return;
    }
    if (selectedDate) {
      setReminderTime2(selectedDate);
      await saveSettings('reminderTime2', selectedDate.getTime());
      if (Platform.OS !== 'ios') {
        setShowTimePicker2(false);
      }
      if (notificationsEnabled && secondReminderEnabled) {
        await scheduleNotifications();
      }
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              const defaultTime = new Date();
              defaultTime.setHours(8, 0, 0, 0);
              const defaultTime2 = new Date();
              defaultTime2.setHours(9, 0, 0, 0);

              setNotificationsEnabled(false);
              setReminderTime(defaultTime);
              setReminderTime2(defaultTime2);
              setSecondReminderEnabled(false);
              setSoundEnabled(true);
              setHapticEnabled(true);
              await Notifications.cancelAllScheduledNotificationsAsync();
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
          {renderSettingSection("NOTIFICATIONS", "notifications-outline", (
            <>
              <ThemedView style={styles.settingRow}>
                <ThemedText style={styles.settingText}>ENABLE REMINDERS</ThemedText>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </ThemedView>
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <ThemedView style={styles.settingRow}>
                  <ThemedText style={styles.settingText}>REMINDER TIME 1</ThemedText>
                  <ThemedText style={styles.timeText}>{formatTime(reminderTime)}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
              {showTimePicker && (
                <View>
                  <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                  {Platform.OS === 'ios' && (
                    <Button title="Done" onPress={() => setShowTimePicker(false)} />
                  )}
                </View>
              )}
              <TouchableOpacity onPress={() => setShowTimePicker2(true)}>
                <ThemedView style={styles.settingRow}>
                  <ThemedText style={styles.settingText}>REMINDER TIME 2</ThemedText>
                  <ThemedText style={styles.timeText}>{formatTime(reminderTime2)}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
              {showTimePicker2 && (
                <View>
                  <DateTimePicker
                    value={reminderTime2}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange2}
                  />
                  {Platform.OS === 'ios' && (
                    <Button title="Done" onPress={() => setShowTimePicker2(false)} />
                  )}
                </View>
              )}
              <ThemedView style={styles.settingRow}>
                <ThemedText style={styles.settingText}>ENABLE REMINDER 2</ThemedText>
                <Switch
                  value={secondReminderEnabled}
                  onValueChange={(value) => {
                    setSecondReminderEnabled(value);
                    saveSettings('secondReminderEnabled', value);
                    if (notificationsEnabled && value) {
                      scheduleNotifications();
                    }
                  }}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </ThemedView>
            </>
          ))}
          {renderSettingSection("FEEDBACK", "options-outline", (
            <>
              <ThemedView style={styles.settingRow}>
                <ThemedText style={styles.settingText}>SOUND EFFECTS</ThemedText>
                <Switch
                  value={soundEnabled}
                  onValueChange={toggleSound}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </ThemedView>
              <ThemedView style={styles.settingRow}>
                <ThemedText style={styles.settingText}>HAPTIC FEEDBACK</ThemedText>
                <Switch
                  value={hapticEnabled}
                  onValueChange={toggleHaptic}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </ThemedView>
            </>
          ))}
          {renderSettingSection("DATA MANAGEMENT", "server-outline", (
            <TouchableOpacity style={styles.dangerButton} onPress={resetAllData}>
              <ThemedText style={styles.dangerButtonText}>Reset All Data</ThemedText>
            </TouchableOpacity>
          ))}
          {renderSettingSection("ABOUT", "information-circle-outline", (
            <>
              <ThemedView style={styles.settingRow}>
                <ThemedText style={styles.settingText}>Version</ThemedText>
                <ThemedText style={styles.timeText}>1.0.2</ThemedText>
              </ThemedView>
              
              
              
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL('https://ignitinghope/privacy')}
              >
                <ThemedText style={styles.linkButtonText}>Privacy Policy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL('https://ignitnghope.com/terms')}
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