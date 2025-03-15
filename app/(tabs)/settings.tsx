
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { NotificationSettings } from '@/components/NotificationSettings';
import * as Haptics from 'expo-haptics';

export default function Settings() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const soundValue = await AsyncStorage.getItem('soundEnabled');
      const hapticsValue = await AsyncStorage.getItem('hapticEnabled');
      
      setSoundEnabled(soundValue !== 'false');
      setHapticsEnabled(hapticsValue !== 'false');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleSound = async (value) => {
    try {
      setSoundEnabled(value);
      await AsyncStorage.setItem('soundEnabled', value.toString());
    } catch (error) {
      console.error('Error saving sound setting:', error);
    }
  };

  const toggleHaptics = async (value) => {
    try {
      setHapticsEnabled(value);
      await AsyncStorage.setItem('hapticEnabled', value.toString());
      
      if (value && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error saving haptic setting:', error);
    }
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
              
              // Force import to be synchronous to ensure availability
              const counterService = require('@/services/counterService');
              console.log('Loaded counter service:', counterService ? 'success' : 'failed');
              
              // Save all keys before clearing for debugging
              const allKeys = await AsyncStorage.getAllKeys();
              console.log('Keys to be cleared:', allKeys.join(', '));
              
              // First notify listeners via event emitter before clearing storage
              try {
                console.log('Emitting counter reset event...');
                counterService.counterEvents.emit(counterService.COUNTER_UPDATED, { 
                  dailyCount: 0, 
                  totalCount: 0 
                });
                console.log('Counter reset event emitted successfully');
              } catch (emitterError) {
                console.error('Error emitting counter reset event:', emitterError);
              }
              
              // Use a more reliable approach to clear all storage
              const keysToReset = await AsyncStorage.getAllKeys();
              if (keysToReset.length > 0) {
                await AsyncStorage.multiRemove(keysToReset);
                console.log(`Cleared ${keysToReset.length} keys from AsyncStorage`);
              }
              
              // Set critical counters to 0 explicitly
              const resetValues = [
                ['dailyCount', '0'],
                ['totalCount', '0'],
                ['lastReset', new Date().toString()],
                ['currentStreak', '0'],
                ['bestStreak', '0'],
                ['lastActivityDate', ''],
                ['firstDate', ''],
                ['soundEnabled', 'true'],
                ['hapticEnabled', 'true']
              ];
              
              console.log('Setting default values for counters and settings');
              await AsyncStorage.multiSet(resetValues);
              
              // Reset UI state
              setSoundEnabled(true);
              setHapticsEnabled(true);
              
              // Wait a moment to ensure async operations complete
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Force another reset notification with delay
              setTimeout(() => {
                try {
                  console.log('Sending final reset notification');
                  counterService.counterEvents.emit(counterService.COUNTER_UPDATED, { 
                    dailyCount: 0, 
                    totalCount: 0 
                  });
                  
                  // Force refresh for web
                  if (Platform.OS === 'web') {
                    console.log('Reloading web app to apply reset');
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error in final reset notification:', error);
                }
              }, 500);
              
              Alert.alert(
                'Reset Complete', 
                'All app data has been reset successfully. All your declarations, counters, streaks and settings have been cleared.'
              );
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset app data. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.settingsSection}>
          <View style={styles.settingHeader}>
            <Ionicons name="options-outline" size={24} color="#0a7ea4" />
            <ThemedText style={styles.settingSectionTitle}>General Settings</ThemedText>
          </View>

          <ThemedView style={styles.settingItem}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Ionicons name="volume-high-outline" size={22} color="#0a7ea4" style={styles.settingIcon} />
                <ThemedText style={styles.settingText}>Sound</ThemedText>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor="#f4f3f4"
              />
            </View>
          </ThemedView>

          {Platform.OS !== 'web' && (
            <ThemedView style={styles.settingItem}>
              <View style={styles.settingRow}>
                <View style={styles.settingLabel}>
                  <Ionicons name="pulse-outline" size={22} color="#0a7ea4" style={styles.settingIcon} />
                  <ThemedText style={styles.settingText}>Haptic Feedback</ThemedText>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={toggleHaptics}
                  trackColor={{ false: '#767577', true: '#0a7ea4' }}
                  thumbColor="#f4f3f4"
                />
              </View>
            </ThemedView>
          )}
        </View>

        <NotificationSettings />

        <View style={styles.settingsSection}>
          <View style={styles.settingHeader}>
            <Ionicons name="alert-triangle-outline" size={24} color="#ff6b00" />
            <ThemedText style={styles.dangerSectionTitle}>Danger Zone</ThemedText>
          </View>

          <ThemedText style={styles.dangerDescription}>
            The actions below cannot be undone. Please proceed with caution.
          </ThemedText>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  settingsSection: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#0a7ea4',
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#ff6b00',
  },
  settingItem: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 8,
  },
  settingText: {
    fontSize: 16,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#ffedeb',
    borderWidth: 1,
    borderColor: '#ff6b00',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  dangerText: {
    color: '#ff6b00',
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  }
});
