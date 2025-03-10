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

  const resetDailyCount = async () => {
    try {
      Alert.alert(
        "Reset Daily Count",
        "Are you sure you want to reset your daily count to zero?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            setDailyCount(0);
            await AsyncStorage.setItem('dailyCount', '0');
          }}
        ]
      );
    } catch (error) {
      console.error("Error resetting daily count:", error);
    }
  };

  const resetTotalCount = async () => {
    Alert.alert(
      "Reset Total Count",
      "Are you sure you want to reset your all-time total count to zero?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: async () => {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          setTotalCount(0);
          await AsyncStorage.setItem('totalCount', '0');
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

      <ThemedView style={styles.countersWrapper}>
        <ThemedView style={styles.tallyCounterContainer}>
          <ThemedText style={styles.counterLabel}>Today's Count</ThemedText>
          <ThemedView style={styles.tallyCounter}>
            <ThemedView style={styles.counterDisplay}>
              <ThemedView style={styles.displayWindow}>
                <ThemedText style={styles.counterDigit}>{dailyCount}</ThemedText>
              </ThemedView>
            </ThemedView>
            <TouchableOpacity style={[styles.resetButton, styles.counterButton]} onPress={() => resetDailyCount()}>
              <ThemedView style={styles.buttonInner}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <ThemedText style={styles.buttonText}>Reset Daily</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.tallyCounterContainer}>
          <ThemedText style={styles.counterLabel}>All-Time Total</ThemedText>
          <ThemedView style={styles.tallyCounter}>
            <ThemedView style={styles.counterDisplay}>
              <ThemedView style={styles.displayWindow}>
                <ThemedText style={styles.counterDigit}>{totalCount}</ThemedText>
              </ThemedView>
            </ThemedView>
            <TouchableOpacity style={[styles.resetButton, styles.counterButton]} onPress={() => resetTotalCount()}>
              <ThemedView style={styles.buttonInner}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <ThemedText style={styles.buttonText}>Reset Total</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={styles.bigCountButton} onPress={incrementCount} activeOpacity={0.7}>
        <ThemedView style={styles.bigCountButtonInner}>
          <Ionicons name="add" size={48} color="#fff" />
          <ThemedText style={styles.bigCountButtonText}>Count Declaration</ThemedText>
        </ThemedView>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  countersWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  tallyCounterContainer: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 20,
  },
  counterLabel: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  tallyCounter: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#2b2b2b',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  counterDisplay: {
    backgroundColor: '#262626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
  },
  displayWindow: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  counterDigit: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e51',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textShadowColor: 'rgba(229, 51, 17, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  counterButton: {
    paddingVertical: 10,
    backgroundColor: '#444',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  bigCountButton: {
    alignSelf: 'center',
    width: '80%',
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e51',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  bigCountButtonInner: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCountButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tipsContainer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  tipsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});