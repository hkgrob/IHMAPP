
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Linking, StyleSheet, Platform } from 'react-native';

export default function PDFViewer() {
  const { id } = useLocalSearchParams();
  const pdfName = id as string;

  // If we're on the web, redirect to the PDF file directly
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const normalizedPdfName = pdfName.replace(/\s+/g, '_');
      const pdfPath = `/attached_assets/${normalizedPdfName}`;
      window.location.href = pdfPath;
    }
  }, [pdfName]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>
        {Platform.OS === 'web' 
          ? 'Redirecting to PDF...' 
          : 'Please view this PDF on web platform'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
