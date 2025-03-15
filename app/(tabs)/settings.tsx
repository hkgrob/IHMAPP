import React from 'react';
import { ScrollView, View, StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/ThemedText';
import { NotificationSettings } from '../../components/NotificationSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  settingsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#ffeeee',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  dangerText: {
    color: '#cc0000',
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 12,
  },
});

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [hapticsEnabled, setHapticsEnabled] = React.useState(true);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const soundSetting = await AsyncStorage.getItem('soundEnabled');
      const hapticsSetting = await AsyncStorage.getItem('hapticsEnabled');

      setSoundEnabled(soundSetting !== 'false');
      setHapticsEnabled(hapticsSetting !== 'false');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const toggleSound = (value) => {
    setSoundEnabled(value);
    saveSetting('soundEnabled', value);
  };

  const toggleHaptics = (value) => {
    setHapticsEnabled(value);
    saveSetting('hapticsEnabled', value);
  };

  const resetAppData = async () => {
    Alert.alert(
      'Reset All Data',
      'This will reset all your declarations, counters, streaks, reminders, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting app data reset process...');
              
              // Import the counter service directly to ensure it's available
              const counterService = require('@/services/counterService');
              
              // First notify listeners via event emitter before clearing storage
              // This ensures all components get the reset notification
              try {
                if (counterService.counterEvents) {
                  console.log('Notifying counter event listeners of reset');
                  counterService.counterEvents.emit(counterService.COUNTER_UPDATED, { 
                    dailyCount: 0, 
                    totalCount: 0 
                  });
                }
              } catch (emitterError) {
                console.error('Error notifying counter event listeners:', emitterError);
              }
              
              // Clear all AsyncStorage data
              await AsyncStorage.clear();
              console.log('AsyncStorage cleared successfully');
              
              // Reset critical stats counters specifically to ensure they're properly reset
              // Even if a component didn't respond to the event emitter
              await AsyncStorage.multiSet([
                ['dailyCount', '0'],
                ['totalCount', '0'],
                ['lastReset', new Date().toString()],
                ['currentStreak', '0'],
                ['bestStreak', '0'],
                ['lastActivityDate', ''],
                ['firstDate', '']
              ]);
              console.log('Critical stats counters reset successfully');
              
              // Reset UI state
              setSoundEnabled(true);
              setHapticsEnabled(true);
              
              // Send a second notification to ensure all components are updated
              setTimeout(() => {
                try {
                  console.log('Sending second reset notification');
                  counterService.counterEvents.emit(counterService.COUNTER_UPDATED, { 
                    dailyCount: 0, 
                    totalCount: 0 
                  });
                } catch (error) {
                  console.error('Error sending second reset notification:', error);
                }
                
                // Force a reload of the app in web environments
                if (Platform.OS === 'web') {
                  console.log('Reloading web app to apply reset');
                  window.location.reload();
                }
              }, 500);
              
              Alert.alert(
                'Reset Complete', 
                'All app data has been reset successfully. All your declarations, counters, streaks and settings have been cleared.'
              );
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset app data');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsSection}>
        <View style={styles.settingHeader}>
          <Ionicons name="notifications-outline" size={24} color="#0a7ea4" />
          <ThemedText style={styles.settingSectionTitle}>Notifications</ThemedText>
        </View>
        <NotificationSettings />
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingHeader}>
          <Ionicons name="options-outline" size={24} color="#0a7ea4" />
          <ThemedText style={styles.settingSectionTitle}>App Settings</ThemedText>
        </View>

        <View style={styles.settingItem}>
          <ThemedText style={styles.settingLabel}>Sound Effects</ThemedText>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: '#767577', true: '#0a7ea4' }}
            thumbColor="#f4f3f4"
          />
        </View>

        <View style={styles.settingItem}>
          <ThemedText style={styles.settingLabel}>Haptic Feedback</ThemedText>
          <Switch
            value={hapticsEnabled}
            onValueChange={toggleHaptics}
            trackColor={{ false: '#767577', true: '#0a7ea4' }}
            thumbColor="#f4f3f4"
            disabled={Platform.OS === 'web'}
          />
        </View>

        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={resetAppData}
        >
          <ThemedText style={styles.dangerText}>
            Reset All App Data
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingHeader}>
          <Ionicons name="information-circle-outline" size={24} color="#0a7ea4" />
          <ThemedText style={styles.settingSectionTitle}>About</ThemedText>
        </View>

        <ThemedText style={styles.versionText}>
          Igniting Hope App v{require('../../app.json').expo.version}
        </ThemedText>
      </View>
    </ScrollView>
  );
}