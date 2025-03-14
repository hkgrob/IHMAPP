import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Vibration, Alert, ScrollView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { counterEvents, COUNTER_UPDATED } from '@/services/counterService';

const { width } = Dimensions.get('window');


export default function CounterPage() {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sound, setSound] = useState();
  const colorScheme = useColorScheme();
  const buttonColor = colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;
  const lastResetDate = useRef(new Date());

  useEffect(() => {
    initializeSettings();
    loadCounts();
    loadSound();

    // Subscribe to counter updates from other screens
    const handleCounterUpdate = (counts) => {
      console.log('Counter update received:', counts);
      setDailyCount(counts.dailyCount);
      setTotalCount(counts.totalCount);
    };

    // Add event listener
    counterEvents.on(COUNTER_UPDATED, handleCounterUpdate);

    // Clean up listener when component unmounts
    return () => {
      counterEvents.off(COUNTER_UPDATED, handleCounterUpdate);
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const initializeSettings = async () => {
    try {
      const hapticSetting = await AsyncStorage.getItem('hapticEnabled');
      if (hapticSetting === null) {
        await AsyncStorage.setItem('hapticEnabled', 'true');
      }
      const soundSetting = await AsyncStorage.getItem('soundEnabled');
      if (soundSetting === null) {
        await AsyncStorage.setItem('soundEnabled', 'true');
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  };

  const loadSound = async () => {
    try {
      console.log('Loading sound asset:', require('@/assets/sounds/click.mp3'));
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/click.mp3'));
      setSound(sound);
      console.log('Sound loaded successfully');
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const loadCounts = async () => {
    try {
      const counterService = require('@/services/counterService'); // Assumes this module exists and exports a loadCounts function.
      const { dailyCount: newDailyCount, totalCount: newTotalCount, lastReset } = await counterService.loadCounts();

      console.log('Loading counts:', { newDailyCount, newTotalCount, lastReset });

      setTotalCount(newTotalCount);
      setDailyCount(newDailyCount);
      lastResetDate.current = lastReset;
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const incrementCounter = async () => {
    try {
      // Get settings
      const soundEnabled = await AsyncStorage.getItem('soundEnabled');
      const hapticEnabled = await AsyncStorage.getItem('hapticEnabled');

      console.log('Settings:', { soundEnabled, hapticEnabled });

      // Sound feedback
      if (soundEnabled !== 'false' && sound) {
        try {
          await sound.replayAsync();
          console.log('Sound played successfully');
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      }

      // Haptic feedback
      if (Platform.OS !== 'web' && hapticEnabled !== 'false') {
        try {
          console.log('Attempting haptic feedback');
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('Haptic feedback triggered');
        } catch (error) {
          console.error('Haptic feedback failed:', error);
          try {
            await Vibration.vibrate(50);
            console.log('Fallback vibration triggered');
          } catch (vibError) {
            console.error('Vibration fallback failed:', vibError);
          }
        }
      }

      // Use counter service to update counts
      const counterService = require('@/services/counterService');
      const result = await counterService.incrementCounter();
      
      // No need to manually emit event as counterService already does this
      console.log('Counter incremented:', result);

    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  };

  // Reset functionality
  const [pressTimer, setPressTimer] = useState(null);
  const [resetting, setResetting] = useState('');
  const [resetProgress, setResetProgress] = useState(0);
  const RESET_DURATION = 2000;

  const startResetTimer = (type) => {
    console.log(`Starting reset timer for ${type}`);
    setResetting(type);
    setResetProgress(0);

    const timer = setInterval(() => {
      setResetProgress(prev => {
        const newProgress = prev + (100 / (RESET_DURATION / 100));
        if (newProgress >= 100) {
          clearInterval(timer);
          performReset(type);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    setPressTimer(timer);
  };

  const cancelResetTimer = () => {
    if (pressTimer) {
      console.log('Canceling reset timer');
      clearInterval(pressTimer);
      setPressTimer(null);
      setResetting('');
      setResetProgress(0);
    }
  };

  const performReset = async (type) => {
    console.log(`Performing reset for ${type}`);
    try {
      if (type === 'daily') {
        await AsyncStorage.setItem('dailyCount', '0');
        setDailyCount(0);
      } else if (type === 'total') {
        await AsyncStorage.setItem('totalCount', '0');
        setTotalCount(0);
      }

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error resetting counter:', error);
      Alert.alert('Error', 'Could not reset counter');
    } finally {
      setResetting('');
      setResetProgress(0);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.pageTitle}>Declaration Counter</ThemedText>

          <ThemedView style={styles.counterContainer}>
            <View style={styles.statsRow}>
              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statLabel}>Daily</ThemedText>
                <ThemedText style={styles.statValue}>{dailyCount}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statLabel}>Total</ThemedText>
                <ThemedText style={styles.statValue}>{totalCount}</ThemedText>
              </ThemedView>
            </View>

            <TouchableOpacity
              style={[styles.countButton, { backgroundColor: buttonColor }]}
              onPress={incrementCounter}
            >
              <Text style={styles.buttonText}>Click!</Text>
            </TouchableOpacity>

            <View style={styles.resetContainer}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  resetting === 'daily' && styles.resettingButton
                ]}
                onPressIn={() => startResetTimer('daily')}
                onPressOut={cancelResetTimer}
                delayLongPress={2000}
              >
                <ThemedText style={styles.resetButtonText}>
                  {resetting === 'daily' 
                    ? `Resetting... ${Math.round(resetProgress)}%` 
                    : 'Hold to Reset Daily'}
                </ThemedText>
                {resetting === 'daily' && (
                  <View style={[styles.progressBar, { width: `${resetProgress}%` }]} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  resetting === 'total' && styles.resettingButton
                ]}
                onPressIn={() => startResetTimer('total')}
                onPressOut={cancelResetTimer}
                delayLongPress={2000}
              >
                <ThemedText style={styles.resetButtonText}>
                  {resetting === 'total' 
                    ? `Resetting... ${Math.round(resetProgress)}%` 
                    : 'Hold to Reset Total'}
                </ThemedText>
                {resetting === 'total' && (
                  <View style={[styles.progressBar, { width: `${resetProgress}%` }]} />
                )}
              </TouchableOpacity>
            </View>
          </ThemedView>

          <View style={styles.tipContainer}>
            <ThemedText style={styles.tipIcon}>💡 Tip</ThemedText>
            <ThemedText style={styles.tipText}>
              Consistency is key! Aim to speak declarations at least once daily.
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  counterContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 48,
  },
  countButton: {
    width: '100%',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  resetButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'relative',
    overflow: 'hidden',
  },
  resetButtonText: {
    fontSize: 16,
    zIndex: 2,
  },
  resettingButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
  tipContainer: {
    marginTop: 30,
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  }
});