import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Alert, Dimensions, Text, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function CounterScreen() {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [lastReset, setLastReset] = useState('');
  const [hapticEnabled, setHapticEnabled] = useState(true); // Initialize to true
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sound, setSound] = useState(null);
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadHapticSetting();
    loadSoundSetting();
    loadSound();
    loadCounts(); // Load counts after settings

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadCounts = async () => {
    try {
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      const storedDailyCount = await AsyncStorage.getItem('dailyCount');
      const storedLastReset = await AsyncStorage.getItem('lastReset');

      console.log('Loading counts:', { storedTotalCount, storedDailyCount, storedLastReset });

      if (storedTotalCount !== null) {
        setTotalCount(parseInt(storedTotalCount) || 0);
      } else {
        setTotalCount(0);
        await AsyncStorage.setItem('totalCount', '0');
      }

      const today = new Date().toDateString();
      if (storedLastReset !== today || storedDailyCount === null) {
        await AsyncStorage.setItem('dailyCount', '0');
        await AsyncStorage.setItem('lastReset', today);
        setDailyCount(0);
        setLastReset(today);
      } else {
        if (storedDailyCount !== null) {
          setDailyCount(parseInt(storedDailyCount) || 0);
        } else {
          setDailyCount(0);
          await AsyncStorage.setItem('dailyCount', '0');
        }
        if (storedLastReset) setLastReset(storedLastReset);
      }
    } catch (error) {
      console.error('Error loading counts', error);
      setDailyCount(0);
      setTotalCount(0);
      await AsyncStorage.setItem('dailyCount', '0');
      await AsyncStorage.setItem('totalCount', '0');
    }
  };

  const saveCounts = async (newDaily: number, newTotal: number) => {
    try {
      await AsyncStorage.setItem('dailyCount', newDaily.toString());
      await AsyncStorage.setItem('totalCount', newTotal.toString());
      console.log('Counts saved successfully:', { newDaily, newTotal });
    } catch (error) {
      console.error('Error saving counts', error);
    }
  };

  const loadSound = async () => {
    try {
      const soundAsset = require('../../assets/sounds/click.mp3');
      console.log('Loading sound asset in counter:', soundAsset);

      const { sound } = await Audio.Sound.createAsync(
        soundAsset,
        { shouldPlay: false }
      );

      if (sound) {
        setSound(sound);
        console.log('Sound loaded successfully in counter');
      } else {
        console.error('Sound object is null or undefined');
      }
    } catch (error) {
      console.error('Error loading sound in counter:', error);
    }
  };

  const loadHapticSetting = async () => {
    try {
      const storedHaptic = await AsyncStorage.getItem('hapticEnabled');
      setHapticEnabled(storedHaptic === 'true'); //Directly sets the state.
    } catch (error) {
      console.error("Error loading haptic setting:", error);
      // Handle error - perhaps set a default value
      setHapticEnabled(true); // Default to enabled if loading fails
    }
  };

  const loadSoundSetting = async () => {
    try {
      const storedSound = await AsyncStorage.getItem('soundEnabled');
      setSoundEnabled(storedSound === 'true');
    } catch (error) {
      console.error("Error loading sound setting:", error);
      setSoundEnabled(true); //Default to enabled if loading fails.
    }
  };

  const incrementCount = async () => {
    try {
      console.log('Increment button pressed');

      // Update UI count
      setCount(prevCount => prevCount + 1);


      // Play haptic feedback if enabled and platform is not web
      if (hapticEnabled && Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          console.log('Haptic feedback applied successfully');
        } catch (hapticError) {
          console.error('Error applying haptic feedback:', hapticError);
        }
      } else {
          console.log('Haptic feedback not applied: Haptic disabled or web platform');
      }

      // Play sound if enabled
      if (soundEnabled && sound) {
        console.log('Playing sound');
        try {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        } catch (soundError) {
          console.error('Error playing sound:', soundError);
        }
      } else {
        console.log('Sound not played: Sound disabled');
      }

      // Update and save daily and total counts
      const newDailyCount = dailyCount + 1;
      const newTotalCount = totalCount + 1;
      setDailyCount(newDailyCount);
      setTotalCount(newTotalCount);
      await saveCounts(newDailyCount, newTotalCount);
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  };

  const resetDailyCount = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!window.confirm('Are you sure you want to reset your daily count?')) return;
      } else {
        Alert.alert(
          "Reset Daily Count",
          "Are you sure you want to reset your daily count?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Reset", 
              style: "destructive",
              onPress: async () => {
                await AsyncStorage.setItem('dailyCount', '0');
                setDailyCount(0);
                console.log('Daily count reset successfully');
              }
            }
          ]
        );
        return;
      }
      await AsyncStorage.setItem('dailyCount', '0');
      setDailyCount(0);
      console.log('Daily count reset successfully');
    } catch (error) {
      console.error('Error resetting daily count:', error);
    }
  };

  const resetTotalCount = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!window.confirm('Are you sure you want to reset your total count?')) return;
      } else {
        Alert.alert(
          "Reset Total Count",
          "Are you sure you want to reset your total count? This will clear all your declaration history.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Reset", 
              style: "destructive",
              onPress: async () => {
                await AsyncStorage.setItem('totalCount', '0');
                setTotalCount(0);
                console.log('Total count reset successfully');
              }
            }
          ]
        );
        return;
      }
      await AsyncStorage.setItem('totalCount', '0');
      setTotalCount(0);
      console.log('Total count reset successfully');
    } catch (error) {
      console.error('Error resetting total count:', error);
    }
  };

  const isSmallScreen = windowWidth < 350;

  const baseFontSize = 36;

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          isSmallScreen && styles.scrollContentSmall,
          { paddingTop: 0 } // Remove extra top padding
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}> {/* Added content wrapper */}
          <ThemedText style={styles.pageTitle}>Declaration Counter</ThemedText> {/* Moved title outside */}
          <ThemedView style={styles.counterContainer}>

            <ThemedView style={styles.statsContainer}>
              <ThemedView style={[styles.statCard, { backgroundColor: 'rgba(144, 238, 144, 0.3)' }]}>
                <ThemedText style={styles.statLabel} numberOfLines={1}>Daily</ThemedText>
                <Text 
                  style={[styles.statValue, { fontSize: baseFontSize }]} 
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                  maxFontSizeMultiplier={1.2}
                >
                  {dailyCount.toString()}
                </Text>
              </ThemedView>

              <ThemedView style={[styles.statCard, { backgroundColor: 'rgba(144, 238, 144, 0.3)' }]}>
                <ThemedText style={styles.statLabel} numberOfLines={1}>Total</ThemedText>
                <Text 
                  style={[styles.statValue, { fontSize: baseFontSize }]} 
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                  maxFontSizeMultiplier={1.2}
                >
                  {totalCount.toString()}
                </Text>
              </ThemedView>
            </ThemedView>

            <TouchableOpacity
              style={[styles.incrementButton, { backgroundColor: tintColor }]}
              onPress={incrementCount}
            >
              <Text 
                style={[styles.buttonText, { color: '#000000', textAlign: 'center' }]} 
                numberOfLines={1}
              >
                Click!
              </Text>
            </TouchableOpacity>

            <ThemedView style={[
              styles.resetContainer,
              isSmallScreen && styles.resetContainerSmall
            ]}>
              <TouchableOpacity 
                style={[
                  styles.resetButton, 
                  { borderColor: tintColor },
                  isSmallScreen && styles.resetButtonSmall
                ]} 
                onPress={resetDailyCount}
              >
                <ThemedText 
                  style={[
                    styles.resetText, 
                    { color: tintColor },
                    isSmallScreen && styles.resetTextSmall
                  ]}
                  numberOfLines={1}
                >
                  Reset Daily
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.resetButton, 
                  { borderColor: tintColor },
                  isSmallScreen && styles.resetButtonSmall
                ]} 
                onPress={resetTotalCount}
              >
                <ThemedText 
                  style={[
                    styles.resetText, 
                    { color: tintColor },
                    isSmallScreen && styles.resetTextSmall
                  ]}
                  numberOfLines={1}
                >
                  Reset Total
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <View style={styles.tipsContainer}>
            <BlurView intensity={90} tint={Platform.OS === 'ios' ? 'default' : 'light'} style={styles.tipsCard}>
              <ThemedText style={styles.tipsTitle} numberOfLines={1}>
                <Ionicons name="bulb-outline" size={18} color="#FFCC00" /> Tip
              </ThemedText>
              <ThemedText style={styles.tipsText} numberOfLines={4}>
                Consistency is key! Aim to speak declarations aloud daily to build new neural pathways.
              </ThemedText>
            </BlurView>
          </View>
        </ThemedView> {/* Closed content wrapper */}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0, // Remove extra top padding
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  content: {
    flex: 1,
    padding: 20,
    width: '100%'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
  scrollContentSmall: {
    padding: 10,
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
    width: '100%',
    minWidth: 300,
  },
  statCard: {
    width: 140,
    height: 120,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  incrementButton: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 220,
    minHeight: 60,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resetContainerSmall: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
  },
  resetButtonSmall: {
    width: '100%',
    marginBottom: 10,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetTextSmall: {
    fontSize: 12,
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