import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { fetchPodcastEpisodes } from '../../services/podcastService';
import WebView from 'react-native-webview';

export default function PodcastScreen() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [currentEpisodeEmbed, setCurrentEpisodeEmbed] = useState('');

  // Get screen width for responsive layout
  const screenWidth = Dimensions.get('window').width;

  const fetchPodcasts = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPodcastEpisodes();
      setPodcasts(data);
    } catch (err) {
      console.error('Error fetching podcasts:', err);
      setError('Failed to load podcasts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPodcasts();
  }, [fetchPodcasts]);

  const handlePlayEpisode = (episodeId, embedCode) => {
    if (episodeId === currentEpisodeId) {
      // Toggle off if the same episode
      setCurrentEpisodeId(null);
      setCurrentEpisodeEmbed('');
    } else {
      setCurrentEpisodeId(episodeId);
      setCurrentEpisodeEmbed(embedCode);
    }
  };

  const renderPodcastItem = ({ item }) => {
    const isCurrentlyPlaying = currentEpisodeId === item.id;

    // Create embed code using the item's URL
    const embedUrl = `https://www.podbean.com/player-v2/?i=${getPodbeanId(item.audioUrl)}&from=pb6admin&share=0&download=0&rtl=0&fonts=Arial&skin=60a0c8&font-color=auto&logo_link=podcast_page&btn-skin=60a0c8`;

    return (
      <View style={styles.podcastItem}>
        <View style={styles.podcastContent}>
          <View style={styles.podcastImagePlaceholder}>
            <Ionicons name="mic" size={24} color="#fff" />
          </View>

          <View style={styles.podcastInfo}>
            <ThemedText style={styles.podcastTitle}>{item.title}</ThemedText>
            <View style={styles.podcastMeta}>
              <ThemedText style={styles.podcastDate}>
                {item.publishDate}
              </ThemedText>
              <ThemedText style={styles.podcastDuration}>
                • {item.duration}
              </ThemedText>
            </View>
          </View>

          <ThemedText
            numberOfLines={2}
            style={styles.podcastDescription}
          >
            {item.description}
          </ThemedText>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayEpisode(item.id, embedUrl)}
          >
            <Ionicons
              name={isCurrentlyPlaying ? "pause-circle" : "play-circle"}
              size={22}
              color="#0a7ea4"
            />
            <ThemedText style={styles.playButtonText}>
              {isCurrentlyPlaying ? 'Close Player' : 'Play Episode'}
            </ThemedText>
          </TouchableOpacity>

          {isCurrentlyPlaying && Platform.OS === 'web' && (
            <View style={styles.embedContainer}>
              <iframe 
                title={item.title}
                src={embedUrl}
                width="100%" 
                height="150" 
                frameBorder="0" 
                scrolling="no"
                style={{
                  border: 'none',
                  minWidth: 'min(100%, 430px)',
                  height: '150px'
                }}
                loading="lazy"
              />
            </View>
          )}

          {isCurrentlyPlaying && Platform.OS !== 'web' && (
            <View style={styles.embedContainer}>
              <WebView
                source={{ uri: embedUrl }}
                style={{ height: 150, width: '100%' }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  // Helper function to extract Podbean ID from URL
  const getPodbeanId = (url) => {
    // Extract the ID from something like "https://mcdn.podbean.com/mf/web/j2j8ta69uhqubdme/The-Road-to-Lacking-Nothing-Part-2.mp3"
    // Format will be something like "qzn8t-184238d-pb"
    // For now, let's use a fallback ID when we can't parse it
    try {
      const filename = url.split('/').pop();
      const id = filename.split('.')[0].substring(0, 12);
      return `${id.substring(0, 5)}-${id.substring(5, 12)}-pb`;
    } catch (err) {
      return "qzn8t-184238d-pb"; // Fallback ID
    }
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading podcasts...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#0a7ea4" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPodcasts}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen options={{
        headerShown: false,
      }} />

      <FlatList
        data={podcasts}
        renderItem={renderPodcastItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0a7ea4"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No podcasts available</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Platform.OS === 'web' ? 20 : 16,
    paddingTop: 0, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12, 
    marginHorizontal: 16,
  },
  listContent: {
    padding: 16,
  },
  podcastItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  podcastContent: {
    flexDirection: 'column',
  },
  podcastImagePlaceholder: {
    width: '100%',
    height: 60, 
    backgroundColor: '#0a7ea4', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastInfo: {
    padding: 12,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  podcastMeta: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  podcastDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  podcastDuration: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 8,
  },
  podcastDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
    padding: 12,
    paddingTop: 0,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 0,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#0a7ea4',
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
    backgroundColor: '#FF6B00',
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
  embedContainer: {
    width: '100%',
    height: 150,
    marginTop: 10,
    marginBottom: 10,
  }
});