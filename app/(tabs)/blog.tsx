
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
import { LinearGradient } from 'expo-linear-gradient';

export default function BlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

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
      setLoading(false);
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

      <LinearGradient
        colors={['rgba(245, 166, 35, 0.1)', 'rgba(245, 166, 35, 0)']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Igniting Hope Blog</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Inspiration for your journey</ThemedText>
        </View>

        <TouchableOpacity 
          onPress={handleRefresh} 
          style={styles.visibleRefreshButton}
        >
          <Ionicons name="refresh-outline" size={22} color="#fff" />
          <ThemedText style={styles.refreshButtonText}>Refresh Blog</ThemedText>
        </TouchableOpacity>
      </LinearGradient>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
          {errorMessage.includes('Refreshing') ? null : (
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Ionicons name="refresh-outline" size={16} color="#0066cc" />
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {(loading || refreshing) ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#F5A623" />
            <ResponsiveText variant="body" style={styles.loadingText}>
              {refreshing ? 'Refreshing posts...' : 'Loading posts...'}
            </ResponsiveText>
          </View>
        ) : (
          <>
            {posts.map((post, index) => (
              <TouchableOpacity 
                key={post.id} 
                style={[styles.blogCard, { backgroundColor: useThemeColor({}, 'cardBackground') }]}
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
                    colors={['#F5A623', '#F5CE69']}
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
                  <ResponsiveText 
                    variant="caption" 
                    style={styles.blogDate}
                    numberOfLines={0}
                  >
                    {typeof post.date === 'string' ? post.date : 'No Date'}
                  </ResponsiveText>
                </View>

                <ResponsiveText 
                  variant="h3" 
                  style={styles.blogTitle}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {typeof post.title === 'string' ? post.title : 'Untitled'}
                </ResponsiveText>
                
                <ResponsiveText 
                  variant="body" 
                  style={styles.blogExcerpt}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {post.excerpt}
                </ResponsiveText>

                <View style={styles.cardFooter}>
                  <View style={styles.readMoreButton}>
                    <ThemedText style={styles.readMoreText}>Read More</ThemedText>
                    <Ionicons name="arrow-forward" size={16} color="#F5A623" />
                  </View>
                </View>
              </TouchableOpacity>
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
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 0,
    width: '100%',
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    width: '100%',
    flexShrink: 1,
    ...(Platform.OS === 'ios' && {
      lineHeight: 34,
      fontFamily: 'System',
    }),
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
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
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  blogImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16, 
    borderTopRightRadius: 16,
  },
  blogImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    backgroundColor: '#F5A623',
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
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 16,
    ...(Platform.OS === 'ios' && {
      lineHeight: 24,
      fontFamily: 'System',
    }),
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.6,
    flexShrink: 1,
    flexWrap: 'wrap',
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
    paddingHorizontal: 16,
    opacity: 0.8,
    ...(Platform.OS === 'ios' && {
      flexShrink: 1,
      width: '100%',
    }),
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
    color: '#F5A623',
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
    backgroundColor: '#F5A623',
    padding: 10,
    borderRadius: 24,
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  errorContainer: {
    borderRadius: 12,
    padding: 12,
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffccd5',
    backgroundColor: 'rgba(255,204,213,0.1)',
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
    marginLeft: 4,
  },
});
