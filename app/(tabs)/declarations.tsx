import React, { useState } from 'react';
import { StyleSheet, View, Platform,  ScrollView, Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { DECLARATION_CATEGORIES } from '@/constants/DeclarationsData';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function DeclarationsScreen() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };


  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.screenTitle}>Declarations</ThemedText>
        <ThemedText style={styles.description}>
          Daily declarations to strengthen your faith and renew your mind.
          Tap on a category to view declarations.
        </ThemedText>

        {DECLARATION_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <Pressable
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
            >
              <View style={styles.headerContent}>
                <ThemedText type="subtitle" style={styles.categoryTitle}>
                  {category.title}
                </ThemedText>
                <View style={styles.headerActions}>
                  <Ionicons
                    name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#999"
                  />
                </View>
              </View>
            </Pressable>

            {expandedCategory === category.id && (
              <View style={styles.declarationsList}>
                {category.declarations.map((declaration, index) => (
                  <View key={index} style={styles.declarationItem}>
                    <ThemedText style={styles.bullet}>•</ThemedText>
                    <ThemedText style={styles.declarationText}>{declaration}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}


      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.8,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryHeader: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  declarationsList: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f8f8f8',
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 4,
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
  },
  declarationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },

});