
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

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
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const saveCounts = async () => {
    try {
      const promises = [
        AsyncStorage.setItem('dailyCount', dailyCount.toString()),
        AsyncStorage.setItem('totalCount', totalCount.toString()),
        AsyncStorage.setItem('lastCountDate', new Date().toDateString())
      ];

      await Promise.all(promises);
      console.log('Counts saved successfully');
    } catch (error) {
      console.error('Error saving counts:', error);
    }
  };

  const checkDayChange = async () => {
    try {
      const lastCountDate = await AsyncStorage.getItem('lastCountDate');
      const today = new Date().toDateString();

      if (lastCountDate && lastCountDate !== today) {
        setDailyCount(0);
        await AsyncStorage.setItem('dailyCount', '0');
        await AsyncStorage.setItem('lastCountDate', today);
      }
    } catch (error) {
      console.error('Error checking day change:', error);
    }
  };

  const incrementCount = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDailyCount(prevCount => prevCount + 1);
    setTotalCount(prevTotal => prevTotal + 1);
  };

  const resetDailyCount = () => {
    try {
      Alert.alert(
        "Reset Daily Count",
        "Are you sure you want to reset your daily count to zero?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Reset", 
            onPress: async () => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              setDailyCount(0);
              await AsyncStorage.setItem('dailyCount', '0');
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error resetting daily count:", error);
    }
  };

  const resetTotalCount = () => {
    try {
      Alert.alert(
        "Reset Total Count",
        "Are you sure you want to reset your all-time total count to zero?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Reset", 
            onPress: async () => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              setTotalCount(0);
              await AsyncStorage.setItem('totalCount', '0');
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error resetting total count:", error);
    }
  };

  // Create padded digits for mechanical counter effect
  const formatCounterValue = (value) => {
    return value.toString().padStart(5, '0');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.header}>Declaration Counter</ThemedText>
        <ThemedText style={styles.subheader}>
          Count your daily declarations to track your progress
        </ThemedText>
        
        <ThemedView style={styles.counterContainer}>
          <ThemedView style={styles.counterCard}>
            <ThemedText style={styles.counterTitle}>TODAY'S COUNT</ThemedText>
            <ThemedView style={styles.mechanicalCounter}>
              {formatCounterValue(dailyCount).split('').map((digit, index) => (
                <ThemedView key={index} style={styles.digitContainer}>
                  <ThemedText style={styles.digit}>{digit}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetDailyCount}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <ThemedText style={styles.resetText}>Reset Daily</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.counterCard}>
            <ThemedText style={styles.counterTitle}>ALL-TIME TOTAL</ThemedText>
            <ThemedView style={styles.mechanicalCounter}>
              {formatCounterValue(totalCount).split('').map((digit, index) => (
                <ThemedView key={index} style={styles.digitContainer}>
                  <ThemedText style={styles.digit}>{digit}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetTotalCount}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <ThemedText style={styles.resetText}>Reset Total</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity 
          style={styles.countButton} 
          onPress={incrementCount}
          activeOpacity={0.7}
        >
          <ThemedView style={styles.countButtonInner}>
            <Ionicons name="add-circle-outline" size={32} color="#fff" />
            <ThemedText style={styles.countButtonText}>Count Declaration</ThemedText>
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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  counterContainer: {
    marginBottom: 30,
  },
  counterCard: {
    marginBottom: 25,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    backgroundColor: '#333',
  },
  counterTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    paddingVertical: 12,
    backgroundColor: '#444',
    color: '#fff',
    letterSpacing: 1,
  },
  mechanicalCounter: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#222',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  digitContainer: {
    width: width * 0.13,
    height: 60,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  digit: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    color: '#FFA500',
    textShadow: '0px 0px 5px rgba(255, 165, 0, 0.7)',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#d32f2f',
  },
  resetText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  countButton: {
    alignSelf: 'center',
    width: '90%',
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 30,
  },
  countButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tipsContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
});
