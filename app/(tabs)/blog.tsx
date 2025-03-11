
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  link: string;
}

export default function BlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchBlogPosts = async () => {
    try {
      // This is a placeholder - in production we'd need a proper API
      // or a proxy server to fetch the content from ignitinghope.com/blog
      // For now, we'll use some sample data
      
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const samplePosts: BlogPost[] = [
        {
          id: '1',
          title: 'Prophetic Breakthrough',
          excerpt: 'Learning to hear God's voice clearly is vital for every believer. In this post, we explore practical steps to enhancing your prophetic gifting.',
          date: 'May 15, 2023',
          link: 'https://www.ignitinghope.com/blog/prophetic-breakthrough'
        },
        {
          id: '2',
          title: 'Kingdom Mindsets',
          excerpt: 'Discover how shifting your mindset can transform your life, relationships, and spiritual journey.',
          date: 'April 22, 2023',
          link: 'https://www.ignitinghope.com/blog/kingdom-mindsets'
        },
        {
          id: '3',
          title: 'Spirit-Led Leadership',
          excerpt: 'Effective leadership flows from intimacy with God. Learn how to lead from a place of spiritual authority and wisdom.',
          date: 'March 10, 2023',
          link: 'https://www.ignitinghope.com/blog/spirit-led-leadership'
        },
        {
          id: '4',
          title: 'Identity in Christ',
          excerpt: 'Understanding who you are in Christ is foundational to walking in freedom and purpose.',
          date: 'February 5, 2023',
          link: 'https://www.ignitinghope.com/blog/identity-in-christ'
        },
        {
          id: '5',
          title: 'Declarations that Transform',
          excerpt: 'Words have power. Learn how biblical declarations can transform your mind and circumstances.',
          date: 'January 18, 2023',
          link: 'https://www.ignitinghope.com/blog/declarations-that-transform'
        }
      ];
      
      setPosts(samplePosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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
        
        {loading ? (
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
              <Ionicons name="open-outline" size={18} color={isDark ? "#fff" : "#000"} />
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
