import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Linking, StyleSheet, Platform } from 'react-native';

// This route handles PDF display for both web and mobile environments
export default function PDFViewer() {
  const { id } = useLocalSearchParams();
  const pdfName = id as string;
  
  // If we're on the web, redirect to the PDF file directly
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const pdfPath = `/attached_assets/${pdfName}`;
      window.location.href = pdfPath;
    }
  }, [pdfName]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Loading PDF...</ThemedText>
      {Platform.OS !== 'web' && (
        <ThemedText 
          type="link" 
          style={styles.link}
          onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_API_URL}/attached_assets/${pdfName}`)}
        >
          Open PDF Externally
        </ThemedText>
      )}
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
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});