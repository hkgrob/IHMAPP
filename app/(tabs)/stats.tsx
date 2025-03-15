
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, RefreshControl, useColorScheme, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { counterEvents, COUNTER_UPDATED, loadCounts } from '@/services/counterService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const [totalCount, setTotalCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [daysTracked, setDaysTracked] = useState(0);
  const [firstDate, setFirstDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load counter data and calculate stats
  const loadStatsData = async () => {
    try {
      setLoading(true);
      
      // Load declaration counts
      const { dailyCount, totalCount } = await loadCounts();
      setDailyCount(dailyCount);
      setTotalCount(totalCount);

      // Load streak data
      const currentStreakValue = await AsyncStorage.getItem('currentStreak');
      const bestStreakValue = await AsyncStorage.getItem('bestStreak');
      const firstDateValue = await AsyncStorage.getItem('firstDate');
      
      setCurrentStreak(currentStreakValue ? parseInt(currentStreakValue, 10) : 0);
      setBestStreak(bestStreakValue ? parseInt(bestStreakValue, 10) : 0);
      
      if (firstDateValue) {
        setFirstDate(new Date(firstDateValue));
        // Calculate days since first use
        const firstUseDate = new Date(firstDateValue);
        const today = new Date();
        const diffTime = Math.abs(today - firstUseDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysTracked(diffDays);
      } else {
        // If no first date is set, initialize it
        const today = new Date();
        await AsyncStorage.setItem('firstDate', today.toString());
        setFirstDate(today);
        setDaysTracked(1);
      }
    } catch (error) {
      console.error('Error loading stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on initial mount
  useEffect(() => {
    loadStatsData();

    // Subscribe to counter updates
    const handleCounterUpdate = (data) => {
      console.log('Counter update received in stats page:', data);
      setDailyCount(data.dailyCount);
      setTotalCount(data.totalCount);
      
      // Reload streak data after counter update
      loadStreakData();
    };

    counterEvents.on(COUNTER_UPDATED, handleCounterUpdate);

    return () => {
      counterEvents.off(COUNTER_UPDATED, handleCounterUpdate);
    };
  }, []);

  // Load streak data only
  const loadStreakData = async () => {
    try {
      const currentStreakValue = await AsyncStorage.getItem('currentStreak');
      const bestStreakValue = await AsyncStorage.getItem('bestStreak');
      
      setCurrentStreak(currentStreakValue ? parseInt(currentStreakValue, 10) : 0);
      setBestStreak(bestStreakValue ? parseInt(bestStreakValue, 10) : 0);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatsData();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading stats...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <ThemedText style={styles.pageTitle}>Your Progress</ThemedText>
        <ThemedText style={styles.pageSubtitle}>Track your declaration journey</ThemedText>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="today-outline" size={22} color="#0a7ea4" />
          </View>
          <ThemedText style={styles.statValue}>{dailyCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Today</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="stats-chart-outline" size={22} color="#0a7ea4" />
          </View>
          <ThemedText style={styles.statValue}>{totalCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Declarations</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame-outline" size={22} color="#FF6700" />
          </View>
          <ThemedText style={styles.statValue}>{currentStreak}</ThemedText>
          <ThemedText style={styles.statLabel}>Current Streak</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trophy-outline" size={22} color="#FF6700" />
          </View>
          <ThemedText style={styles.statValue}>{bestStreak}</ThemedText>
          <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
        </View>
      </View>

      <View style={[styles.insightsContainer, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
        <ThemedText style={styles.insightsTitle}>Insights</ThemedText>
        
        <View style={styles.insightRow}>
          <Ionicons name="calendar-outline" size={20} color="#0a7ea4" />
          <ThemedText style={styles.insightText}>
            You started using the app on {firstDate ? formatDate(firstDate) : 'N/A'}
          </ThemedText>
        </View>
        
        <View style={styles.insightRow}>
          <Ionicons name="time-outline" size={20} color="#0a7ea4" />
          <ThemedText style={styles.insightText}>
            You've been speaking declarations for {daysTracked} days
          </ThemedText>
        </View>
        
        <View style={styles.insightRow}>
          <Ionicons name="analytics-outline" size={20} color="#0a7ea4" />
          <ThemedText style={styles.insightText}>
            Daily average: {daysTracked > 0 ? Math.round(totalCount / daysTracked * 10) / 10 : 0} declarations
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Keep declaring to increase your streak!
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  insightsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
