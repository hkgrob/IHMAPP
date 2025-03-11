
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, View, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fetchWixBlogPosts, BlogPost } from '@/services/wixBlogService';

export default function BlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const blogPosts = await fetchWixBlogPosts();
      setPosts(blogPosts);
      
      // Check if we're showing fallback data
      if (blogPosts.length === 4 && blogPosts[0].id === '1') {
        console.log('Showing fallback content');
        setErrorMessage('Could not connect to blog service. Showing fallback content.');
      } else {
        console.log('Successfully loaded blog posts');
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      setErrorMessage('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBlog = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open the blog post.');
    });
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setErrorMessage(null);

      // Clear the cache
      console.log('Clearing blog cache...');
      await AsyncStorage.removeItem('wix_blog_posts');
      await AsyncStorage.removeItem('wix_blog_cache_time');
      
      // Reload the posts
      console.log('Refreshing blog posts...');
      const blogPosts = await fetchWixBlogPosts();
      console.log(`Received ${blogPosts.length} posts after refresh`);

      setPosts(blogPosts);

      // Check if we're still showing fallback data
      if (blogPosts.length === 4 && blogPosts[0].id === '1') {
        console.log('Still showing fallback content after refresh');
        setErrorMessage('Could not connect to blog service. Showing fallback content.');
        Alert.alert('Warning', 'Could not fetch live blog posts. Showing fallback content.');
      } else {
        console.log('Successfully refreshed to live blog posts');
        setErrorMessage(null);
        Alert.alert('Success', 'Blog posts refreshed successfully!');
      }
    } catch (error) {
      console.error('Failed to refresh blog posts:', error);
      setErrorMessage('Failed to refresh blog posts. Please try again later.');
      Alert.alert('Error', 'Failed to refresh blog posts. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Blog',
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={styles.refreshButton}
              disabled={refreshing}
            >
              <Ionicons 
                name={refreshing ? "refresh-circle" : "refresh"} 
                size={24} 
                color="#0066cc" 
              />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.headerTitle}>Igniting Hope Blog</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Inspiration for your journey</ThemedText>
        
        {errorMessage && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <ThemedText style={styles.retryText}>Retry</ThemedText>
              <Ionicons name="reload" size={16} color="#0066cc" />
            </TouchableOpacity>
          </View>
        )}

        {(loading || refreshing) ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <ThemedText style={styles.loadingText}>
              {refreshing ? 'Refreshing posts...' : 'Loading posts...'}
            </ThemedText>
          </View>
        ) : (
          <>
            {posts.map(post => (
              <View key={post.id} style={styles.blogCard}>
                {post.imageUrl && (
                  <Image 
                    source={{ uri: post.imageUrl }} 
                    style={styles.blogImage} 
                    resizeMode="cover"
                  />
                )}
                <ThemedText style={styles.blogTitle}>{post.title}</ThemedText>
                <ThemedText style={styles.blogDate}>{post.date}</ThemedText>
                <ThemedText style={styles.blogExcerpt}>{post.excerpt}</ThemedText>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => handleOpenBlog(post.link)}
                >
                  <ThemedText style={styles.readMoreText}>Read More</ThemedText>
                  <Ionicons name="arrow-forward" size={16} color="#0066cc" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  loaderContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  blogCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  blogImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    color: '#0066cc',
    marginRight: 4,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  errorContainer: {
    backgroundColor: '#fff8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffccd5',
  },
  errorMessage: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  retryText: {
    color: '#0066cc',
    marginRight: 4,
  }
});
