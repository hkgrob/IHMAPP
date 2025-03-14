
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
              <View style={styles.headerContainer}>
                <ThemedText style={styles.blogTitle}>{title as string}</ThemedText>
                <ThemedText style={styles.blogDate}>{date as string}</ThemedText>
              </View>
              
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#0a7ea4" />
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.readMoreButton, { marginTop: 20 }]}
                      onPress={loadBlogContent}
                    >
                      <ThemedText style={styles.readMoreText}>Try Again</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.readMoreButton, { marginTop: 20, marginLeft: 10 }]}
                      onPress={() => Linking.openURL(link as string)}
                    >
                      <ThemedText style={styles.readMoreText}>View on Website</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : content.includes("We couldn't fetch the full content") ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="newspaper-outline" size={48} color="#0a7ea4" />
                  <ThemedText style={styles.errorText}>{content}</ThemedText>
                  <TouchableOpacity 
                    style={[styles.readMoreButton, { marginTop: 20 }]}
                    onPress={() => Linking.openURL(link as string)}
                  >
                    <ThemedText style={styles.readMoreText}>Read on Website</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.contentContainer}>
                  <ThemedText style={styles.blogContent}>
                    {content.split('\n\n').map((paragraph, index) => (
                      paragraph.trim() ? (
                        <ThemedText key={index} style={styles.paragraph}>
                          {paragraph.trim()}
                        </ThemedText>
                      ) : null
                    ))}
                  </ThemedText>
                  
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
  headerContainer: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 16,
  },
  blogTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 34,
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.7,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  contentContainer: {
    marginTop: 16,
  },
  blogContent: {
    fontSize: 17,
    lineHeight: 28,
  },
  paragraph: {
    marginBottom: 16,
  },
  readMoreButton: {
    marginTop: 40,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  readMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
});
