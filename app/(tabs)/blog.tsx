import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, View, Image, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fetchWixBlogPosts, BlogPost } from '@/services/wixBlogService';
import { useThemeColor } from '@/hooks/useThemeColor';
import ResponsiveText from '@/components/ResponsiveText';

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
      setLoading(true);
      setRefreshing(true);
      setErrorMessage('Refreshing blog posts...');

      console.log('Clearing blog cache...');
      await AsyncStorage.removeItem('wix_blog_posts');
      await AsyncStorage.removeItem('wix_blog_cache_time');

      await AsyncStorage.getAllKeys()
        .then(keys => {
          const blogKeys = keys.filter(k => k.includes('blog') || k.includes('wix'));
          if (blogKeys.length > 0) {
            return AsyncStorage.multiRemove(blogKeys);
          }
        })
        .catch(err => console.log('Error clearing additional cache:', err));

      console.log('Refreshing blog posts with force reload...');
      setTimeout(async () => {
        try {
          const blogPosts = await fetchWixBlogPosts();
          setPosts(blogPosts);

          if (blogPosts.length > 0 && blogPosts[0].id !== '1') {
            console.log('Showing fresh content after refresh');
            setErrorMessage(null);
            Alert.alert('Success', 'Blog posts updated successfully!');
          } else {
            console.log('Still showing fallback content after refresh');
            setErrorMessage('Could not connect to blog service. Showing fallback content.');
            Alert.alert('Notice', 'Using fallback blog content. Could not fetch latest posts.');
          }
        } catch (error) {
          console.error('Failed in delayed refresh:', error);
          setErrorMessage('Failed to load blog posts. Please try again later.');
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to refresh blog posts:', error);
      Alert.alert('Error', 'Failed to refresh blog posts. Please try again later.');
      setLoading(false);
      setRefreshing(false);
      setErrorMessage('Failed to load blog posts. Please try again later.');
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

      <TouchableOpacity 
        onPress={handleRefresh} 
        style={styles.visibleRefreshButton}
      >
        <Ionicons name="refresh-outline" size={22} color="#fff" />
        <ThemedText style={styles.refreshButtonText}>Refresh Blog</ThemedText>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Igniting Hope Blog</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Inspiration for your journey</ThemedText>
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <ResponsiveText variant="body" style={styles.errorMessage}>{errorMessage}</ResponsiveText>
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
            <ResponsiveText variant="body" style={styles.loadingText}>
              {refreshing ? 'Refreshing posts...' : 'Loading posts...'}
            </ResponsiveText>
          </View>
        ) : (
          <>
            {posts.map(post => (
              <ThemedView key={post.id} style={styles.blogCard}>
                {post.imageUrl && (
                  <Image 
                    source={{ uri: post.imageUrl }} 
                    style={styles.blogImage} 
                    resizeMode="cover"
                  />
                )}
                <ResponsiveText 
                  variant="h3" 
                  style={styles.blogTitle}
                  numberOfLines={0}
                  ellipsizeMode="tail"
                >
                  {typeof post.title === 'string' ? post.title : 'Untitled'}
                </ResponsiveText>
                <ResponsiveText 
                  variant="caption" 
                  style={styles.blogDate}
                  numberOfLines={0}
                >
                  {typeof post.date === 'string' ? post.date : 'No Date'}
                </ResponsiveText>
                <ResponsiveText variant="body" style={styles.blogExcerpt}>{post.excerpt}</ResponsiveText>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => handleOpenBlog(post.link)}
                >
                  <ThemedText style={styles.readMoreText}>Read More</ThemedText>
                  <Ionicons name="arrow-forward" size={16} color="#0066cc" />
                </TouchableOpacity>
              </ThemedView>
            ))}
            {posts.length > 0 && (
              <ResponsiveText variant="caption" style={styles.footerText}>
                Showing {posts.length} posts
              </ResponsiveText>
            )}
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
    alignItems: 'stretch',
    width: '100%',
  },
  headerContainer: {
    width: '100%', // Fixed typo from '100' to '100%'
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    width: '100%',
    flexShrink: 1, // Prevent unnecessary wrapping
    ...(Platform.OS === 'ios' && {
      lineHeight: 28, // Ensure proper line height on iOS
      fontFamily: 'System', // Use system font to avoid rendering issues
    }),
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    width: '100%',
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
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
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
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
    ...(Platform.OS === 'ios' && {
      lineHeight: 24,
      fontFamily: 'System',
    }),
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
    ...(Platform.OS === 'ios' && {
      lineHeight: 18,
      fontFamily: 'System',
    }),
  },
  blogExcerpt: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    flexWrap: 'wrap',
    ...(Platform.OS === 'ios' && {
      flexShrink: 1,
      width: '100%',
    }),
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
    marginTop: 8,
  },
  visibleRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 8,
    margin: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
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
  },
});