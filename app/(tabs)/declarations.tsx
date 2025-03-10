import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { DECLARATION_CATEGORIES } from '@/constants/DeclarationsData';

export default function DeclarationsScreen() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.header}>Daily Declarations</ThemedText>
        <ThemedText style={styles.subheader}>
          Speak these declarations daily to renew your mind and transform your beliefs.
        </ThemedText>

        {DECLARATION_CATEGORIES.map((category) => (
          <ThemedView key={category.id} style={styles.categoryContainer}>
            <TouchableOpacity 
              style={styles.categoryHeader} 
              onPress={() => toggleCategory(category.id)}
            >
              <ThemedView style={styles.categoryTitleContainer}>
                <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                <ThemedText style={styles.categorySource}>Source: {category.source}</ThemedText>
              </ThemedView>
              <Ionicons 
                name={expandedCategory === category.id ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#4A90E2" 
              />
            </TouchableOpacity>

            {expandedCategory === category.id && (
              <ThemedView style={styles.declarationsContainer}>
                {category.declarations.map((declaration, index) => (
                  <ThemedView key={index} style={styles.declarationItem}>
                    <ThemedText style={styles.declarationNumber}>{index + 1}.</ThemedText>
                    <ThemedText style={styles.declarationText}>{declaration}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            )}
          </ThemedView>
        ))}

        <ThemedText style={styles.tip}>
          Tip: Speak these declarations out loud. For best results, repeat them at least 3 times daily.
        </ThemedText>
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
    paddingBottom: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categorySource: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  declarationsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  declarationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    width: 24,
  },
  declarationText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  tip: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});