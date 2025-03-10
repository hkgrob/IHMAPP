import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function CounterScreen() {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Load counts from storage on component mount
  useEffect(() => {
    loadCounts();
  }, []);

  // Save counts to storage whenever they change
  useEffect(() => {
    saveCounts();
  }, [dailyCount, totalCount]);

  // Check if we need to reset the daily count (new day)
  useEffect(() => {
    checkDayChange();
  }, []);

  const loadCounts = async () => {
    try {
      const storedDailyCount = await AsyncStorage.getItem('dailyCount');
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      const lastCountDate = await AsyncStorage.getItem('lastCountDate');

      if (storedDailyCount !== null) {
        setDailyCount(parseInt(storedDailyCount, 10));
      }

      if (storedTotalCount !== null) {
        setTotalCount(parseInt(storedTotalCount, 10));
      }

      // Check if it's a new day
      if (lastCountDate !== null) {
        const today = new Date().toDateString();
        if (lastCountDate !== today) {
          // It's a new day, reset the daily count
          setDailyCount(0);
          await AsyncStorage.setItem('lastCountDate', today);
        }
      } else {
        // First time using the app, set the date
        await AsyncStorage.setItem('lastCountDate', new Date().toDateString());
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const saveCounts = async () => {
    try {
      await AsyncStorage.setItem('dailyCount', dailyCount.toString());
      await AsyncStorage.setItem('totalCount', totalCount.toString());
    } catch (error) {
      console.error('Error saving counts:', error);
    }
  };

  const checkDayChange = async () => {
    try {
      const lastCountDate = await AsyncStorage.getItem('lastCountDate');
      const today = new Date().toDateString();

      if (lastCountDate !== null && lastCountDate !== today) {
        // It's a new day, reset the daily count
        setDailyCount(0);
        await AsyncStorage.setItem('lastCountDate', today);
      }
    } catch (error) {
      console.error('Error checking day change:', error);
    }
  };

  const incrementCount = () => {
    // Only use haptics on native platforms where available
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
          // Silently fail if haptics aren't available
        });
      } catch (error) {
        // Failsafe in case Haptics aren't available
        console.log('Haptics not available');
      }
    }
    setDailyCount(prevCount => prevCount + 1);
    setTotalCount(prevTotal => prevTotal + 1);
  };

  const resetDailyCount = () => {
    Alert.alert(
      "Reset Daily Count",
      "Are you sure you want to reset your daily count to zero?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          setDailyCount(0);
        }}
      ]
    );
  };

  const resetTotalCount = () => {
    Alert.alert(
      "Reset Total Count",
      "Are you sure you want to reset your all-time total count to zero?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          setTotalCount(0);
        }}
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>Declaration Counter</ThemedText>
      <ThemedText style={styles.subheader}>
        Count your daily declarations to track your progress
      </ThemedText>

      <ThemedView style={styles.counterContainer}>
        <ThemedView style={styles.counterSection}>
          <ThemedText style={styles.counterLabel}>Today's Count</ThemedText>
          <ThemedText style={styles.counterValue}>{dailyCount}</ThemedText>
          <TouchableOpacity 
            style={[styles.resetButton, styles.smallButton]} 
            onPress={resetDailyCount}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <ThemedText style={styles.resetButtonText}>Reset Daily</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.counterSection}>
          <ThemedText style={styles.counterLabel}>All-Time Total</ThemedText>
          <ThemedText style={styles.counterValue}>{totalCount}</ThemedText>
          <TouchableOpacity 
            style={[styles.resetButton, styles.smallButton]} 
            onPress={resetTotalCount}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <ThemedText style={styles.resetButtonText}>Reset Total</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity 
        style={styles.incrementButton} 
        onPress={incrementCount}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={36} color="#fff" />
        <ThemedText style={styles.incrementButtonText}>Count Declaration</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.tipsContainer}>
        <ThemedText style={styles.tipsHeader}>How to use the counter:</ThemedText>
        <ThemedText style={styles.tipText}>
          1. Each time you speak a declaration, tap the "Count Declaration" button
        </ThemedText>
        <ThemedText style={styles.tipText}>
          2. Your daily count resets automatically at midnight
        </ThemedText>
        <ThemedText style={styles.tipText}>
          3. Your all-time total continues to grow with each declaration
        </ThemedText>
        <ThemedText style={styles.tipText}>
          4. Use the reset buttons if you need to start over
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  incrementButton: {
    backgroundColor: '#4A90E2',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  incrementButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingHorizontal: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  tipsContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  tipsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});