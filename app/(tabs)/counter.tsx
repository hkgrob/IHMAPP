import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Dimensions, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function TabTwoScreen() {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDate, setLastDate] = useState('');
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showTips, setShowTips] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sound, setSound] = useState(null); // Added sound state
  const soundRef = useRef(new Audio.Sound());
  const [lastDeclarationDate, setLastDeclarationDate] = useState(''); // Added lastDeclarationDate state
  const hapticEnabled = Platform.OS !== 'web';


  useEffect(() => {
    loadCounts();
    loadSoundPreferences();
    loadLastDeclarationDate();
    //loadHapticPreferences(); //Assuming this function exists elsewhere.  If not, remove this line.

    // Setup midnight reset check
    const checkMidnightReset = () => {
      const now = new Date();
      const today = now.toDateString();

      if (lastDate !== today) {
        setDailyCount(0);
        AsyncStorage.setItem('dailyCount', '0')
          .then(() => console.log('Daily count reset at midnight'))
          .catch(error => console.error('Error resetting daily count:', error));
        setLastDate(today);
        AsyncStorage.setItem('lastDate', today);
      }
    };

    // Check every minute if we've crossed midnight
    const intervalId = setInterval(checkMidnightReset, 60000);

    // Initial check
    checkMidnightReset();

    return () => clearInterval(intervalId);
  }, [lastDate]);

  const loadCounts = async () => {
    try {
      const storedDailyCount = await AsyncStorage.getItem('dailyCount');
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      const storedLastDate = await AsyncStorage.getItem('lastDate');
      const storedBestStreak = await AsyncStorage.getItem('bestStreak');
      const storedCurrentStreak = await AsyncStorage.getItem('currentStreak');
      const storedFirstDate = await AsyncStorage.getItem('firstDate');

      if (storedDailyCount) setDailyCount(parseInt(storedDailyCount, 10));
      if (storedTotalCount) setTotalCount(parseInt(storedTotalCount, 10));
      if (storedLastDate) setLastDate(storedLastDate);
      if (storedBestStreak) setBestStreak(parseInt(storedBestStreak, 10));
      if (storedCurrentStreak) setCurrentStreak(parseInt(storedCurrentStreak, 10));

      const today = new Date().toDateString();
      if (!storedFirstDate) {
        await AsyncStorage.setItem('firstDate', today);
      }

      //This section is now handled by the useEffect's midnight check
      // if (storedLastDate && storedLastDate !== today) {
      //   setDailyCount(0);
      //   await AsyncStorage.setItem('dailyCount', '0');
      // }
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  const loadSoundPreferences = async () => {
    try {
      const storedSoundEnabled = await AsyncStorage.getItem('soundEnabled');
      if (storedSoundEnabled !== null) {
        setSoundEnabled(JSON.parse(storedSoundEnabled));
      }
    } catch (error) {
      console.error("Error loading sound preferences:", error);
    }
  };

  const loadLastDeclarationDate = async () => {
    try {
      const storedLastDeclarationDate = await AsyncStorage.getItem('lastDeclarationDate');
      if (storedLastDeclarationDate) {
        setLastDeclarationDate(storedLastDeclarationDate);
      }
    } catch (error) {
      console.error("Error loading last declaration date:", error);
    }
  };

  //Assuming this function exists elsewhere. If not, remove this function call and the function definition
  const loadHapticPreferences = async () => {
    //Implementation for loading haptic preferences
  }


  const incrementCount = async () => {
    try {
      console.log('Increment button pressed');
      const newDailyCount = dailyCount + 1;
      const newTotalCount = totalCount + 1;

      setDailyCount(newDailyCount);
      setTotalCount(newTotalCount);

      // Check if this is the first declaration of the day
      const today = new Date().toDateString();
      if (lastDeclarationDate !== today) {
        // New day, update the streak
        const newCurrentStreak = currentStreak + 1;
        setCurrentStreak(newCurrentStreak);
        if (newCurrentStreak > bestStreak) {
          setBestStreak(newCurrentStreak);
          await AsyncStorage.setItem('bestStreak', JSON.stringify(newCurrentStreak));
        }
        setLastDeclarationDate(today);
        await AsyncStorage.setItem('lastDeclarationDate', today);
      }

      // Save all data
      await saveCounts(newDailyCount, newTotalCount);

      if (hapticEnabled) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (hapticError) {
          console.log('Haptic feedback error:', hapticError);
        }
      }

      await playClickSound();

    } catch (error) {
      console.error('Error incrementing count:', error);
      Alert.alert('Error', 'Failed to increment count. Please try again.');
    }
  };

  const playClickSound = async () => {
    if (soundEnabled) {
      try {
        if (sound) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
          console.log('Sound played successfully');
        } else {
          console.log('Loading sound on demand');
          // Preload sound file to ensure it's cached
          const soundAsset = require('../../assets/sounds/click.mp3');
          const { sound: newSound } = await Audio.Sound.createAsync(
            soundAsset,
            { shouldPlay: false }
          );
          if (newSound) {
            setSound(newSound);
            try {
              await newSound.playAsync();
            } catch (playError) {
              console.error('Error playing sound:', playError);
            }
          } else {
            console.error('Failed to load sound');
          }
        }
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    }
  };

  const saveCounts = async (newDailyCount, newTotalCount) => {
    try {
      await AsyncStorage.setItem('dailyCount', newDailyCount.toString());
      await AsyncStorage.setItem('totalCount', newTotalCount.toString());
      await AsyncStorage.setItem('lastDate', new Date().toDateString());
      console.log("Counts saved successfully");
    } catch (error) {
      console.error("Error saving counts:", error);
    }
  };

  const resetDailyCount = () => {
    if (Platform.OS === 'web') {
      const confirmed = confirm("Are you sure you want to reset your daily count to zero?");
      if (confirmed) {
        setDailyCount(0);
        AsyncStorage.setItem('dailyCount', '0')
          .then(() => console.log('Daily count reset successfully'))
          .catch(error => console.error('Error resetting daily count:', error));
      }
    } else {
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
    if (Platform.OS === 'web') {
      const confirmed = confirm("Are you sure you want to reset your all-time total count to zero?");
      if (confirmed) {
        setTotalCount(0);
        AsyncStorage.setItem('totalCount', '0')
          .then(() => console.log('Total count reset successfully'))
          .catch(error => console.error('Error resetting total count:', error));
      }
    } else {
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

  const toggleTips = () => {
    setShowTips(!showTips);
  };

  const toggleSound = async (value) => {
    setSoundEnabled(value);
    try {
      await AsyncStorage.setItem('soundEnabled', value.toString());
      console.log('Sound preference saved');
    } catch (error) {
      console.error('Error saving sound preference:', error);
    }
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
            Declaration Clicker
          </ThemedText>
          <ThemedText style={styles.subheader}>
            Track your declarations to build new mindsets
          </ThemedText>
        </View>

        <View style={styles.counterContainer}>
          <BlurView intensity={90} tint="light" style={styles.counterCard}>
            <View style={styles.counterCardHeader}>
              <ThemedText style={styles.counterTitle}>TODAY'S COUNT</ThemedText>
              <TouchableOpacity 
                style={styles.resetButtonSmall} 
                onPress={resetDailyCount}>
                <Ionicons name="refresh" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <View style={styles.counterDisplayContainer}>
              <View style={styles.counterDisplay}>
                <ThemedText style={styles.counterNumber}>{dailyCount}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.counterDescription}>Declarations made today</ThemedText>
          </BlurView>

          <BlurView intensity={90} tint="light" style={styles.counterCard}>
            <View style={styles.counterCardHeader}>
              <ThemedText style={styles.counterTitle}>TOTAL COUNT</ThemedText>
              <TouchableOpacity 
                style={styles.resetButtonSmall} 
                onPress={resetTotalCount}>
                <Ionicons name="refresh" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <View style={styles.counterDisplayContainer}>
              <View style={styles.counterDisplay}>
                <ThemedText style={styles.counterNumber}>{totalCount}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.counterDescription}>All-time declarations</ThemedText>
          </BlurView>

          <View style={styles.streakContainer}>
            <BlurView intensity={90} tint="light" style={styles.streakCard}>
              <ThemedText style={styles.streakLabel}>Current Streak</ThemedText>
              <View style={styles.streakValueContainer}>
                <ThemedText style={styles.streakValue}>{currentStreak}</ThemedText>
                <ThemedText style={styles.streakUnit}>days</ThemedText>
              </View>
            </BlurView>

            <BlurView intensity={90} tint="light" style={styles.streakCard}>
              <ThemedText style={styles.streakLabel}>Best Streak</ThemedText>
              <View style={styles.streakValueContainer}>
                <ThemedText style={styles.streakValue}>{bestStreak}</ThemedText>
                <ThemedText style={styles.streakUnit}>days</ThemedText>
              </View>
            </BlurView>
          </View>

          <TouchableOpacity 
            style={[styles.countButton, {backgroundColor: '#FF9500'}]} 
            onPress={incrementCount}
            activeOpacity={0.8}
          >
            <BlurView intensity={100} tint="light" style={styles.countButtonInner}>
              <Ionicons name="add-circle" size={28} color="#fff" />
              <ThemedText style={styles.countButtonText}>Click Declaration</ThemedText>
            </BlurView>
          </TouchableOpacity>
        </View>

        {showTips && (
          <BlurView style={styles.tipsCard} intensity={90} tint="light">
            <ThemedText style={styles.tipsHeader}>Tips for Effective Declarations</ThemedText>

            <View style={styles.tipItem}>
              <View style={[styles.tipIcon, {backgroundColor: 'rgba(52, 199, 89, 0.2)'}]}>
                <Ionicons name="mic-outline" size={20} color="#34c759" />
              </View>
              <ThemedText style={styles.tipText}>Speak your declarations out loud with conviction</ThemedText>
            </View>

            <View style={styles.tipItem}>
              <View style={[styles.tipIcon, {backgroundColor: 'rgba(255, 149, 0, 0.2)'}]}>
                <Ionicons name="repeat-outline" size={20} color="#FF9500" />
              </View>
              <ThemedText style={styles.tipText}>Consistency is key - make declarations daily</ThemedText>
            </View>

            <View style={styles.tipItem}>
              <View style={[styles.tipIcon, {backgroundColor: 'rgba(255, 45, 85, 0.2)'}]}>
                <Ionicons name="heart-outline" size={20} color="#FF2D55" />
              </View>
              <ThemedText style={styles.tipText}>Speak with emotion and belief to increase effectiveness</ThemedText>
            </View>

            <TouchableOpacity 
              onPress={() => toggleTips()} 
              style={styles.dismissButton}
            >
              <ThemedText style={styles.dismissText}>Dismiss</ThemedText>
            </TouchableOpacity>
          </BlurView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: -0.5,
    color: 'black', //Improved contrast
  },
  subheader: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 6,
    color: '#8E8E93',
    fontWeight: '500',
  },
  counterContainer: {
    flex: 1,
  },
  counterCard: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  counterCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black', //Improved contrast
    letterSpacing: 0.5,
  },
  resetButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  counterDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  counterNumber: {
    fontSize: 72,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: '#000',
    ...Platform.select({
      web: {
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  counterDescription: {
    fontSize: 15,
    color: 'black', //Improved contrast
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  streakCard: {
    borderRadius: 20,
    padding: 16,
    flex: 0.48,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black', //Improved contrast
    marginBottom: 6,
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5856D6', 
  },
  streakUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black', //Improved contrast
    marginLeft: 4,
  },
  countButton: {
    alignSelf: 'center',
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
      }
    }),
    marginBottom: 30,
    marginTop: 10,
  },
  countButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34c759', 
  },
  countButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  tipsCard: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  tipsHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: 'black', //Improved contrast
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: 'black', //Improved contrast
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  dismissText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
  }
});