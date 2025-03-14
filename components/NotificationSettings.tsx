
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Reminder,
  getReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  applyAllReminders,
  requestPermissions,
  formatTime
} from '../services/notificationService';

export const NotificationSettings = () => {
  // State
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [timePickerState, setTimePickerState] = useState<{
    visible: boolean;
    selectedReminderId: string | null;
  }>({ visible: false, selectedReminderId: null });

  // Load reminders on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      await checkPermissions();
      await loadReminders();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  // Check notification permissions
  const checkPermissions = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  // Load reminders from storage
  const loadReminders = async () => {
    try {
      const savedReminders = await getReminders();
      setReminders(savedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  // Add a new reminder
  const handleAddReminder = async () => {
    try {
      setRefreshing(true);
      
      // Set default time to 9:00 AM
      const defaultTime = new Date();
      defaultTime.setHours(9, 0, 0, 0);
      
      const newReminder = await addReminder(defaultTime);
      if (newReminder) {
        setReminders(prev => [...prev, newReminder]);
        await applyAllReminders();
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      Alert.alert('Error', 'Failed to add reminder', [
        { text: 'OK' }
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Delete a reminder
  const handleDeleteReminder = async (id: string) => {
    try {
      setRefreshing(true);
      
      // Confirm before deleting
      const success = await deleteReminder(id);
      if (success) {
        setReminders(prev => prev.filter(r => r.id !== id));
        await applyAllReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete reminder');
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle a reminder on/off
  const toggleReminder = async (reminder: Reminder) => {
    try {
      setRefreshing(true);
      
      // If turning on, check permissions
      if (!reminder.enabled && Platform.OS !== 'web') {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive reminders.',
            [{ text: 'OK' }]
          );
          setRefreshing(false);
          return;
        }
      }
      
      // Update the reminder
      const updatedReminder = {
        ...reminder,
        enabled: !reminder.enabled
      };
      
      const success = await updateReminder(updatedReminder);
      if (success) {
        setReminders(prev => 
          prev.map(r => r.id === reminder.id ? updatedReminder : r)
        );
        await applyAllReminders();
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle time change from picker
  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    // Hide time picker on Android (iOS handled by Done button)
    if (Platform.OS === 'android') {
      setTimePickerState({ visible: false, selectedReminderId: null });
    }
    
    if (!selectedDate || !timePickerState.selectedReminderId) return;
    
    try {
      setRefreshing(true);
      
      // Find the reminder
      const reminder = reminders.find(r => r.id === timePickerState.selectedReminderId);
      if (!reminder) return;
      
      // Update the reminder with new time
      const updatedReminder = {
        ...reminder,
        time: selectedDate
      };
      
      const success = await updateReminder(updatedReminder);
      if (success) {
        setReminders(prev => 
          prev.map(r => r.id === updatedReminder.id ? updatedReminder : r)
        );
        await applyAllReminders();
      }
    } catch (error) {
      console.error('Error updating reminder time:', error);
      Alert.alert('Error', 'Failed to update reminder time');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Show time picker for a specific reminder
  const showTimePicker = (reminderId: string) => {
    setTimePickerState({
      visible: true,
      selectedReminderId: reminderId
    });
  };
  
  // Hide time picker
  const hideTimePicker = () => {
    setTimePickerState({
      visible: false,
      selectedReminderId: null
    });
  };

  // If web platform, show not supported message
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

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading notifications...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Declaration Reminders</ThemedText>
        {permissionStatus === 'denied' && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={18} color="#ff6b00" />
            <ThemedText style={styles.warningText}>
              Notifications are disabled in device settings
            </ThemedText>
          </View>
        )}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={40} color="#999" />
            <ThemedText style={styles.emptyText}>
              No declaration reminders set
            </ThemedText>
          </View>
        ) : (
          reminders.map((reminder, index) => (
            <View key={reminder.id} style={styles.reminderItem}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderTitle}>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder)}
                    trackColor={{ false: '#767577', true: '#0a7ea4' }}
                    thumbColor="#f4f3f4"
                    disabled={refreshing}
                  />
                  <ThemedText 
                    style={[
                      styles.reminderTitleText,
                      !reminder.enabled && styles.disabledText
                    ]}
                  >
                    Reminder {index + 1}
                  </ThemedText>
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReminder(reminder.id)}
                  disabled={refreshing || reminders.length <= 1}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={20} 
                    color={reminders.length > 1 ? '#ff6b00' : '#ccc'} 
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.timeSelector,
                  !reminder.enabled && styles.disabledTimeSelector
                ]}
                onPress={() => showTimePicker(reminder.id)}
                disabled={!reminder.enabled || refreshing}
              >
                <Ionicons 
                  name="time-outline" 
                  size={22} 
                  color={reminder.enabled ? "#0a7ea4" : "#999"} 
                />
                <ThemedText 
                  style={[
                    styles.timeText,
                    !reminder.enabled && styles.disabledText
                  ]}
                >
                  {formatTime(reminder.time)}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))
        )}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddReminder}
          disabled={refreshing}
        >
          <Ionicons name="add-circle-outline" size={22} color="#0a7ea4" />
          <ThemedText style={styles.addButtonText}>
            Add New Reminder
          </ThemedText>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#0a7ea4" />
          <ThemedText style={styles.infoText}>
            You will receive reminders to speak your declarations at the scheduled times.
          </ThemedText>
        </View>
      </ScrollView>
      
      {timePickerState.visible && (
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerHeader}>
            <ThemedText style={styles.timePickerTitle}>Set Time</ThemedText>
            {Platform.OS === 'ios' && (
              <TouchableOpacity onPress={hideTimePicker} style={styles.doneButton}>
                <ThemedText style={styles.doneButtonText}>Done</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          {timePickerState.selectedReminderId && (
            <DateTimePicker
              value={reminders.find(r => r.id === timePickerState.selectedReminderId)?.time instanceof Date
                ? reminders.find(r => r.id === timePickerState.selectedReminderId)?.time as Date
                : new Date()
              }
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              minuteInterval={1}
            />
          )}
        </View>
      )}
      
      {refreshing && (
        <View style={styles.refreshingContainer}>
          <ActivityIndicator size="small" color="#0a7ea4" />
          <ThemedText style={styles.refreshingText}>
            Updating...
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
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0e6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  warningText: {
    fontSize: 13,
    color: '#ff6b00',
    marginLeft: 8,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  reminderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTitleText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  deleteButton: {
    padding: 5,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 36,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  disabledTimeSelector: {
    backgroundColor: '#f5f5f5',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a7ea4',
    marginLeft: 8,
  },
  disabledText: {
    color: '#999',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a7ea4',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
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
  notSupportedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  notSupportedText: {
    fontSize: 14,
    marginLeft: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
    color: '#0a7ea4',
  },
  refreshingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  refreshingText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#0a7ea4',
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#0a7ea4',
    fontWeight: '500',
  },
});
