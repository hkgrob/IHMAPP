import { StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { HelloWave } from '@/components/HelloWave';
import { BlurView } from 'expo-blur';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <HelloWave />
        <ThemedText style={styles.title}>
          Declare Your New Mindset
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your daily declarations
        </ThemedText>

        <ThemedView style={styles.featureGrid}>
          <Link href="/(tabs)/counter" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <ThemedView style={styles.iconContainer}>
                  <Ionicons name="stopwatch-outline" size={32} color="#5AC8FA" />
                </ThemedView>
                <ThemedText style={styles.featureText}>Declaration Counter</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Track your progress
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.chevron} />
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/podcast" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <ThemedView style={styles.iconContainer}>
                  <Ionicons name="mic-outline" size={32} color="#FF9500" />
                </ThemedView>
                <ThemedText style={styles.featureText}>Podcast</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Listen to spiritual teachings
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.chevron} />
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/blog" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <ThemedView style={styles.iconContainer}>
                  <Ionicons name="newspaper-outline" size={32} color="#4CD964" />
                </ThemedView>
                <ThemedText style={styles.featureText}>Blog</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Inspiration for your journey
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.chevron} />
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/declarations" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <ThemedView style={styles.iconContainer}>
                  <Ionicons name="book-outline" size={32} color="#FF2D55" />
                </ThemedView>
                <ThemedText style={styles.featureText}>Daily Declarations</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Speak life over yourself
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.chevron} />
              </BlurView>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/stats" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.featureButtonWrapper}>
              <BlurView intensity={90} style={styles.featureButton} tint="light">
                <ThemedView style={[styles.iconContainer, { backgroundColor: 'rgba(74, 144, 226, 0.2)' }]}>
                  <Ionicons name="stats-chart" size={32} color="#4A90E2" />
                </ThemedView>
                <ThemedText style={styles.featureText}>Statistics</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  View your progress
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" style={styles.chevron} />
              </BlurView>
            </TouchableOpacity>
          </Link>
        </ThemedView>

        <BlurView intensity={80} tint="light" style={styles.card}>
          <ThemedText style={styles.cardTitle}>About Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            Igniting Hope Ministries focuses on helping people renew their minds and transform their beliefs through daily declarations.
          </ThemedText>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://ignitinghope.com')}>
            <ThemedText style={styles.linkText}>Visit our website</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 30,
    color: '#8E8E93',
    fontWeight: '500',
  },
  featureGrid: {
    flexDirection: 'column',
    marginBottom: 30,
  },
  featureButtonWrapper: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureButton: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    paddingRight: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  chevron: {
    position: 'absolute',
    right: 20,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 30,
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
  cardTitle: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3A3A3C',
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
    marginRight: 6,
  },
});