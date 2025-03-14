
import React from 'react';
import { StyleSheet, ScrollView, View, Platform, Linking, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { NotificationSettings } from '../../components/NotificationSettings';

export default function SettingsScreen() {
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
            <Ionicons name="chatbubble-outline" size={24} color="#0a7ea4" />
            <ThemedText style={styles.sectionTitle}>FEEDBACK</ThemedText>
          </View>
          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>SOUND EFFECTS</ThemedText>
            <View style={styles.toggleContainer}>
              <View style={[styles.toggleOption, styles.toggleActive]}>
                <ThemedText style={styles.toggleText}>On</ThemedText>
              </View>
              <View style={styles.toggleOption}>
                <ThemedText style={styles.toggleText}>Off</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>HAPTIC FEEDBACK</ThemedText>
            <View style={styles.toggleContainer}>
              <View style={[styles.toggleOption, styles.toggleActive]}>
                <ThemedText style={styles.toggleText}>On</ThemedText>
              </View>
              <View style={styles.toggleOption}>
                <ThemedText style={styles.toggleText}>Off</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server-outline" size={24} color="#0a7ea4" />
            <ThemedText style={styles.sectionTitle}>DATA MANAGEMENT</ThemedText>
          </View>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Reset All Data</ThemedText>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#0a7ea4" />
            <ThemedText style={styles.sectionTitle}>ABOUT</ThemedText>
          </View>
          <View style={styles.aboutGrid}>
            <TouchableOpacity style={styles.aboutItem}>
              <Ionicons name="home-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutItemText}>Home</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}>
              <Ionicons name="help-circle-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutItemText}>Help</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}>
              <Ionicons name="document-text-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutItemText}>Privacy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}>
              <Ionicons name="mail-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutItemText}>Contact</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}>
              <Ionicons name="star-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutItemText}>Rate Us</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}>
              <Ionicons name="settings-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.aboutItemText}>App Info</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.versionInfo}>
            <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
            <ThemedText style={styles.copyrightText}>
              © {new Date().getFullYear()} Igniting Hope Ministries
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  toggleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toggleActive: {
    backgroundColor: '#0a7ea4',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: '#ff6b00',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aboutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  aboutItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
  },
  aboutItemText: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  versionInfo: {
    marginTop: 16,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
