import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, SafeAreaView, Platform, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useGlobalSearchParams, Stack, useRouter } from 'expo-router';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { fetchBlogContentById } from '../services/wixBlogService';

export default function BlogPostScreen() {
  const params = useGlobalSearchParams();
  const { id, title, date, link } = params;
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadBlogContent();
  }, []);

  const loadBlogContent = async () => {
    try {
      setLoading(true);
      const blogContent = await fetchBlogContentById(id as string, link as string);
      setContent(blogContent);
      setError(null);
    } catch (err) {
      console.error('Error fetching blog content:', err);
      setError('Failed to load blog content. Please try again later.');
    } finally {
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
                  <Ionicons name="newspaper-outline" size={48} color="#0a7ea4" />
                  <ThemedText style={styles.errorText}>
                    {error}
                  </ThemedText>

                  <View style={styles.infoContainer}>
                    <ThemedText style={styles.infoText}>
                      You can read the complete article on our website.
                    </ThemedText>
                  </View>

                  <TouchableOpacity 
                    style={[styles.readMoreButton, { marginTop: 20 }]}
                    onPress={() => Linking.openURL(link as string)}
                  >
                    <ThemedText style={styles.readMoreText}>Open in Browser</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.contentContainer}>
                  {content.split('\n\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <ThemedText key={index} style={styles.blogParagraph}>
                        {paragraph.trim()}
                      </ThemedText>
                    ) : null
                  ))}

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
  blogParagraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
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
  infoContainer: {
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  }
});