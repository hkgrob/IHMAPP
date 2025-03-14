import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, Platform, Linking, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;
const paddingHorizontal = width * 0.05;
const scaleFontSize = (size) => Math.round(size * (width / 375));

// Get the status bar height for proper spacing
const STATUSBAR_HEIGHT = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

const Counter = () => {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sound, setSound] = useState();
  const colorScheme = useColorScheme();
  const buttonColor = colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  useEffect(() => {
    loadCounts();
    loadSound();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/click.mp3'));
      setSound(sound);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const loadCounts = async () => {
    try {
      const storedDailyCount = await AsyncStorage.getItem('dailyCount');
      const storedTotalCount = await AsyncStorage.getItem('totalCount');
      const storedLastReset = await AsyncStorage.getItem('lastReset');

      if (storedTotalCount) setTotalCount(parseInt(storedTotalCount, 10));

      if (storedLastReset) {
        const lastResetDate = new Date(storedLastReset);
        const today = new Date();

        if (today.toDateString() !== lastResetDate.toDateString()) {
          setDailyCount(0);
          await AsyncStorage.setItem('lastReset', today.toString());
          await AsyncStorage.setItem('dailyCount', '0');
        } else if (storedDailyCount) {
          setDailyCount(parseInt(storedDailyCount, 10));
        }
      } else {
        await AsyncStorage.setItem('lastReset', new Date().toString());
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const incrementCounter = async () => {
    try {
      const soundEnabled = await AsyncStorage.getItem('soundEnabled');
      const hapticEnabled = await AsyncStorage.getItem('hapticEnabled');

      if (soundEnabled !== 'false' && sound) {
        await sound.replayAsync();
      }

      if (hapticEnabled !== 'false' && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const newDailyCount = dailyCount + 1;
      const newTotalCount = totalCount + 1;

      setDailyCount(newDailyCount);
      setTotalCount(newTotalCount);

      await AsyncStorage.setItem('dailyCount', newDailyCount.toString());
      await AsyncStorage.setItem('totalCount', newTotalCount.toString());
    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.countButton, { backgroundColor: buttonColor }]}
      onPress={incrementCounter}
    >
      <Text style={styles.buttonText}>Click to declare</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const [count, setCount] = useState(0);
  const [sound, setSound] = useState();

  useEffect(() => {
    const loadCount = async () => {
      try {
        const storedCount = await AsyncStorage.getItem('counter');
        if (storedCount !== null) {
          setCount(parseInt(storedCount));
        }
      } catch (e) {
        console.error("Error loading count:", e);
      }
    };
    loadCount();
  }, []);

  useEffect(() => {
    const saveCount = async () => {
      try {
        await AsyncStorage.setItem('counter', count.toString());
      } catch (e) {
        console.error("Error saving count:", e);
      }
    };
    saveCount();
  }, [count]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePress = async () => {
    try {
      const soundEnabled = await AsyncStorage.getItem('soundEnabled');
      const hapticEnabled = await AsyncStorage.getItem('hapticEnabled');

      if (soundEnabled !== 'false' && sound) {
        await sound.replayAsync();
      }

      if (hapticEnabled !== 'false' && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const storedDailyCount = await AsyncStorage.getItem('dailyCount') || '0';
      const storedTotalCount = await AsyncStorage.getItem('totalCount') || '0';
      const storedLastReset = await AsyncStorage.getItem('lastReset');

      const now = new Date();
      const lastReset = storedLastReset ? new Date(storedLastReset) : now;

      const newDailyCount = parseInt(storedDailyCount, 10) + 1;
      const newTotalCount = parseInt(storedTotalCount, 10) + 1;

      if (now.toDateString() !== lastReset.toDateString()) {
        await AsyncStorage.multiSet([
          ['dailyCount', '1'],
          ['totalCount', newTotalCount.toString()],
          ['lastReset', now.toString()]
        ]);
      } else {
        await AsyncStorage.multiSet([
          ['dailyCount', newDailyCount.toString()],
          ['totalCount', newTotalCount.toString()],
          ['lastReset', lastReset.toString()]
        ]);
      }
    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/click.mp3') // Replace with your sound file
      );
      setSound(sound);
    })();
  }, []);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* SafeAreaView for content, but allow background to stretch to edges */}
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Spacer */}
          <View style={[styles.headerSpacer, { height: STATUSBAR_HEIGHT }]} />

          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <ThemedText style={styles.welcomeText}>
              Welcome to your journey of transformation
            </ThemedText>
          </View>

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            <TouchableOpacity
              onPress={handlePress}
              style={[styles.countButton, { backgroundColor: '#0a7ea4' }]}
            >
              <Ionicons name="stopwatch-outline" size={32} color="white" />
              <Text style={[styles.buttonText, { fontSize: 16 }]}>Click to Declare</Text>
            </TouchableOpacity>

            <FeatureButton
              title="Podcasts"
              description="Listen & grow"
              icon="headset-outline"
              route="/(tabs)/podcast"
              color="#D87BFD"
            />

            <FeatureButton
              title="Blog"
              description="Latest insights"
              icon="newspaper-outline"
              route="/(tabs)/blog"
              color="#F5A623"
            />

            <FeatureButton
              title="Declarations"
              description="Daily affirmations"
              icon="document-text-outline"
              route="/(tabs)/declarations"
              color="#4A90E2"
            />
          </View>

          {/* Getting Started Section */}
          <View style={styles.gettingStartedContainer}>
            <ThemedText style={styles.sectionTitle}>Visit our website</ThemedText>
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://ignitinghope.com')}
            >
              <ThemedText style={styles.startButtonText}>
                Ignitinghope.com
              </ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <StatusBar style="auto" />
    </ThemedView>
  );
}

// Feature Button Component
function FeatureButton({ title, description, icon, route, color }) {
  return (
    <Link href={route} asChild>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.featureButtonWrapper}
      >
        <BlurView intensity={90} style={styles.featureButton} tint="light">
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={28} color={color} />
          </View>
          <View style={styles.featureTextContainer}>
            <ThemedText style={styles.featureTitle}>{title}</ThemedText>
            <ThemedText style={styles.featureDescription}>{description}</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </BlurView>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  countButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',
  },
  headerSpacer: {
    // Use dynamic status bar height
    height: STATUSBAR_HEIGHT,
  },
  welcomeBanner: {
    marginHorizontal: paddingHorizontal,
    marginTop: 10,
    marginBottom: 25,
    padding: paddingHorizontal,
    borderRadius: 15,
    backgroundColor: '#FFA50020',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: scaleFontSize(18),
    fontWeight: '500',
    textAlign: 'center',
  },
  featureGrid: {
    paddingHorizontal: paddingHorizontal,
    marginBottom: 25,
  },
  featureButtonWrapper: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallScreen ? 10 : 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  iconContainer: {
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: scaleFontSize(14),
    opacity: 0.7,
  },
  gettingStartedContainer: {
    margin: paddingHorizontal,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: isSmallScreen ? 8 : 12,
    paddingHorizontal: paddingHorizontal,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginRight: 8,
  },
  clickerButtonWrapper: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  clickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallScreen ? 10 : 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#50E3C2'
  },
  clickerButtonText: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: 'white',
    textAlign: 'center'
  },
  countButton: {
    marginBottom: 16,
    borderRadius: 15,
    padding: isSmallScreen ? 10 : 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: 'white',
    textAlign: 'center'
  }
});