import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { Link, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header Spacer */}
          <View style={styles.headerSpacer} />

          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <ThemedText style={styles.welcomeText}>
              Welcome to your journey of transformation
            </ThemedText>
          </View>

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            <FeatureButton 
              title="Declarations" 
              description="Daily affirmations"
              icon="document-text-outline"
              route="/(tabs)/declarations"
              color="#4A90E2"
            />

            <FeatureButton 
              title="Counter" 
              description="Track your progress"
              icon="stopwatch-outline"
              route="/(tabs)/counter"
              color="#50E3C2"
            />

            <FeatureButton 
              title="Blog" 
              description="Latest insights"
              icon="newspaper-outline"
              route="/(tabs)/blog"
              color="#F5A623"
            />

            <FeatureButton 
              title="Podcasts" 
              description="Listen & grow"
              icon="headset-outline"
              route="/(tabs)/podcast"
              color="#D87BFD"
            />
          </View>

          {/* Quote of the Day */}
          <View style={styles.quoteContainer}>
            <View style={styles.quoteIconContainer}>
              <Ionicons name="quote" size={24} color={tintColor} />
            </View>
            <ThemedText style={styles.quoteText}>
              "Your beliefs become your thoughts, your thoughts become your words, your words become your actions."
            </ThemedText>
            <ThemedText style={styles.quoteAuthor}>
              — Daily Inspiration
            </ThemedText>
          </View>

          {/* Getting Started Section */}
          <View style={styles.gettingStartedContainer}>
            <ThemedText style={styles.sectionTitle}>Getting Started</ThemedText>
            <TouchableOpacity 
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <ThemedText style={styles.startButtonText}>
                Begin Your Journey
              </ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>

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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  safeArea: {
    flex: 1,
  },
  headerSpacer: {
    height: Platform.OS === 'android' ? 30 : 10,
  },
  welcomeBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFA50020',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  featureGrid: {
    paddingHorizontal: 20,
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
    padding: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  quoteContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
  },
  quoteIconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: 'right',
    opacity: 0.7,
  },
  gettingStartedContainer: {
    margin: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  }
});