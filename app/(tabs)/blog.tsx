import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Linking, Image, View } from 'react-native';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useColorScheme } from '../../hooks/useColorScheme';
import { fetchWixBlogPosts, BlogPost } from '../../services/wixBlogService';

export default function BlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchBlogPosts = async () => {
    try {
      setError(null);
      const blogPosts = await fetchWixBlogPosts();
      setPosts(blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogPosts();
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const openBlogPost = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Igniting Hope Blog' }} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedText style={styles.header}>Igniting Hope Blog</ThemedText>
        <ThemedText style={styles.subheader}>Latest posts from ignitinghope.com</ThemedText>

        {error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : loading ? (
          <ActivityIndicator size="large" color="#FF9500" style={styles.loader} />
        ) : (
          <>
            {posts.map(post => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.postContainer}
                activeOpacity={0.7}
                onPress={() => openBlogPost(post.link)}
              >
                <BlurView 
                  intensity={90} 
                  style={styles.postCard} 
                  tint={isDark ? "dark" : "light"}
                >
                  <ThemedText style={styles.postTitle}>{post.title}</ThemedText>
                  <ThemedText style={styles.postDate}>{post.date}</ThemedText>
                  <ThemedText style={styles.postExcerpt}>{post.excerpt}</ThemedText>
                  <ThemedView style={styles.readMoreContainer}>
                    <ThemedText style={styles.readMore}>Read More</ThemedText>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? "#FF9500" : "#FF7A00"} />
                  </ThemedView>
                </BlurView>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.visitBlogButton}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('https://www.ignitinghope.com/blog')}
            >
              <ThemedText style={styles.visitBlogText}>
                Visit Full Blog
              </ThemedText>
              <Ionicons name="open-outline" size={18} color="#fff" />
            </TouchableOpacity>

            <ThemedText style={styles.disclaimerText}>
              This is a preview of the Igniting Hope blog content. For the complete experience and most recent posts, please visit the official website.
            </ThemedText>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  loader: {
    marginTop: 30,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  postContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postCard: {
    padding: 16,
    borderRadius: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postDate: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  postExcerpt: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    color: '#FF9500',
    fontWeight: '600',
    marginRight: 4,
  },
  visitBlogButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  visitBlogText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 20,
    paddingHorizontal: 20,
  },
});