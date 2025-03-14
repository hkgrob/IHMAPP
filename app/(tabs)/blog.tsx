import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { fetchWixBlogPosts, BlogPost } from '../../services/wixBlogService';

// Fallback blog data in case API fails
const BLOG_POSTS = [
  {
    id: '1',
    title: 'Unlocking Your True Potential',
    excerpt: 'Discover the keys to unleashing your full potential and living a life of purpose and fulfillment.',
    date: 'March 14, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1508558936510-0af1e3cccbab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: 'https://www.ignitinghope.com/blog/unlocking-your-true-potential',
  },
  {
    id: '2',
    title: 'The Power of Declarations',
    excerpt: 'Learn how daily declarations can transform your mindset and help you overcome challenges.',
    date: 'March 10, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: 'https://www.ignitinghope.com/blog/the-power-of-declarations',
  },
  {
    id: '3',
    title: 'Building Strong Relationships',
    excerpt: 'Explore practical strategies for developing meaningful connections with others.',
    date: 'March 5, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: 'https://www.ignitinghope.com/blog/building-strong-relationships',
  },
  {
    id: '4',
    title: 'Overcoming Limiting Beliefs',
    excerpt: 'Identify and break free from the limiting beliefs that hold you back from reaching your goals.',
    date: 'February 28, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: 'https://www.ignitinghope.com/blog/overcoming-limiting-beliefs',
  },
  {
    id: '5',
    title: 'Cultivating Gratitude',
    excerpt: 'Discover how practicing gratitude can transform your perspective and increase your happiness.',
    date: 'February 22, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: 'https://www.ignitinghope.com/blog/cultivating-gratitude',
  }
];

export default function BlogScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchBlogData = useCallback(async () => {
    try {
      setError(null);
      const posts = await fetchWixBlogPosts();
      console.log('Fetched blog posts:', posts.length);
      setBlogPosts(posts);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBlogData();
  }, [fetchBlogData]);

  const handleBlogPostPress = (post: BlogPost) => {
    // Navigate to the blog post screen with all necessary data
    router.push({
      pathname: '/blog-post',
      params: {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        imageUrl: post.imageUrl || '',
        link: post.link
      }
    });
  };

  const renderBlogPost = ({ item }) => (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => handleBlogPostPress(item)}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.blogImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={['#0a7ea4', '#64b5d9']}
          style={styles.blogImagePlaceholder}
        >
          <Ionicons name="newspaper" size={32} color="#fff" />
        </LinearGradient>
      )}
      <View style={styles.blogContent}>
        <ThemedText style={styles.blogTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.blogDate}>{item.date}</ThemedText>
        <ThemedText numberOfLines={2} style={styles.blogExcerpt}>{item.excerpt}</ThemedText>
        <View style={styles.readMoreContainer}>
          <ThemedText style={styles.readMore}>Read More</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#0a7ea4" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading blog posts...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          title: 'Blog',
          headerShown: true,
        }}
      />
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading blog posts...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#0a7ea4" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBlogData}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={blogPosts}
          renderItem={renderBlogPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0a7ea4"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No blog posts available</ThemedText>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>Latest Blog Posts</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Insights and inspiration for your journey
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContainer: {
    paddingBottom: 24,
  },
  blogCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blogImage: {
    width: '100%',
    height: 180,
  },
  blogImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginRight: 4,
  },
});