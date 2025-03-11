
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet, Platform, Linking } from 'react-native';

export default function PDFViewer() {
  const { id } = useLocalSearchParams();
  const pdfName = id as string;
  
  // If we're on the web, redirect to the PDF file directly
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // Normalize the filename (replace spaces with underscores)
      const normalizedPdfName = pdfName.replace(/\s+/g, '_');
      // Construct the direct URL to the PDF
      const pdfPath = `/attached_assets/${normalizedPdfName}`;
      // Redirect the browser
      window.location.href = pdfPath;
    }
  }, [pdfName]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>
        {Platform.OS === 'web' 
          ? 'Redirecting to PDF...' 
          : 'PDF viewing is only available on web platform'}
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
