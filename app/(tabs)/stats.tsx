
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StatsScreen() {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      // Load the counts
      const storedDailyCount = await AsyncStorage.getItem('dailyCount');
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      
      if (storedDailyCount !== null) {
        setDailyCount(parseInt(storedDailyCount, 10));
      }
      
      if (storedTotalCount !== null) {
        setTotalCount(parseInt(storedTotalCount, 10));
      }
      
      // Load or set the start date
      let firstUseDate = await AsyncStorage.getItem('firstUseDate');
      if (firstUseDate === null) {
        firstUseDate = new Date().toISOString();
        await AsyncStorage.setItem('firstUseDate', firstUseDate);
      }
      setStartDate(firstUseDate);
      
      // Calculate streak (simplified version)
      const lastStreakCheck = await AsyncStorage.getItem('lastStreakCheck');
      const today = new Date().toDateString();
      
      if (lastStreakCheck !== null) {
        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        const storedStreak = await AsyncStorage.getItem('currentStreak');
        let currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;
        
        if (lastStreakCheck === yesterdayString || lastStreakCheck === today) {
          // Streak continues
          if (dailyCount > 0 && lastStreakCheck !== today) {
            currentStreak += 1;
          }
        } else {
          // Streak broken
          currentStreak = dailyCount > 0 ? 1 : 0;
        }
        
        setStreakDays(currentStreak);
        await AsyncStorage.setItem('currentStreak', currentStreak.toString());
      } else {
        // First time checking streak
        const initialStreak = dailyCount > 0 ? 1 : 0;
        setStreakDays(initialStreak);
        await AsyncStorage.setItem('currentStreak', initialStreak.toString());
      }
      
      // Update the last streak check date if declarations were made today
      if (dailyCount > 0) {
        await AsyncStorage.setItem('lastStreakCheck', today);
      }
      
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const calculateDaysSinceStart = () => {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const calculateAveragePerDay = () => {
    const days = calculateDaysSinceStart();
    if (days === 0) return 0;
    return (totalCount / days).toFixed(1);
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.header}>Your Progress</ThemedText>
        
        <ThemedView style={styles.statsOverview}>
          <ThemedView style={styles.statCard}>
            <Ionicons name="today" size={28} color="#4A90E2" />
            <ThemedText style={styles.statValue}>{dailyCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Today</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <Ionicons name="infinite" size={28} color="#4A90E2" />
            <ThemedText style={styles.statValue}>{totalCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <Ionicons name="flame" size={28} color="#4A90E2" />
            <ThemedText style={styles.statValue}>{streakDays}</ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.detailsCard}>
          <ThemedText style={styles.detailsTitle}>Statistics</ThemedText>
          
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Started using app</ThemedText>
            <ThemedText style={styles.detailValue}>
              {startDate ? formatDate(startDate) : 'Today'}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Days since start</ThemedText>
            <ThemedText style={styles.detailValue}>{calculateDaysSinceStart()} days</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Average per day</ThemedText>
            <ThemedText style={styles.detailValue}>{calculateAveragePerDay()}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Current daily streak</ThemedText>
            <ThemedText style={styles.detailValue}>{streakDays} days</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.motivationCard}>
          <ThemedText style={styles.motivationTitle}>Keep Going!</ThemedText>
          <ThemedText style={styles.motivationText}>
            "What you think about, you bring about. Daily declarations help rewire your brain for success."
          </ThemedText>
          <ThemedText style={styles.motivationSource}>- Igniting Hope Ministries</ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  motivationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  motivationSource: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
    opacity: 0.8,
  },
});
