import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Vibration, Alert, ScrollView, StatusBar, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function CounterPage() {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sound, setSound] = useState();
  const colorScheme = useColorScheme();
  const buttonColor = colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;
  const lastResetDate = useRef(new Date());

  useEffect(() => {
    loadCounts();
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      console.log('Loading sound asset in counter:', require('@/assets/sounds/click.mp3'));
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/click.mp3'));
      setSound(sound);
      console.log('Sound loaded successfully in counter');
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const loadCounts = async () => {
    try {
      const storedDailyCount = await AsyncStorage.getItem('dailyCount');
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      const storedLastReset = await AsyncStorage.getItem('lastReset');

      console.log('Loading counts:', {storedTotalCount, storedDailyCount, storedLastReset});

      if (storedTotalCount) {
        setTotalCount(parseInt(storedTotalCount, 10));
      }

      if (storedLastReset) {
        lastResetDate.current = new Date(storedLastReset);
        const today = new Date();

        if (today.toDateString() !== lastResetDate.current.toDateString()) {
          // Reset daily count if it's a new day
          setDailyCount(0);
          lastResetDate.current = today;
          await AsyncStorage.setItem('lastReset', today.toString());
          await AsyncStorage.setItem('dailyCount', '0');
        } else if (storedDailyCount) {
          setDailyCount(parseInt(storedDailyCount, 10));
        }
      } else {
        // First time app is used, store today's date
        await AsyncStorage.setItem('lastReset', new Date().toString());
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const playSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const incrementCounter = async () => {
    // Get current counts
    const updatedDaily = dailyCount + 1;
    const updatedTotal = totalCount + 1;

    // Update state
    setDailyCount(updatedDaily);
    setTotalCount(updatedTotal);

    try {
      // Save to storage
      await AsyncStorage.setItem('dailyCount', updatedDaily.toString());
      await AsyncStorage.setItem('totalCount', updatedTotal.toString());

      // Play sound if enabled
      if (Platform.OS !== 'web' && soundEnabled !== 'false') {
        try {
          console.log('Playing click sound');
          if (sound) {
            await sound.playFromPositionAsync(0);
          }
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      }

      // Add haptic feedback directly
      if (Platform.OS !== 'web') {
        console.log('Attempting haptic feedback');
        try {
          // Force haptic feedback for testing
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('Haptic feedback sent');
        } catch (error) {
          console.error('Error with direct haptic feedback:', error);
          // Fallback to basic vibration
          try {
            Vibration.vibrate(50);
            console.log('Vibration fallback triggered');
          } catch (vibrationError) {
            console.error('Error with vibration fallback:', vibrationError);
          }
        }
      }
    } catch (error) {
      console.error('Error saving count:', error);
      // Revert state if save fails
      setDailyCount(dailyCount);
      setTotalCount(totalCount);
      Alert.alert('Error', 'Failed to save count');
    }
  };

  const resetCounter = async (type) => {
    console.log(`Attempting to reset ${type} counter`);

    // Show confirmation dialog first
    const title = type === 'daily' ? 'Reset Daily Count' : 'Reset Total Count';
    const message = type === 'daily' 
      ? 'Are you sure you want to reset your daily count to zero?' 
      : 'Are you sure you want to reset your total count to zero? This cannot be undone.';

    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Reset canceled')
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            console.log(`Confirmed reset of ${type} counter`);
            try {
              if (type === 'daily') {
                await AsyncStorage.setItem('dailyCount', '0');
                setDailyCount(0);
                Alert.alert('Success', 'Daily count reset');
              } else if (type === 'total') {
                await AsyncStorage.setItem('totalCount', '0');
                setTotalCount(0);
                Alert.alert('Success', 'Total count reset');
              }
            } catch (error) {
              console.error('Error resetting counter:', error);
              Alert.alert('Error', 'Could not reset counter');
            }
          }
        }
      ],
      { cancelable: true }
    );
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
                style={styles.resetButton}
                onPress={() => resetCounter('daily')}
              >
                <ThemedText style={styles.resetButtonText}>Reset Daily</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => resetCounter('total')}
              >
                <ThemedText style={styles.resetButtonText}>Reset Total</ThemedText>
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
  },
  resetButtonText: {
    fontSize: 16,
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