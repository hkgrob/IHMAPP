import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Dimensions, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
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
    // For web platform, use confirm instead of Alert
    if (Platform.OS === 'web') {
      const confirmed = confirm("Are you sure you want to reset your daily count to zero?");
      if (confirmed) {
        setDailyCount(0);
        AsyncStorage.setItem('dailyCount', '0')
          .then(() => console.log('Daily count reset successfully'))
          .catch(error => console.error('Error resetting daily count:', error));
      }
    } else {
      // For native platforms, use Alert
      Alert.alert(
        "Reset Daily Count",
        "Are you sure you want to reset your daily count to zero?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Reset", 
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setDailyCount(0);
              AsyncStorage.setItem('dailyCount', '0')
                .then(() => console.log('Daily count reset successfully'))
                .catch(error => console.error('Error resetting daily count:', error));
            }
          }
        ]
      );
    }
  };

  const resetTotalCount = () => {
    // For web platform, use confirm instead of Alert
    if (Platform.OS === 'web') {
      const confirmed = confirm("Are you sure you want to reset your all-time total count to zero?");
      if (confirmed) {
        setTotalCount(0);
        AsyncStorage.setItem('totalCount', '0')
          .then(() => console.log('Total count reset successfully'))
          .catch(error => console.error('Error resetting total count:', error));
      }
    } else {
      // For native platforms, use Alert
      Alert.alert(
        "Reset Total Count",
        "Are you sure you want to reset your all-time total count to zero?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Reset", 
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setTotalCount(0);
              AsyncStorage.setItem('totalCount', '0')
                .then(() => console.log('Total count reset successfully'))
                .catch(error => console.error('Error resetting total count:', error));
            }
          }
        ]
      );
    }
  };

  // Create padded digits for mechanical counter effect
  const formatCounterValue = (value) => {
    return value.toString().padStart(5, '0');
  };
  
  const getFormattedDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Declaration Counter</ThemedText>
          <ThemedText style={styles.dateText}>{getFormattedDate()}</ThemedText>
        </ThemedView>
        
        {/* Daily Counter Card */}
        <ThemedView style={styles.counterCard}>
          <BlurView intensity={80} style={styles.blurContainer} tint="light">
            <ThemedText style={styles.counterLabel}>Today's Count</ThemedText>
            <ThemedView style={styles.counterDisplay}>
              {formatCounterValue(dailyCount).split('').map((digit, index) => (
                <ThemedView key={index} style={styles.digitContainer}>
                  <ThemedText style={styles.digit}>{digit}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            <ThemedText style={styles.counterDescription}>
              Declarations made today
            </ThemedText>
          </BlurView>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetDailyCount}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <ThemedText style={styles.resetText}>Reset</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {/* Total Counter Card */}
        <ThemedView style={styles.counterCard}>
          <BlurView intensity={80} style={styles.blurContainer} tint="light">
            <ThemedText style={styles.counterLabel}>All-Time Total</ThemedText>
            <ThemedView style={styles.counterDisplay}>
              {formatCounterValue(totalCount).split('').map((digit, index) => (
                <ThemedView key={index} style={styles.digitContainer}>
                  <ThemedText style={styles.digit}>{digit}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            <ThemedText style={styles.counterDescription}>
              Your declaration journey
            </ThemedText>
          </BlurView>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetTotalCount}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <ThemedText style={styles.resetText}>Reset</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {/* Count Declaration Button */}
        <TouchableOpacity 
          style={styles.countButton} 
          onPress={incrementCount}
          activeOpacity={0.8}
        >
          <ThemedView style={styles.countButtonInner}>
            <Ionicons name="add-circle" size={30} color="#fff" />
            <ThemedText style={styles.countButtonText}>Count Declaration</ThemedText>
          </ThemedView>
        </TouchableOpacity>
        
        {/* Tips Card */}
        <ThemedView style={styles.tipsCard}>
          <ThemedText style={styles.tipsHeader}>How to use</ThemedText>
          <View style={styles.tipItem}>
            <ThemedView style={styles.tipBullet}><ThemedText style={styles.bulletText}>1</ThemedText></ThemedView>
            <ThemedText style={styles.tipText}>
              Tap "Count Declaration" each time you speak a declaration
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedView style={styles.tipBullet}><ThemedText style={styles.bulletText}>2</ThemedText></ThemedView>
            <ThemedText style={styles.tipText}>
              Daily count resets automatically at midnight
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedView style={styles.tipBullet}><ThemedText style={styles.bulletText}>3</ThemedText></ThemedView>
            <ThemedText style={styles.tipText}>
              All-time total accumulates your declarations over time
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedView style={styles.tipBullet}><ThemedText style={styles.bulletText}>4</ThemedText></ThemedView>
            <ThemedText style={styles.tipText}>
              Use reset buttons if you need to start over
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7', // Apple light background color
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.4,
    color: '#1d1d1f', // Apple dark text color
  },
  dateText: {
    fontSize: 16,
    color: '#86868b', // Apple secondary text color
    fontWeight: '500',
  },
  counterCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  counterLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1d1d1f',
    textAlign: 'center',
  },
  counterDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  digitContainer: {
    width: width * 0.12,
    height: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  digit: {
    fontSize: 36,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: '#ff9f0a', // Apple orange
  },
  counterDescription: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ff3b30', // Apple red
  },
  resetText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 15,
  },
  countButton: {
    alignSelf: 'center',
    width: '100%',
    height: 60,
    borderRadius: 16,
    backgroundColor: '#34c759', // Apple green
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 30,
    marginTop: 10,
  },
  countButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
  tipsCard: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  tipsHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1d1d1f',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0071e3', // Apple blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1d1d1f',
    flex: 1,
    fontWeight: '400',
  },
});