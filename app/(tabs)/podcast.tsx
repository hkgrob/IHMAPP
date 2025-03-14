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
  
  // Get screen width for responsive layout
  const screenWidth = Dimensions.get('window').width;

  const fetchPodcasts = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPodcastEpisodes();
      console.log('Fetched podcast episodes:', data.length);
      // Log the first episode to debug
      if (data.length > 0) {
        console.log('First episode:', {
          title: data[0].title,
          url: data[0].audioUrl
        });
      }
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

  const handlePlayEpisode = (episodeId) => {
    if (episodeId === currentEpisodeId) {
      // Toggle off if the same episode
      setCurrentEpisodeId(null);
    } else {
      setCurrentEpisodeId(episodeId);
    }
  };

  const renderPodcastItem = ({ item }) => {
    const isCurrentlyPlaying = currentEpisodeId === item.id;

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
            onPress={() => handlePlayEpisode(item.id)}
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

          {isCurrentlyPlaying && (
            <View style={styles.embedContainer}>
              {Platform.OS === 'web' ? (
                <audio 
                  controls
                  src={item.audioUrl}
                  style={{ width: '100%', height: 40 }}
                  autoPlay
                />
              ) : (
                <View style={styles.mobilePlayerContainer}>
                  <ThemedText style={styles.nowPlayingText}>Now Playing: {item.title}</ThemedText>
                  <WebView
                    source={{ 
                      html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <style>
                            body { margin: 0; padding: 0; background-color: #f5f5f7; display: flex; justify-content: center; align-items: center; height: 100vh; }
                            audio { width: 100%; max-width: 100%; }
                          </style>
                        </head>
                        <body>
                          <audio controls autoplay style="width: 100%">
                            <source src="${item.audioUrl}" type="audio/mpeg">
                            Your browser does not support the audio element.
                          </audio>
                        </body>
                        </html>
                      `
                    }}
                    style={{ height: 80, width: '100%' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // No longer needed since we're using direct audio URLs

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
    marginTop: 10,
    marginBottom: 10,
  },
  mobilePlayerContainer: {
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    padding: 8,
    width: '100%',
  },
  nowPlayingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  }
});