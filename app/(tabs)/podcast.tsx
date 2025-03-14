
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, Linking, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { fetchPodcastEpisodes } from '../../services/podcastService';
import { Audio } from 'expo-av';

export default function PodcastScreen() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Audio state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  
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

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        console.log('Cleaning up sound');
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPodcasts();
  }, [fetchPodcasts]);

  const handlePlayEpisode = async (url, episodeId) => {
    try {
      setLoadingAudio(true);
      
      // Same episode - toggle play/pause
      if (episodeId === currentEpisodeId && sound) {
        console.log('Toggling play state for current episode');
        
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        setLoadingAudio(false);
        return;
      }
      
      // Unload previous sound
      if (sound) {
        console.log('Unloading previous sound');
        await sound.unloadAsync();
      }
      
      console.log('Loading new sound:', url);
      
      // Create and load new sound
      const soundObject = new Audio.Sound();
      
      try {
        await soundObject.loadAsync({ uri: url });
        console.log('Sound loaded successfully');
        
        // Set up playback status update handler
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              console.log('Playback finished');
              setIsPlaying(false);
            }
          } else if (status.error) {
            console.error('Playback error:', status.error);
          }
        });
        
        // Play the sound
        await soundObject.playAsync();
        console.log('Sound playing');
        
        setSound(soundObject);
        setIsPlaying(true);
        setCurrentEpisodeId(episodeId);
      } catch (loadError) {
        console.error('Error loading audio:', loadError);
        alert(`Unable to load audio: ${loadError.message || 'Unknown error'}`);
      }
      
    } catch (err) {
      console.error('Error with audio playback:', err);
      alert(`Playback error: ${err?.message || 'Could not play this episode. Please try again.'}`);
      
      // Reset state on error
      setIsPlaying(false);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      setCurrentEpisodeId(null);
    } finally {
      setLoadingAudio(false);
    }
  };

  const renderPodcastItem = ({ item }) => {
    const isCurrentlyPlaying = currentEpisodeId === item.id && isPlaying;
    const isLoading = loadingAudio && currentEpisodeId === item.id;
    
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

            <ThemedText
              numberOfLines={2}
              style={styles.podcastDescription}
            >
              {item.description}
            </ThemedText>

            <TouchableOpacity
              style={styles.playButton}
              onPress={() => handlePlayEpisode(item.audioUrl, item.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#0a7ea4" />
                  <ThemedText style={styles.playButtonText}>Loading...</ThemedText>
                </>
              ) : (
                <>
                  <Ionicons
                    name={isCurrentlyPlaying ? "pause-circle" : "play-circle"}
                    size={22}
                    color="#0a7ea4"
                  />
                  <ThemedText style={styles.playButtonText}>
                    {isCurrentlyPlaying ? 'Pause Episode' : 'Play Episode'}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
        ListHeaderComponent={() => (
          <ThemedText style={styles.pageTitle}>Steve Backlund Podcasts</ThemedText>
        )}
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
    paddingTop: 0, // Removed padding from top
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12, // Matching the blog page padding
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
    height: 60, // Reduced from 120px
    backgroundColor: '#0a7ea4', // Fallback color
    justifyContent: 'center',
    alignItems: 'center',
    // Linear gradient background
    backgroundImage: 'linear-gradient(to bottom right, #0a7ea4, #2c9fc9, #50c2e8)',
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
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
  }
});
