import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Platform, Linking, TouchableOpacity, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { NotificationSettings } from '../../components/NotificationSettings';

export default function SettingsScreen() {
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState(true);

  const openEmail = () => {
    Linking.openURL('mailto:info@ignitinghope.com?subject=App%20Feedback');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.ignitinghope.com/privacy-policy');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen options={{
        title: 'Settings',
        headerShown: false,
      }} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Settings</ThemedText>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={24} color="#0a7ea4" />
            <ThemedText style={styles.sectionTitle}>NOTIFICATIONS</ThemedText>
          </View>
          <NotificationSettings />
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#0a7ea4" />
            <ThemedText style={styles.sectionTitle}>FEEDBACK</ThemedText>
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>SOUND EFFECTS</ThemedText>
            <Switch
              value={soundEffectsEnabled}
              onValueChange={setSoundEffectsEnabled}
              trackColor={{ false: '#767577', true: '#0a7ea4' }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>HAPTIC FEEDBACK</ThemedText>
            <Switch
              value={hapticFeedbackEnabled}
              onValueChange={setHapticFeedbackEnabled}
              trackColor={{ false: '#767577', true: '#0a7ea4' }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#0a7ea4" />
            <ThemedText style={styles.sectionTitle}>ABOUT</ThemedText>
          </View>

          <View style={styles.aboutLinks}>
            <TouchableOpacity style={styles.aboutLink} onPress={openEmail}>
              <Ionicons name="mail-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutLinkText}>Contact Us</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.aboutLink} onPress={openPrivacyPolicy}>
              <Ionicons name="document-text-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutLinkText}>Privacy Policy</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#0a7ea4',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  aboutLinks: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  aboutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutLinkText: {
    marginLeft: 15,
    fontSize: 16,
  },
});