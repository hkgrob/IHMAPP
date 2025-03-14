import React from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, Platform, Linking, StatusBar as RNStatusBar } from 'react-native';
import { Link, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;
const paddingHorizontal = width * 0.05;
const scaleFontSize = (size) => Math.round(size * (width / 375));

// Get the status bar height for proper spacing
const STATUSBAR_HEIGHT = RNStatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

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
            <FeatureButton 
              title="Counter" 
              description="Track your progress"
              icon="stopwatch-outline"
              route="/(tabs)/counter"
              color="#50E3C2"
            />

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
});