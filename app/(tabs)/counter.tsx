import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView, StatusBar, Platform } from 'react-native';
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
  // ... (previous state declarations remain unchanged)

  // ... (useEffect and load functions remain largely unchanged)

  const incrementCounter = async () => {
    // Get latest settings
    const soundEnabled = await AsyncStorage.getItem('soundEnabled');
    const hapticEnabled = await AsyncStorage.getItem('hapticEnabled');

    // Play sound if enabled
    if (soundEnabled !== 'false' && sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }

    // Add haptic feedback if enabled
    if (Platform.OS !== 'web' && hapticEnabled !== 'false') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.error('Haptic feedback failed:', error);
        // No need for Vibration fallback since expo-haptics handles this internally
      }
    }

    // Update counts
    const newDailyCount = dailyCount + 1;
    const newTotalCount = totalCount + 1;

    setDailyCount(newDailyCount);
    setTotalCount(newTotalCount);

    await AsyncStorage.setItem('dailyCount', newDailyCount.toString());
    await AsyncStorage.setItem('totalCount', newTotalCount.toString());
  };

  const resetCounter = async (type) => {
    try {
      const confirmed = await new Promise((resolve) => {
        Alert.alert(
          `Reset ${type} Counter`,
          `Are you sure you want to reset your ${type} count? This cannot be undone.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (confirmed) {
        if (type === 'daily') {
          await AsyncStorage.setItem('dailyCount', '0');
          setDailyCount(0);
          Alert.alert('Success', 'Daily count has been reset');
        } else if (type === 'total') {
          await AsyncStorage.setItem('totalCount', '0');
          setTotalCount(0);
          Alert.alert('Success', 'Total count has been reset');
        }

        // Add haptic feedback for reset confirmation
        if (Platform.OS !== 'web') {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            console.error('Reset haptic feedback failed:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error resetting counter:', error);
      Alert.alert('Error', 'Could not reset counter');
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

// ... (styles remain unchanged)