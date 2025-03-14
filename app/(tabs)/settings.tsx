import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/ThemedText';
import { NotificationSettings } from '../../components/NotificationSettings';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  settingsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#ffeeee',
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
  },
});

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsSection}>
        <View style={styles.settingHeader}>
          <Ionicons name="notifications-outline" size={24} color="#0a7ea4" />
          <ThemedText style={styles.settingSectionTitle}>Notifications</ThemedText>
        </View>
        <NotificationSettings />
      </View>
    </ScrollView>
  );
}