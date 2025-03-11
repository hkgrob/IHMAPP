
import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Platform, Linking, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { DECLARATION_CATEGORIES } from '@/constants/DeclarationsData';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function DeclarationsScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleDownload = async (filename: string) => {
    try {
      if (Platform.OS === 'web') {
        // For web, directly open the PDF in a new tab
        const encodedFilename = encodeURIComponent(filename);
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/attached_assets/${encodedFilename}`;
        console.log('Opening PDF at path:', fullUrl);
        window.open(fullUrl, '_blank');
      } else {
        // For mobile platforms, use Sharing API
        const fileUri = FileSystem.documentDirectory + filename;
        const downloadResumable = FileSystem.createDownloadResumable(
          `${FileSystem.documentDirectory}attached_assets/${filename}`,
          fileUri
        );
        
        try {
          const { uri } = await downloadResumable.downloadAsync();
          if (uri) {
            await Sharing.shareAsync(uri);
          }
        } catch (error) {
          console.error('Error downloading file:', error);
          Alert.alert('Download Error', 'Failed to download the file. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error handling download:', error);
      Alert.alert('Error', 'An error occurred while trying to open the file.');
    }
  };

  const renderCategory = useCallback(({ item }) => {
    const isExpanded = expandedSection === item.id;
    
    return (
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleExpanded(item.id)}
          style={styles.categoryHeader}
        >
          <BlurView intensity={80} tint="light" style={styles.categoryHeaderBlur}>
            <ThemedText style={styles.categoryTitle}>{item.title}</ThemedText>
            <View style={styles.categoryHeaderRight}>
              {item.source && (
                <TouchableOpacity
                  onPress={() => item.source && handleDownload(item.source)}
                  style={styles.downloadButton}
                >
                  <Ionicons name="document-text-outline" size={20} color="#007AFF" />
                  <ThemedText style={styles.downloadText}>PDF</ThemedText>
                </TouchableOpacity>
              )}
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#8E8E93"
              />
            </View>
          </BlurView>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.declarationsList}>
            {item.declarations && item.declarations.map((declaration, index) => (
              <View key={index} style={styles.declarationItem}>
                <ThemedText style={styles.declarationText}>{declaration}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }, [expandedSection]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>Declarations</ThemedText>
      <ThemedText style={styles.subheader}>
        Speak these declarations to renew your mind
      </ThemedText>

      <FlatList
        data={DECLARATION_CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  listContainer: {
    paddingBottom: 100,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryHeader: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryHeaderBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  downloadText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
  },
  declarationsList: {
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    padding: 16,
  },
  declarationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  declarationText: {
    fontSize: 16,
    lineHeight: 22,
  },
});
