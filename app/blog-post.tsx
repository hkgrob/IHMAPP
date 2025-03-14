
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, SafeAreaView, Platform, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useGlobalSearchParams, Stack, useRouter } from 'expo-router';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

export default function BlogPostScreen() {
  const params = useGlobalSearchParams();
  const { id, title, excerpt, date, imageUrl, link } = params;
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const router = useRouter();

  useEffect(() => {
    fetchBlogContent();
  }, []);

  const fetchBlogContent = async () => {
    try {
      // Import needs to be inside function to avoid circular dependency
      const { fetchBlogContentById } = require('../services/wixBlogService');
      
      // Fetch the blog content using our service
      const blogContent = await fetchBlogContentById(id as string, link as string);
      setContent(blogContent);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog content:', err);
      setError('Failed to load blog content. Please try again later.');
      setLoading(false);
    }
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ 
          headerShown: true,
          title: "Blog Post",
          headerLeft: () => (
            <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
            </TouchableOpacity>
          ),
        }} />
        
        <ScrollView style={styles.scrollView}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0a7ea4" />
              <ThemedText style={styles.loadingText}>Loading blog content...</ThemedText>
            </View>
          ) : (
            <View style={styles.postContainer}>
              <ThemedText style={styles.blogTitle}>{title as string}</ThemedText>
              <ThemedText style={styles.blogDate}>{date as string}</ThemedText>
              
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#0a7ea4" />
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
              ) : (
                <View style={styles.contentContainer}>
                  <ThemedText style={styles.blogContent}>{content}</ThemedText>
                  
                  <TouchableOpacity 
                    style={styles.readMoreButton}
                    onPress={() => Linking.openURL(link as string)}
                  >
                    <ThemedText style={styles.readMoreText}>Read Full Article</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  postContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  blogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  contentContainer: {
    marginTop: 16,
  },
  blogContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 30,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  readMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  webViewContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? 800 : '100%',
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f7',
  },
});
