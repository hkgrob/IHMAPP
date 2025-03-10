
import React from 'react';
import { StyleSheet, Image, ScrollView, Linking, View } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const dailyThought = {
    text: "What you believe is what you become. Transform your mind and you'll transform your life.",
    author: "Igniting Hope Ministries"
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <ThemedText style={styles.title}>Igniting Hope Ministries</ThemedText>
          <ThemedText style={styles.subtitle}>Mind Renewal & Beliefs</ThemedText>
        </View>
        
        <ThemedView style={styles.card}>
          <ThemedText style={styles.cardTitle}>Daily Thought</ThemedText>
          <ThemedText style={styles.quote}>"{dailyThought.text}"</ThemedText>
          <ThemedText style={styles.author}>- {dailyThought.author}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.featuresContainer}>
          <Link href="/(tabs)/declarations" asChild>
            <ThemedView style={styles.featureButton}>
              <Ionicons name="document-text" size={28} color="#4A90E2" />
              <ThemedText style={styles.featureText}>Declarations</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Daily declarations to renew your mind
              </ThemedText>
            </ThemedView>
          </Link>
          
          <Link href="/(tabs)/counter" asChild>
            <ThemedView style={styles.featureButton}>
              <Ionicons name="add-circle" size={28} color="#4A90E2" />
              <ThemedText style={styles.featureText}>Tally Counter</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Track your daily declarations
              </ThemedText>
            </ThemedView>
          </Link>
          
          <Link href="/(tabs)/stats" asChild>
            <ThemedView style={styles.featureButton}>
              <Ionicons name="stats-chart" size={28} color="#4A90E2" />
              <ThemedText style={styles.featureText}>Statistics</ThemedText>
              <ThemedText style={styles.featureDescription}>
                View your progress over time
              </ThemedText>
            </ThemedView>
          </Link>
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <ThemedText style={styles.cardTitle}>About Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            Igniting Hope Ministries focuses on helping people renew their minds and transform their beliefs.
          </ThemedText>
          <ThemedText 
            style={styles.link}
            onPress={() => Linking.openURL('https://ignitinghope.com')}>
            Visit our website →
          </ThemedText>
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 24,
  },
  author: {
    fontSize: 14,
    textAlign: 'right',
    opacity: 0.8,
  },
  featuresContainer: {
    marginVertical: 12,
  },
  featureButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  link: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 8,
  },
});
