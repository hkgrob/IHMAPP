import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ScrollView, Dimensions, Platform, Linking } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ResponsiveText from '@/components/ResponsiveText';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function HomeScreen() {
  const backgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background });
  const cardBackgroundColor = useThemeColor({ light: Colors.light.cardBackground, dark: Colors.dark.cardBackground });
  const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text });

  return (
    <>
      <Stack.Screen options={{ 
        headerShown: false,
      }} />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header Spacer */}
          <View style={styles.headerSpacer} />

          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <ResponsiveText variant="h1" style={styles.welcomeTitle}>
              Welcome to Igniting Hope
            </ResponsiveText>
            <ResponsiveText variant="body" style={styles.welcomeText}>
              Discover resources to empower your spiritual journey
            </ResponsiveText>
          </View>

          {/* Declarations Section */}
          <View style={styles.section}>
            <ResponsiveText variant="h2" style={styles.sectionTitle}>Daily Declarations</ResponsiveText>
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: cardBackgroundColor }]}
              onPress={() => {
                Link.push('/declarations');
              }}
            >
              <View style={styles.cardContent}>
                <Ionicons name="document-text-outline" size={28} color="#0066cc" />
                <View style={styles.cardTextContainer}>
                  <ResponsiveText variant="h3" style={styles.cardTitle}>
                    Daily Declarations
                  </ResponsiveText>
                  <ResponsiveText variant="body" style={styles.cardDescription}>
                    Start your day with powerful declarations
                  </ResponsiveText>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#0066cc" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Blog Section */}
          <View style={styles.section}>
            <ResponsiveText variant="h2" style={styles.sectionTitle}>Latest Blog Posts</ResponsiveText>
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: cardBackgroundColor }]}
              onPress={() => {
                Link.push('/blog');
              }}
            >
              <View style={styles.cardContent}>
                <Ionicons name="newspaper-outline" size={28} color="#0066cc" />
                <View style={styles.cardTextContainer}>
                  <ResponsiveText variant="h3" style={styles.cardTitle}>
                    Blog
                  </ResponsiveText>
                  <ResponsiveText variant="body" style={styles.cardDescription}>
                    Read the latest articles and updates
                  </ResponsiveText>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#0066cc" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Podcast Section */}
          <View style={styles.section}>
            <ResponsiveText variant="h2" style={styles.sectionTitle}>Podcast Episodes</ResponsiveText>
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: cardBackgroundColor }]}
              onPress={() => {
                Link.push('/podcast');
              }}
            >
              <View style={styles.cardContent}>
                <Ionicons name="mic-outline" size={28} color="#0066cc" />
                <View style={styles.cardTextContainer}>
                  <ResponsiveText variant="h3" style={styles.cardTitle}>
                    Podcast
                  </ResponsiveText>
                  <ResponsiveText variant="body" style={styles.cardDescription}>
                    Listen to our latest podcast episodes
                  </ResponsiveText>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#0066cc" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <ResponsiveText variant="h2" style={styles.sectionTitle}>Connect With Us</ResponsiveText>
            <View style={styles.socialLinksContainer}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: cardBackgroundColor }]}
                onPress={() => Linking.openURL('https://facebook.com/ignitinghope')}
              >
                <Ionicons name="logo-facebook" size={28} color="#0066cc" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: cardBackgroundColor }]}
                onPress={() => Linking.openURL('https://instagram.com/ignitinghope')}
              >
                <Ionicons name="logo-instagram" size={28} color="#0066cc" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: cardBackgroundColor }]}
                onPress={() => Linking.openURL('https://twitter.com/ignitinghope')}
              >
                <Ionicons name="logo-twitter" size={28} color="#0066cc" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: cardBackgroundColor }]}
                onPress={() => Linking.openURL('https://youtube.com/ignitinghope')}
              >
                <Ionicons name="logo-youtube" size={28} color="#0066cc" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: cardBackgroundColor }]}
              onPress={() => {
                Link.push('/settings');
              }}
            >
              <View style={styles.cardContent}>
                <Ionicons name="settings-outline" size={28} color="#0066cc" />
                <View style={styles.cardTextContainer}>
                  <ResponsiveText variant="h3" style={styles.cardTitle}>
                    Settings
                  </ResponsiveText>
                  <ResponsiveText variant="body" style={styles.cardDescription}>
                    Customize your app experience
                  </ResponsiveText>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#0066cc" />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
    marginVertical: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#0066cc',
  },
  welcomeTitle: {
    color: '#ffffff',
    marginBottom: 10,
  },
  welcomeText: {
    color: '#ffffff',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: '600',
  },
  card: {
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontWeight: '600',
  },
  cardDescription: {
    marginTop: 4,
    opacity: 0.7,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});