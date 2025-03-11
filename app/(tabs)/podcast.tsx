import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Platform, 
  RefreshControl, 
  Image, 
  Text,
  ActivityIndicator,
  Linking,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useColorScheme } from '../../hooks/useColorScheme';
import { fetchPodcastEpisodes, PodcastEpisode } from '../../services/podcastService';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ResponsiveText from '../../components/ResponsiveText';

export default function PodcastScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPodcasts = useCallback(async () => {
    try {
      const data = await fetchPodcastEpisodes();
      setEpisodes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load podcast episodes. Please try again later.');
      console.error('Error loading podcasts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPodcasts();
  }, [loadPodcasts]);

  useEffect(() => {
    loadPodcasts();
  }, [loadPodcasts]);

  const handleEpisodePress = async (episode: PodcastEpisode) => {
    try {
      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Open the audio URL in browser
      if (episode.audioUrl) {
        if (Platform.OS === 'web') {
          window.open(episode.audioUrl, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(episode.audioUrl);
        }
      }
    } catch (error) {
      console.error('Error opening podcast link:', error);
      // Fall back to regular linking
      if (episode.audioUrl) {
        Linking.openURL(episode.audioUrl);
      }
    }
  };

  const renderEpisode = ({ item }: { item: PodcastEpisode }) => (
    <TouchableOpacity
      style={styles.episodeCard}
      onPress={() => handleEpisodePress(item)}
    >
      <View style={styles.episodeImageContainer}>
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : { uri: 'https://www.ignitinghope.com/wp-content/uploads/2021/11/podcast.jpg' }}
          style={styles.episodeImage}
        />
      </View>
      <View style={styles.episodeContent}>
        <ThemedText style={styles.episodeTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.episodeDate}>{item.publishDate}</ThemedText>
        <ThemedText style={styles.episodeDuration}>{item.duration}</ThemedText>
        <ThemedText style={styles.episodeDescription} numberOfLines={3}>
          {item.description}
        </ThemedText>
      </View>
      <Ionicons 
        name="play-circle" 
        size={24} 
        color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} 
        style={styles.playIcon} 
      />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Igniting Hope Podcast</ThemedText>
      </View>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText style={styles.loadingText}>Loading podcast episodes...</ThemedText>
        </View>
      ) : (
        <>
          <ResponsiveText style={styles.statsText}>
            Episodes: {episodes.length} | Loading: {loading ? 'Yes' : 'No'} | Refreshing: {refreshing ? 'Yes' : 'No'}
          </ResponsiveText>

          <FlatList
            data={episodes}
            renderItem={renderEpisode}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No podcast episodes available.</ThemedText>
              </View>
            }
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  episodeCard: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
  },
  episodeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  episodeImage: {
    width: '100%',
    height: '100%',
  },
  episodeContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  episodeDuration: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
  },
  playIcon: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
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
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
  statsText: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
    paddingVertical: 5,
  },
});