import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, View, Image, Alert, Platform, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fetchWixBlogPosts, BlogPost } from '@/services/wixBlogService';
import { useThemeColor } from '@/hooks/useThemeColor';
import ResponsiveText from '@/components/ResponsiveText';
import { LinearGradient } from 'expo-linear-gradient';

export default function BlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'cardBackground');

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

      const blogPosts = await fetchWixBlogPosts();
      setPosts(blogPosts);

      if (blogPosts.length === 4 && blogPosts[0].id === '1') {
        setErrorMessage('Could not connect to blog service. Showing fallback content.');
      } else {
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Failed to refresh blog posts:', error);
      setErrorMessage('Failed to refresh blog posts. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  // Get the status bar height for iOS
  const statusBarHeight = Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen 
          options={{ 
            title: 'Blog',
            headerStyle: {
              height: 0, // Minimize the default header height
            },
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

        <View style={[styles.headerContainer, { paddingTop: Platform.OS === 'ios' ? statusBarHeight + 10 : 10 }]}>
          <ThemedText style={styles.headerTitle}>Igniting Hope Blog</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Inspiration for your journey</ThemedText>
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
            {!errorMessage.includes('Refreshing') && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Ionicons name="refresh-outline" size={16} color="#0066cc" />
                <ThemedText style={styles.retryText}>Retry</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0a7ea4"]}
              tintColor="#0a7ea4"
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0a7ea4" />
              <ThemedText style={styles.loadingText}>
                Loading posts...
              </ThemedText>
            </View>
          ) : (
            <>
              {posts.map((post, index) => (
                <TouchableOpacity 
                  key={post.id} 
                  style={[styles.blogCard, { backgroundColor: cardBackground }]}
                  activeOpacity={0.9}
                  onPress={() => handleOpenBlog(post.link)}
                >
                  {post.imageUrl ? (
                    <Image 
                      source={{ uri: post.imageUrl }} 
                      style={styles.blogImage} 
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={['#0a7ea4', '#64b5d9']}
                      style={styles.blogImagePlaceholder}
                    >
                      <Ionicons name="newspaper" size={42} color="#fff" />
                    </LinearGradient>
                  )}

                  <View style={styles.blogMeta}>
                    {index < 2 && (
                      <View style={styles.newPostBadge}>
                        <ThemedText style={styles.newPostText}>NEW</ThemedText>
                      </View>
                    )}
                    <ThemedText style={styles.blogDate}>
                      {typeof post.date === 'string' ? post.date : 'No Date'}
                    </ThemedText>
                  </View>

                  <ThemedText 
                    style={styles.blogTitle}
                    numberOfLines={2}
                  >
                    {post.title}
                  </ThemedText>

                  <ThemedText 
                    style={styles.blogExcerpt}
                    numberOfLines={3}
                  >
                    {post.excerpt}
                  </ThemedText>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.readMoreButton}>
                      <ThemedText style={styles.readMoreText}>Read more</ThemedText>
                      <Ionicons name="arrow-forward" size={16} color="#0a7ea4" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {posts.length > 0 && (
                <ThemedText style={styles.footerText}>
                  Visit our website for more articles
                </ThemedText>
              )}
            </>
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
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0, // Ensure SafeAreaView doesn't add extra padding on iOS
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 35 : 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
    width: '100%',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    width: '100%', // Ensure text takes full width for centering
  },
  loaderContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    color: '#0a7ea4',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  retryText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#0066cc',
  },
  refreshButton: {
    padding: 8,
  },
  blogCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  blogImage: {
    width: '100%',
    height: 60,
  },
  blogImagePlaceholder: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  newPostBadge: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  newPostText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  blogExcerpt: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    opacity: 0.8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    color: '#0a7ea4',
    marginRight: 4,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    marginBottom: 16,
  },
  visibleRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
});