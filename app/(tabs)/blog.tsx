import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fetchWixBlogPosts, BlogPost } from '@/services/wixBlogService';

export default function BlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const blogPosts = await fetchWixBlogPosts();
        setPosts(blogPosts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleOpenBlog = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // Clear the cache
      await AsyncStorage.removeItem('wix_blog_posts');
      await AsyncStorage.removeItem('wix_blog_cache_time');
      // Reload the posts
      const blogPosts = await fetchWixBlogPosts();
      setPosts(blogPosts);
    } catch (error) {
      console.error('Failed to refresh blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Blog',
          headerRight: () => (
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={24} color="#0066cc" />
            </TouchableOpacity>
          )
        }} 
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.headerTitle}>Igniting Hope Blog</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Inspiration for your journey</ThemedText>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <ThemedText style={styles.loadingText}>Loading posts...</ThemedText>
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

        <TouchableOpacity 
          style={styles.visitBlogButton}
          onPress={() => Linking.openURL('https://www.ignitinghope.com/blog')}
        >
          <ThemedText style={styles.visitBlogText}>
            Visit Full Blog
          </ThemedText>
          <Ionicons name="open-outline" size={18} color="#fff" />
        </TouchableOpacity>

        <ThemedText style={styles.disclaimerText}>
          Blog content is provided by Igniting Hope Ministries
        </ThemedText>
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  blogCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
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
    fontSize: 16,
    color: '#0066cc',
    marginRight: 4,
  },
  visitBlogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  visitBlogText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
    marginTop: 8,
  },
});