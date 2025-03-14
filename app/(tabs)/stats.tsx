import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from '@/hooks/useThemeColor'; // Added import


export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const [totalCount, setTotalCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [daysTracked, setDaysTracked] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      const storedBestStreak = await AsyncStorage.getItem('bestStreak');
      const storedCurrentStreak = await AsyncStorage.getItem('currentStreak');
      const storedFirstDate = await AsyncStorage.getItem('firstDate');

      if (storedTotalCount) setTotalCount(parseInt(storedTotalCount, 10));
      if (storedBestStreak) setBestStreak(parseInt(storedBestStreak, 10));
      if (storedCurrentStreak) setCurrentStreak(parseInt(storedCurrentStreak, 10));

      // Calculate days tracked
      if (storedFirstDate) {
        const firstDate = new Date(storedFirstDate);
        const today = new Date();
        const diffTime = Math.abs(today - firstDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysTracked(diffDays + 1); // +1 to include the first day

        // Calculate daily average
        if (diffDays > 0 && storedTotalCount) {
          setDailyAverage(parseInt(storedTotalCount, 10) / diffDays);
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <ThemedText style={styles.title}>Your Stats</ThemedText>
      </View>

      <ScrollView style={styles.statsContainer} contentContainerStyle={styles.statsContent}>
        <BlurView 
          intensity={80} 
          tint={colorScheme === 'dark' ? 'dark' : 'light'} 
          style={styles.blurContainer}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={30} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} />
            </View>
            <View style={styles.valueContainer}>
              <ThemedText style={styles.statValue}>{daysTracked}</ThemedText>
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.statLabel}>Days Tracked</ThemedText>
            </View>
          </View>
        </BlurView>

        <BlurView 
          intensity={80} 
          tint={colorScheme === 'dark' ? 'dark' : 'light'} 
          style={styles.blurContainer}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calculator-outline" size={30} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} />
            </View>
            <View style={styles.valueContainer}>
              <ThemedText style={styles.statValue}>{totalCount}</ThemedText>
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.statLabel}>Total Declarations</ThemedText>
            </View>
          </View>
        </BlurView>

        <BlurView 
          intensity={80} 
          tint={colorScheme === 'dark' ? 'dark' : 'light'} 
          style={styles.blurContainer}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up-outline" size={30} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} />
            </View>
            <View style={styles.valueContainer}>
              <ThemedText style={styles.statValue}>{dailyAverage.toFixed(1)}</ThemedText>
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.statLabel}>Daily Average</ThemedText>
            </View>
          </View>
        </BlurView>

        <BlurView 
          intensity={80} 
          tint={colorScheme === 'dark' ? 'dark' : 'light'} 
          style={styles.blurContainer}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame-outline" size={30} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} />
            </View>
            <View style={styles.valueContainer}>
              <ThemedText style={styles.statValue}>{currentStreak}</ThemedText>
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.statLabel}>Current Streak</ThemedText>
            </View>
          </View>
        </BlurView>

        <BlurView 
          intensity={80} 
          tint={colorScheme === 'dark' ? 'dark' : 'light'} 
          style={styles.blurContainer}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: useThemeColor({}, 'accent') }]}> {/* Only change applied here */}
              <Ionicons name="trophy-outline" size={30} color="#FFFFFF" />
            </View>
            <View style={styles.valueContainer}>
              <ThemedText style={styles.statValue}>{bestStreak}</ThemedText>
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
            </View>
          </View>
        </BlurView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    padding: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flex: 1,
  },
  statsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  blurContainer: {
    width: '48%',
    marginBottom: 16,
    overflow: 'visible', // Ensure BlurView doesn't clip content
  },
  statCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    backgroundColor: 'transparent', // Ensure no conflicting background
  },
  statIconContainer: {
    marginBottom: 12,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '100%',
    width: 'auto',
    overflow: 'visible',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '100%',
    paddingHorizontal: 8,
  },
});