
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Image, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import WebView from 'react-native-webview';

export default function BlogPostScreen() {
  const { id, title, excerpt, date, imageUrl, link } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const router = useRouter();

  useEffect(() => {
    // Simulate loading content
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen 
          options={{ 
            title: 'Blog Post',
            headerShown: true,
            headerBackTitle: 'Back',
            headerLeft: () => (
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color="#0066cc" 
                style={{ marginLeft: 10 }}
                onPress={() => router.back()}
              />
            ),
          }} 
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0a7ea4" />
              <ThemedText style={styles.loadingText}>
                Loading blog post...
              </ThemedText>
            </View>
          ) : (
            <View style={styles.postContainer}>
              {imageUrl ? (
                <Image 
                  source={{ uri: imageUrl as string }} 
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
              
              <ThemedText style={styles.blogTitle}>{title as string}</ThemedText>
              <ThemedText style={styles.blogDate}>{date as string}</ThemedText>
              <ThemedText style={styles.blogExcerpt}>{excerpt as string}</ThemedText>
              
              {/* Web view to load the actual blog content */}
              <View style={styles.webViewContainer}>
                <WebView
                  source={{ uri: link as string }}
                  style={styles.webView}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.webViewLoading}>
                      <ActivityIndicator size="large" color="#0a7ea4" />
                    </View>
                  )}
                  onError={(e) => {
                    console.error('WebView error:', e);
                    setError('Failed to load blog content. Please try again later.');
                  }}
                />
              </View>
              
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={32} color="#ff6b00" />
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  postContainer: {
    flex: 1,
  },
  blogImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  blogImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  blogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  blogDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  blogExcerpt: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  webViewContainer: {
    width: '100%',
    height: Platform.OS === 'web' ? 600 : 400,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ff6b00',
  },
});
