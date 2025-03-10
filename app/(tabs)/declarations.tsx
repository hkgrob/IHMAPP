import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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

  const handleDownload = (filename: string) => {
    // For the web platform, we need to use the actual file path
    const pdfPath = `/attached_assets/${filename}`;
    Linking.openURL(pdfPath);

    // Log for debugging
    console.log('Opening PDF at path:', pdfPath);
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
            <TouchableOpacity style={styles.categoryHeaderContainer}>
              <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleCategory(category.id)}>
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
              <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(category.source)}>
                <Ionicons name="download-outline" size={16} color="#FF9500" />
                <ThemedText style={styles.downloadText}>Download PDF</ThemedText>
              </TouchableOpacity>
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
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.8,
  },
  tip: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  categoryContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categorySource: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 16,
  },
  downloadText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#FF9500',
    fontWeight: '600',
  },
  declarationsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  declarationNumber: {
    minWidth: 30,
    fontWeight: '600',
  },
  declarationText: {
    flex: 1,
    lineHeight: 22,
  },
});