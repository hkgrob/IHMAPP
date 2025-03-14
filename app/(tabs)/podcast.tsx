
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, Linking, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { fetchPodcastEpisodes } from '../../services/podcastService';

export default function PodcastScreen() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
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

  const handlePlayEpisode = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error('Error opening podcast URL:', err);
      alert('Could not open podcast link. Please try again later.');
    });
  };

  const renderPodcastItem = ({ item }) => {
    return (
      <View style={styles.podcastItem}>
        <View style={styles.podcastContent}>
          <View style={styles.podcastImagePlaceholder}>
            <Ionicons name="mic" size={42} color="#fff" />
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
              onPress={() => handlePlayEpisode(item.audioUrl)}
            >
              <Ionicons name="play-circle" size={22} color="#0a7ea4" />
              <ThemedText style={styles.playButtonText}>Play Episode</ThemedText>
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
        title: "Podcasts",
        headerLargeTitle: true,
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
    height: 180,
    backgroundColor: '#0a7ea4', // Fallback color
    justifyContent: 'center',
    alignItems: 'center',
    // Linear gradient background
    backgroundImage: 'linear-gradient(to bottom right, #0a7ea4, #2c9fc9, #50c2e8)',
  },
  podcastInfo: {
    padding: 16,
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
