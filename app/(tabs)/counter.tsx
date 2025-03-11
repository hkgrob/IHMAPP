import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';


export default function CounterScreen() {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [lastReset, setLastReset] = useState('');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text'); // Added for text color

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      const storedDailyCount = await AsyncStorage.getItem('dailyCount');
      const storedLastReset = await AsyncStorage.getItem('lastReset');

      if (storedTotalCount) setTotalCount(parseInt(storedTotalCount));

      // Check if we need to reset the daily count (new day)
      const today = new Date().toDateString();
      if (storedLastReset !== today) {
        await AsyncStorage.setItem('dailyCount', '0');
        await AsyncStorage.setItem('lastReset', today);
        setDailyCount(0);
        setLastReset(today);
      } else {
        if (storedDailyCount) setDailyCount(parseInt(storedDailyCount));
        if (storedLastReset) setLastReset(storedLastReset);
      }
    } catch (error) {
      console.error('Error loading counts', error);
    }
  };

  const saveCounts = async (newDaily: number, newTotal: number) => {
    try {
      await AsyncStorage.setItem('dailyCount', newDaily.toString());
      await AsyncStorage.setItem('totalCount', newTotal.toString());
      console.log('Counts saved successfully');
    } catch (error) {
      console.error('Error saving counts', error);
    }
  };

  const incrementCount = async () => {
    try {
      console.log('Increment button pressed');

      // Play click sound
      try {
        const soundAsset = require('../../assets/sounds/click.mp3');
        const { sound } = await Audio.Sound.createAsync(
          soundAsset,
          { shouldPlay: true }
        );
        // Unload sound after playing
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (soundError) {
        console.error('Error playing sound:', soundError);
      }

      // Add haptic feedback on iOS
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const newDailyCount = dailyCount + 1;
      const newTotalCount = totalCount + 1;
      setDailyCount(newDailyCount);
      setTotalCount(newTotalCount);
      await AsyncStorage.setItem('dailyCount', newDailyCount.toString());
      await AsyncStorage.setItem('totalCount', newTotalCount.toString());
      console.log('Counts saved successfully');
    } catch (error) {
      console.error('Error saving counts:', error);
    }
  };

  const resetDailyCount = async () => {
    try {
      await AsyncStorage.setItem('dailyCount', '0');
      setDailyCount(0);
      console.log('Daily count reset successfully');
    } catch (error) {
      console.error('Error resetting daily count', error);
    }
  };

  const resetTotalCount = async () => {
    try {
      await AsyncStorage.setItem('totalCount', '0');
      setTotalCount(0);
      console.log('Total count reset successfully');
    } catch (error) {
      console.error('Error resetting total count', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Declaration Counter',
          headerShown: false,
        }}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.counterContainer}>
          <ThemedText style={styles.title}>Declaration Counter</ThemedText>

          <ThemedView style={styles.statsContainer}>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statLabel}>Daily</ThemedText>
              <ThemedText style={styles.statValue}>{dailyCount}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statLabel}>Total</ThemedText>
              <ThemedText style={styles.statValue}>{totalCount}</ThemedText>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity
            style={[styles.incrementButton, { backgroundColor: tintColor }]}
            onPress={incrementCount}
          >
            <ThemedText style={styles.buttonText} lightColor="#000000" darkColor="#FFFFFF">
              I Made a Declaration
            </ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.resetContainer}>
            <TouchableOpacity 
              style={[styles.resetButton, { borderColor: tintColor }]} 
              onPress={resetDailyCount}
            >
              <ThemedText style={[styles.resetText, { color: tintColor }]}>Reset Daily</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.resetButton, { borderColor: tintColor }]} 
              onPress={resetTotalCount}
            >
              <ThemedText style={[styles.resetText, { color: tintColor }]}>Reset Total</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <View style={styles.tipsContainer}>
          <BlurView intensity={90} tint={Platform.OS === 'ios' ? 'default' : 'light'} style={styles.tipsCard}>
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
  scrollContent: {
    padding: 20,
  },
  counterContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  incrementButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsContainer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  tipsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 15,
    lineHeight: 22,
  },
});