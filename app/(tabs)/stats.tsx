
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, RefreshControl, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { counterEvents, COUNTER_UPDATED, loadCounts } from '@/services/counterService';

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const [totalCount, setTotalCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [daysTracked, setDaysTracked] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Load counter data and calculate stats
  const loadStatsData = async () => {
    try {
      // Load declaration counts
      const { dailyCount, totalCount, lastReset } = await loadCounts();
      setDailyCount(dailyCount);
      setTotalCount(totalCount);

      // Calculate days tracked (estimated from total declarations with average of 5 per day)
      // You can modify this logic based on your preferred calculation method
      const estimatedDays = Math.max(1, Math.ceil(totalCount / 5));
      setDaysTracked(estimatedDays);
    } catch (error) {
      console.error('Error loading stats data:', error);
    }
  };

  // Load data on initial mount
  useEffect(() => {
    loadStatsData();

    // Subscribe to counter updates from other screens
    const handleCounterUpdate = (counts) => {
      console.log('Counter update received in stats page:', counts);
      setDailyCount(counts.dailyCount);
      setTotalCount(counts.totalCount);
      
      // Recalculate days tracked when total changes
      const estimatedDays = Math.max(1, Math.ceil(counts.totalCount / 5));
      setDaysTracked(estimatedDays);
    };

    // Add event listener
    counterEvents.on(COUNTER_UPDATED, handleCounterUpdate);

    // Clean up listener when component unmounts
    return () => {
      counterEvents.off(COUNTER_UPDATED, handleCounterUpdate);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatsData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
        />
      }
    >
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>Your Progress</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Track your declaration journey</ThemedText>
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
              <Ionicons name="today-outline" size={30} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} />
            </View>
            <View style={styles.valueContainer}>
              <ThemedText style={styles.statValue}>{dailyCount}</ThemedText>
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.statLabel}>Today's Declarations</ThemedText>
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
              <Ionicons name="speedometer-outline" size={30} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} />
            </View>
            <View style={styles.valueContainer}>
              <ThemedText style={styles.statValue}>{totalCount > 0 ? Math.round(totalCount / daysTracked) : 0}</ThemedText>
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.statLabel}>Daily Average</ThemedText>
            </View>
          </View>
        </BlurView>
      </ScrollView>

      <View style={styles.insightsContainer}>
        <ThemedText style={styles.insightsTitle}>Insights</ThemedText>
        <View style={styles.insightCard}>
          <Ionicons name="bulb-outline" size={24} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} style={styles.insightIcon} />
          <ThemedText style={styles.insightText}>
            Consistency is key! Aim to speak declarations daily for the best results.
          </ThemedText>
        </View>
        <View style={styles.insightCard}>
          <Ionicons name="trending-up-outline" size={24} color={colorScheme === 'dark' ? '#ECEDEE' : '#11181C'} style={styles.insightIcon} />
          <ThemedText style={styles.insightText}>
            {totalCount > 100 ? 
              "Great work! You've made over 100 declarations. Keep building on this foundation." :
              "Aim for at least 5 declarations each day to build momentum."}
          </ThemedText>
        </View>
      </View>

      <View style={styles.helpContainer}>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={20} color="#0a7ea4" />
          <ThemedText style={styles.helpButtonText}>Learn More About Declarations</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  blurContainer: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCard: {
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  valueContainer: {
    marginBottom: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  textContainer: {},
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 12,
    marginBottom: 10,
  },
  insightIcon: {
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  helpContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  helpButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0a7ea4',
  },
});
