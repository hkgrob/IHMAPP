import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { declarationsData } from '@/constants/DeclarationsData';

export default function DeclarationsScreen() {
  const handleOpenPDF = (fileName: string) => {
    // Replace spaces with underscores to match the file naming convention
    const normalizedFileName = fileName.replace(/\s+/g, '_');

    if (Platform.OS === 'web') {
      // Direct link to PDF file on web
      const baseUrl = window.location.origin;
      const pdfUrl = `${baseUrl}/attached_assets/${normalizedFileName}`;
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
        data={declarationsData}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleOpenPDF(item.fileName)}
          >
            <ThemedText type="subtitle" style={styles.itemTitle}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.itemDescription}>
              {item.description}
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
    fontSize: 24,
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  item: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  itemTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});