import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, ScrollView, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function CounterScreen() {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [buttonScale] = useState(new Animated.Value(1));
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const savedDailyCount = await AsyncStorage.getItem('daily_count');
      const savedTotalCount = await AsyncStorage.getItem('total_count');
      const savedStreakDays = await AsyncStorage.getItem('streak_days');
      const lastCountDate = await AsyncStorage.getItem('last_count_date');

      if (savedDailyCount) setDailyCount(parseInt(savedDailyCount));
      if (savedTotalCount) setTotalCount(parseInt(savedTotalCount));
      if (savedStreakDays) setStreakDays(parseInt(savedStreakDays));

      // Check if it's a new day
      const today = new Date().toDateString();
      if (lastCountDate && lastCountDate !== today) {
        // It's a new day, reset daily count
        setDailyCount(0);
        await AsyncStorage.setItem('daily_count', '0');
        await AsyncStorage.setItem('last_count_date', today);
      }
    } catch (e) {
      console.error('Failed to load counts:', e);
    }
  };

  const saveCounts = async () => {
    try {
      await AsyncStorage.setItem('daily_count', dailyCount.toString());
      await AsyncStorage.setItem('total_count', totalCount.toString());
      await AsyncStorage.setItem('streak_days', streakDays.toString());
      await AsyncStorage.setItem('last_count_date', new Date().toDateString());
      console.log('Counts saved successfully');
    } catch (e) {
      console.error('Failed to save counts:', e);
    }
  };

  const incrementCount = () => {
    const newDailyCount = dailyCount + 1;
    const newTotalCount = totalCount + 1;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    console.log('Increment button pressed');
    setDailyCount(newDailyCount);
    setTotalCount(newTotalCount);

    // Check if this is the first declaration of the day
    if (dailyCount === 0) {
      setStreakDays(streakDays + 1);
    }

    animateButton();
    saveCounts();
  };

  const resetDailyCount = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setDailyCount(0);
    await AsyncStorage.setItem('daily_count', '0');
    console.log('Daily count reset successfully');
    setShowResetConfirm(false);
  };

  const resetTotalCount = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setTotalCount(0);
    setStreakDays(0);
    await AsyncStorage.setItem('total_count', '0');
    await AsyncStorage.setItem('streak_days', '0');
    console.log('Total count reset successfully');
    setShowResetConfirm(false);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <ThemedText style={styles.header}>
            Declaration Tracker
          </ThemedText>
          <ThemedText style={styles.subheader}>
            Build powerful new mindsets one declaration at a time
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          {/* Daily Count Card */}
          <BlurView intensity={90} tint="light" style={styles.statsCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="today-outline" size={24} color="#5AC8FA" />
            </View>
            <ThemedText style={styles.statValue}>{dailyCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Today</ThemedText>
          </BlurView>

          {/* Total Count Card */}
          <BlurView intensity={90} tint="light" style={styles.statsCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="infinite-outline" size={24} color="#FF9500" />
            </View>
            <ThemedText style={styles.statValue}>{totalCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </BlurView>

          {/* Streak Card */}
          <BlurView intensity={90} tint="light" style={styles.statsCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame-outline" size={24} color="#FF2D55" />
            </View>
            <ThemedText style={styles.statValue}>{streakDays}</ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </BlurView>
        </View>

        {/* Main Counter Button */}
        <Animated.View style={{transform: [{scale: buttonScale}]}}>
          <TouchableOpacity 
            style={styles.mainButton}
            activeOpacity={0.7}
            onPress={incrementCount}
          >
            <BlurView intensity={90} tint="light" style={styles.mainButtonInner}>
              <Ionicons name="add-circle" size={32} color="#4CD964" />
              <ThemedText style={styles.mainButtonText}>Log Declaration</ThemedText>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.resetSection}>
          <ThemedText style={styles.resetTitle}>Management</ThemedText>

          {showResetConfirm ? (
            <View style={styles.confirmationContainer}>
              <ThemedText style={styles.confirmationText}>Are you sure?</ThemedText>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.cancelButton]} 
                  onPress={() => setShowResetConfirm(false)}
                >
                  <ThemedText style={styles.confirmButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.resetConfirmButton]} 
                  onPress={resetDailyCount}
                >
                  <ThemedText style={styles.confirmButtonText}>Reset Today</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.resetAllButton]} 
                  onPress={resetTotalCount}
                >
                  <ThemedText style={styles.confirmButtonText}>Reset All</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={() => setShowResetConfirm(true)}
            >
              <Ionicons name="refresh" size={20} color="#FF3B30" />
              <ThemedText style={styles.resetButtonText}>Reset Counters</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tipsContainer}>
          <BlurView intensity={90} tint="light" style={styles.tipsCard}>
            <ThemedText style={styles.tipsTitle}>
              <Ionicons name="bulb-outline" size={18} color="#FFCC00" /> Tip
            </ThemedText>
            <ThemedText style={styles.tipsText}>
              Consistency is key! Aim to speak declarations aloud daily to build new neural pathways.
            </ThemedText>
          </BlurView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  mainButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mainButtonInner: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  resetSection: {
    marginBottom: 24,
  },
  resetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
  },
  resetButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
  },
  confirmationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  confirmationText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
  },
  resetConfirmButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  resetAllButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  confirmButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  tipsContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  }
});