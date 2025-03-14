
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert, 
  Platform,
  ScrollView
} from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import {
  Reminder,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  applyReminders,
  requestPermissions,
  formatTime
} from '../services/notificationService';

export const NotificationSettings = () => {
  // State
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  
  // Load reminders and check permissions on mount
  useEffect(() => {
    loadReminders();
    checkPermissions();
  }, []);
  
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
  
  // Load saved reminders
  const loadReminders = async () => {
    try {
      setLoading(true);
      const savedReminders = await getReminders();
      setReminders(savedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new reminder
  const handleAddReminder = async () => {
    try {
      setLoading(true);
      const newReminder = await createReminder();
      setReminders(prev => [...prev, newReminder]);
      await applyReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
      Alert.alert('Error', 'Failed to add reminder');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a reminder
  const handleDeleteReminder = async (id: string) => {
    try {
      setLoading(true);
      const success = await deleteReminder(id);
      
      if (success) {
        setReminders(prev => prev.filter(r => r.id !== id));
        await applyReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete reminder');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle a reminder on/off
  const toggleReminder = async (reminder: Reminder) => {
    try {
      setLoading(true);
      
      if (!reminder.enabled) {
        // If enabling, check permissions
        const granted = await requestPermissions();
        if (!granted && Platform.OS !== 'web') {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive declaration reminders.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      const updatedReminder = {
        ...reminder,
        enabled: !reminder.enabled
      };
      
      const success = await updateReminder(updatedReminder);
      
      if (success) {
        setReminders(prev => 
          prev.map(r => r.id === reminder.id ? updatedReminder : r)
        );
        await applyReminders();
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle time change
  const handleTimeChange = async (reminder: Reminder, event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setEditingReminderId(null);
    }
    
    if (!selectedDate) return;
    
    try {
      setLoading(true);
      
      const updatedReminder = {
        ...reminder,
        time: selectedDate
      };
      
      const success = await updateReminder(updatedReminder);
      
      if (success) {
        setReminders(prev => 
          prev.map(r => r.id === reminder.id ? updatedReminder : r)
        );
        await applyReminders();
      }
    } catch (error) {
      console.error('Error updating reminder time:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render each reminder
  const renderReminder = (reminder: Reminder, index: number) => {
    const isEditing = editingReminderId === reminder.id;
    const isLastReminder = index === reminders.length - 1;
    
    return (
      <View key={reminder.id} style={[
        styles.reminderContainer, 
        !isLastReminder && styles.borderBottom
      ]}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderHeaderLeft}>
            <Switch
              value={reminder.enabled}
              onValueChange={() => toggleReminder(reminder)}
              trackColor={{ false: '#767577', true: '#0a7ea4' }}
              thumbColor="#f4f3f4"
              disabled={loading}
            />
            <ThemedText style={styles.reminderTitle}>
              Reminder {index + 1}
            </ThemedText>
          </View>
          
          {reminders.length > 1 && (
            <TouchableOpacity
              onPress={() => handleDeleteReminder(reminder.id)}
              style={styles.deleteButton}
              disabled={loading}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b00" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.timeSelector}
          onPress={() => setEditingReminderId(reminder.id)}
          disabled={!reminder.enabled || loading}
        >
          <Ionicons 
            name="time-outline" 
            size={22} 
            color={reminder.enabled ? "#0a7ea4" : "#999"} 
            style={styles.timeIcon} 
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
        
        {isEditing && Platform.OS !== 'web' && (
          <DateTimePicker
            value={reminder.time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleTimeChange(reminder, event, date)}
          />
        )}
      </View>
    );
  };
  
  // If platform is web, show not supported message
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
      
      <ScrollView style={styles.scrollView}>
        {reminders.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No reminders set. Add one below.
            </ThemedText>
          </View>
        ) : (
          reminders.map(renderReminder)
        )}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddReminder}
          disabled={loading}
        >
          <Ionicons name="add-circle-outline" size={22} color="#0a7ea4" />
          <ThemedText style={styles.addButtonText}>
            Add Another Reminder
          </ThemedText>
        </TouchableOpacity>
        
        {permissionStatus === 'denied' && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={20} color="#ff6b00" />
            <ThemedText style={styles.warningText}>
              Notifications permission denied. Please enable in device settings.
            </ThemedText>
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#0a7ea4" />
          <ThemedText style={styles.infoText}>
            You will receive reminders to speak your declarations at the times set above.
          </ThemedText>
        </View>
      </ScrollView>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>
            Updating reminders...
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
  scrollView: {
    maxHeight: 400,
  },
  reminderContainer: {
    marginBottom: 15,
    paddingBottom: 15,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTitle: {
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
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  timeIcon: {
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  disabledText: {
    color: '#999',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 12,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a7ea4',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
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
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#0a7ea4',
  }
});
