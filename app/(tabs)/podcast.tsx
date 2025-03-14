import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, Linking, ActivityIndicator, RefreshControl, Platform, Dimensions, Slider } from 'react-native';
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
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState(''); // Added state for current episode title
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [position, setPosition] = useState(0); // Added state for current playback position
  const [duration, setDuration] = useState(0); // Added state for total duration
  const [volume, setVolume] = useState(1.0); // Added state for volume control
  const positionUpdateTimer = useRef(null); // Ref for the position update timer


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
        if (positionUpdateTimer.current) {
          clearInterval(positionUpdateTimer.current);
        }
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPodcasts();
  }, [fetchPodcasts]);

  // Format milliseconds to mm:ss format
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startPositionUpdateTimer = () => {
    positionUpdateTimer.current = setInterval(async () => {
      if (sound) {
        const status = await sound.getStatusAsync();
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);
      }
    }, 1000);
  };
  
  // Apply volume change to the sound
  useEffect(() => {
    if (sound) {
      sound.setVolumeAsync(volume);
    }
  }, [volume, sound]);

  const handlePlayEpisode = async (url, episodeId, episodeTitle = '') => {
    try {
      setLoadingAudio(true);

      // Same episode - toggle play/pause
      if (episodeId === currentEpisodeId && sound) {
        console.log('Toggling play state for current episode');

        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          // Clear position update timer
          if (positionUpdateTimer.current) {
            clearInterval(positionUpdateTimer.current);
          }
        } else {
          await sound.playAsync();
          setIsPlaying(true);
          // Start position update timer
          startPositionUpdateTimer();
        }
        setLoadingAudio(false);
        return;
      }

      // Unload previous sound and clear timer
      if (sound) {
        console.log('Unloading previous sound');
        if (positionUpdateTimer.current) {
          clearInterval(positionUpdateTimer.current);
        }
        await sound.unloadAsync();
      }

      console.log('Loading new sound:', url);

      // Reset position and duration
      setPosition(0);
      setDuration(0);

      // Create and load new sound
      const soundObject = new Audio.Sound();

      try {
        await soundObject.loadAsync({ uri: url });
        console.log('Sound loaded successfully');

        // Get initial status to set duration
        const status = await soundObject.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
        }

        // Set up playback status update handler
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              console.log('Playback finished');
              setIsPlaying(false);
              setPosition(0);
              if (positionUpdateTimer.current) {
                clearInterval(positionUpdateTimer.current);
              }
            }
          } else if (status.error) {
            console.error('Playback error:', status.error);
          }
        });

        // Set volume
        await soundObject.setVolumeAsync(volume);

        // Play the sound
        await soundObject.playAsync();
        console.log('Sound playing');

        setSound(soundObject);
        setIsPlaying(true);
        setCurrentEpisodeId(episodeId);
        setCurrentEpisodeTitle(episodeTitle);
        setLoadingAudio(false);

        // Start position update timer
        startPositionUpdateTimer();
      } catch (err) {
        console.error('Error playing podcast:', err);
        setLoadingAudio(false);
        throw err;
      }
    } catch (err) {
      console.error('Error playing podcast:', err);
      alert(`Error playing podcast: ${err && err.message ? err.message : 'Could not play audio. Please try again.'}`);
      setIsPlaying(false);
      setCurrentEpisodeId(null);
      setCurrentEpisodeTitle('');
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
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
          </View>

          <ThemedText
            numberOfLines={2}
            style={styles.podcastDescription}
          >
            {item.description}
          </ThemedText>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayEpisode(item.audioUrl, item.id, item.title)}
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
        renderItem={renderPodcastItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          currentEpisodeId ? { paddingBottom: 160 } : {} // Add padding when player is visible
        ]}
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
      {currentEpisodeId && (
        <View style={styles.audioPlayer}>
          <ThemedText style={styles.episodeTitle}>{currentEpisodeTitle}</ThemedText>
          <Slider
            style={styles.progressBar}
            value={position && duration ? position / duration : 0}
            minimumValue={0}
            maximumValue={1}
            onValueChange={(value) => {
              if (sound && duration) {
                sound.setPositionAsync(value * duration);
              }
            }}
            minimumTrackTintColor="#0a7ea4"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#0a7ea4"
          />
          <View style={styles.timeInfo}>
            <ThemedText style={styles.timeText}>{formatTime(position || 0)}</ThemedText>
            <ThemedText style={styles.timeText}>{formatTime(duration || 0)}</ThemedText>
          </View>
          <View style={styles.playerControls}>
            <TouchableOpacity 
              onPress={() => {
                if (sound && position && position > 10000) {
                  sound.setPositionAsync(position - 10000);
                }
              }}
            >
              <Ionicons name="play-back" size={30} color="#0a7ea4" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={async () => {
                if (sound) {
                  if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                  } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                  }
                }
              }} 
              style={styles.mainPlayButton}
            >
              <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={50} color="#0a7ea4" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                if (sound && position && duration && position + 30000 < duration) {
                  sound.setPositionAsync(position + 30000);
                } else if (sound && duration) {
                  sound.setPositionAsync(duration);
                }
              }}
            >
              <Ionicons name="play-forward" size={30} color="#0a7ea4" />
            </TouchableOpacity>
            
            <View style={styles.volumeControl}>
              <Ionicons name="volume-low" size={20} color="#0a7ea4" />
              <Slider
                style={styles.volumeSlider}
                value={volume}
                minimumValue={0}
                maximumValue={1}
                onValueChange={(value) => setVolume(value)}
                minimumTrackTintColor="#0a7ea4"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#0a7ea4"
              />
              <TouchableOpacity 
                onPress={async () => {
                  if (sound) {
                    await sound.unloadAsync();
                    setIsPlaying(false);
                    setCurrentEpisodeId(null);
                    setCurrentEpisodeTitle('');
                    if (positionUpdateTimer.current) {
                      clearInterval(positionUpdateTimer.current);
                    }
                  }
                }}
              >
                <Ionicons name="close-circle" size={24} color="#0a7ea4" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  },
  audioPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 40,
    marginBottom: 8,
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeSlider: {
    width: 80,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  mainPlayButton: {
    marginHorizontal: 15,
  }
});