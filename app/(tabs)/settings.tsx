
import React from 'react';
import { StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [reminderTime, setReminderTime] = React.useState('9:00 AM');
  
  const clearAllData = async () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to reset all data? This will clear your counters, statistics, and settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All Data", 
          style: "destructive", 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Success", "All data has been cleared.");
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert("Error", "Failed to clear data.");
            }
          }
        }
      ]
    );
  };
  
  const openWebsite = () => {
    Linking.openURL('https://ignitinghope.com');
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.header}>Settings</ThemedText>
        
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>App Preferences</ThemedText>
          
          <ThemedView style={styles.settingRow}>
            <ThemedView style={styles.settingLabelContainer}>
              <Ionicons name="notifications" size={22} color="#4A90E2" />
              <ThemedText style={styles.settingLabel}>Daily Reminders</ThemedText>
            </ThemedView>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#4A90E2' }}
              thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
            />
          </ThemedView>
          
          {notificationsEnabled && (
            <ThemedView style={styles.settingRow}>
              <ThemedView style={styles.settingLabelContainer}>
                <Ionicons name="time" size={22} color="#4A90E2" />
                <ThemedText style={styles.settingLabel}>Reminder Time</ThemedText>
              </ThemedView>
              <TouchableOpacity>
                <ThemedText style={styles.timeText}>{reminderTime}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          
          <TouchableOpacity style={styles.settingRow} onPress={openWebsite}>
            <ThemedView style={styles.settingLabelContainer}>
              <Ionicons name="globe" size={22} color="#4A90E2" />
              <ThemedText style={styles.settingLabel}>Visit Igniting Hope Website</ThemedText>
            </ThemedView>
            <Ionicons name="chevron-forward" size={22} color="#4A90E2" />
          </TouchableOpacity>
          
          <ThemedView style={styles.settingRow}>
            <ThemedView style={styles.settingLabelContainer}>
              <Ionicons name="information-circle" size={22} color="#4A90E2" />
              <ThemedText style={styles.settingLabel}>App Version</ThemedText>
            </ThemedView>
            <ThemedText style={styles.versionText}>1.0.0</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
          
          <TouchableOpacity style={styles.settingRow} onPress={clearAllData}>
            <ThemedView style={styles.settingLabelContainer}>
              <Ionicons name="trash" size={22} color="#FF6B6B" />
              <ThemedText style={[styles.settingLabel, styles.dangerText]}>Clear All Data</ThemedText>
            </ThemedView>
            <Ionicons name="chevron-forward" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedText style={styles.copyright}>
          © {new Date().getFullYear()} Igniting Hope Ministries
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  versionText: {
    fontSize: 16,
    opacity: 0.7,
  },
  dangerText: {
    color: '#FF6B6B',
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
    opacity: 0.6,
  },
});
