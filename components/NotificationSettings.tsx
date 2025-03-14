
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Platform,
  Modal,
  Alert
} from 'react-native';
import { ThemedText } from './ThemedText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { 
  requestNotificationPermissions,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleAllNotifications,
  cancelAllNotifications,
  formatTimeDisplay,
  dateToNotificationTime,
  notificationTimeToDate
} from '../services/notificationService';

export const NotificationSettings = () => {
  // States for settings
  const [enabled, setEnabled] = useState(false);
  const [morningTime, setMorningTime] = useState(new Date());
  const [eveningTime, setEveningTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // States for time picker
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  
  // Load saved settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      
      setEnabled(settings.enabled);
      setMorningTime(notificationTimeToDate(settings.morningTime));
      setEveningTime(notificationTimeToDate(settings.eveningTime));
      setSoundEnabled(settings.sound);
      
      console.log('Loaded notification settings:', settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  // Handle time change for morning notification
  const handleMorningTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowMorningPicker(false);
    }
    
    if (selectedDate) {
      setMorningTime(selectedDate);
      updateSettings({ morningTime: dateToNotificationTime(selectedDate) });
    }
  };

  // Handle time change for evening notification
  const handleEveningTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEveningPicker(false);
    }
    
    if (selectedDate) {
      setEveningTime(selectedDate);
      updateSettings({ eveningTime: dateToNotificationTime(selectedDate) });
    }
  };

  // Toggle notifications
  const toggleNotifications = async (value) => {
    try {
      if (value) {
        // Request permissions if enabling
        const permissionGranted = await requestNotificationPermissions();
        
        if (!permissionGranted) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive declaration reminders.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      setEnabled(value);
      updateSettings({ enabled: value });
      
      // Provide haptic feedback
      Haptics.notificationAsync(
        value 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Warning
      );

    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  // Toggle sound
  const toggleSound = (value) => {
    setSoundEnabled(value);
    updateSettings({ sound: value });
  };

  // Update settings and schedule notifications
  const updateSettings = async (updatedValues) => {
    try {
      const currentSettings = await getNotificationSettings();
      const newSettings = { ...currentSettings, ...updatedValues };
      
      await saveNotificationSettings(newSettings);
      await scheduleAllNotifications();
      
      console.log('Updated notification settings:', newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications" size={24} color="#0a7ea4" />
          <ThemedText style={styles.sectionTitle}>Declaration Reminders</ThemedText>
        </View>
        
        <View style={styles.settingRow}>
          <ThemedText>Enable Daily Reminders</ThemedText>
          <Switch
            value={enabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#0a7ea4' }}
            thumbColor={enabled ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        
        {enabled && (
          <>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setShowMorningPicker(true);
                } else {
                  setShowMorningPicker(true);
                }
              }}
            >
              <ThemedText>Morning Reminder</ThemedText>
              <View style={styles.timeContainer}>
                <ThemedText style={styles.timeText}>
                  {formatTimeDisplay(dateToNotificationTime(morningTime))}
                </ThemedText>
                <Ionicons name="time-outline" size={20} color="#0a7ea4" style={styles.timeIcon} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setShowEveningPicker(true);
                } else {
                  setShowEveningPicker(true);
                }
              }}
            >
              <ThemedText>Evening Reminder</ThemedText>
              <View style={styles.timeContainer}>
                <ThemedText style={styles.timeText}>
                  {formatTimeDisplay(dateToNotificationTime(eveningTime))}
                </ThemedText>
                <Ionicons name="time-outline" size={20} color="#0a7ea4" style={styles.timeIcon} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.settingRow}>
              <ThemedText>Play Sound</ThemedText>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor={soundEnabled ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
          </>
        )}
      </View>

      {/* Time pickers */}
      {(showMorningPicker || showEveningPicker) && Platform.OS === 'android' && (
        <DateTimePicker
          value={showMorningPicker ? morningTime : eveningTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={showMorningPicker ? handleMorningTimeChange : handleEveningTimeChange}
        />
      )}
      
      {/* iOS Modal Time Picker for Morning */}
      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMorningPicker}
          onRequestClose={() => setShowMorningPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Set Morning Reminder</ThemedText>
                <TouchableOpacity onPress={() => setShowMorningPicker(false)}>
                  <ThemedText style={styles.doneButton}>Done</ThemedText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={morningTime}
                mode="time"
                display="spinner"
                onChange={handleMorningTimeChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* iOS Modal Time Picker for Evening */}
      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showEveningPicker}
          onRequestClose={() => setShowEveningPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Set Evening Reminder</ThemedText>
                <TouchableOpacity onPress={() => setShowEveningPicker(false)}>
                  <ThemedText style={styles.doneButton}>Done</ThemedText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={eveningTime}
                mode="time"
                display="spinner"
                onChange={handleEveningTimeChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  timeIcon: {
    marginLeft: 8,
  },
  // Modal styles for iOS
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButton: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    height: 200,
  },
});
