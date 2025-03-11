
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { DECLARATION_CATEGORIES } from '@/constants/DeclarationsData';

export default function DeclarationsScreen() {
  const handleOpenPDF = (filename: string) => {
    // Direct link to PDF file on web
    if (Platform.OS === 'web') {
      const baseUrl = window.location.origin;
      const pdfUrl = `${baseUrl}/attached_assets/${filename}`;
      console.log("Opening PDF directly:", pdfUrl);
      window.open(pdfUrl, '_blank');
    } else {
      // On native, we can't display PDFs directly
      console.log("PDFs can only be viewed on web platform");
      alert("Please use the web version to view PDFs");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Declarations</ThemedText>
      <ThemedText style={styles.description}>
        Select a declaration to view or download the PDF.
      </ThemedText>

      <FlatList
        data={DECLARATION_CATEGORIES}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleOpenPDF(item.source)}
          >
            <ThemedText type="subtitle" style={styles.itemTitle}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.itemDescription}>
              {item.declarations.length} declarations
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    opacity: 0.7,
  },
});
