
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, Linking, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchPodcastEpisodes, PodcastEpisode } from '@/services/podcastService';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export default function PodcastScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  
  const openEpisode = (episode: PodcastEpisode) => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Set the selected episode to display in the embedded player
      setSelectedEpisode(episode);
    } catch (error) {
      console.error('Error opening podcast episode:', error);
    }
  };

  const visitPodcastSite = async () => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await WebBrowser.openBrowserAsync('https://podcast.ignitinghope.com');
    } catch (error) {
      console.error('Error opening podcast website:', error);
    }
  };

  const loadPodcastEpisodes = useCallback(async () => {
    try {
      console.log('Loading podcast episodes...');
      setIsLoading(true);
      
      // Use our hardcoded fallback data directly
      const fallbackData = [
        {
          id: '1',
          title: 'Activating Your Prophetic Destiny',
          description: 'In this episode, we discuss how to discover and step into your prophetic calling and destiny.',
          publishDate: 'June 15, 2023',
          duration: '45:22',
          audioUrl: 'https://mcdn.podbean.com/mf/web/x5p9qe/sample-episode.mp3',
          imageUrl: 'https://pbcdn1.podbean.com/imglogo/image-logo/11560630/Igniting_Hope_Podcast_Cover_Art.jpg'
        },
        {
          id: '2',
          title: 'Breakthrough Prayer Strategies',
          description: 'Learn powerful prayer techniques that can help you break through barriers in your spiritual life.',
          publishDate: 'May 22, 2023',
          duration: '38:15',
          audioUrl: 'https://mcdn.podbean.com/mf/web/x5p9qe/sample-episode.mp3',
          imageUrl: 'https://pbcdn1.podbean.com/imglogo/image-logo/11560630/Igniting_Hope_Podcast_Cover_Art.jpg'
        },
        {
          id: '3',
          title: 'Kingdom Mindsets for Success',
          description: 'Discover how to develop mindsets that align with God\'s kingdom principles for success in every area of life.',
          publishDate: 'April 10, 2023',
          duration: '42:50',
          audioUrl: 'https://mcdn.podbean.com/mf/web/x5p9qe/sample-episode.mp3',
          imageUrl: 'https://pbcdn1.podbean.com/imglogo/image-logo/11560630/Igniting_Hope_Podcast_Cover_Art.jpg'
        },
        {
          id: '4',
          title: 'Hearing God\'s Voice Clearly',
          description: 'Practical steps to enhance your ability to hear and discern God\'s voice in your daily life.',
          publishDate: 'March 5, 2023',
          duration: '36:40',
          audioUrl: 'https://mcdn.podbean.com/mf/web/x5p9qe/sample-episode.mp3',
          imageUrl: 'https://pbcdn1.podbean.com/imglogo/image-logo/11560630/Igniting_Hope_Podcast_Cover_Art.jpg'
        }
      ];
      
      console.log('Setting hardcoded fallback data');
      setEpisodes(fallbackData);
      
    } catch (error) {
      console.error('Failed to load podcast episodes:', error);
      const hardcodedFallback = [
        {
          id: '1',
          title: 'Emergency Fallback Episode',
          description: 'This is a fallback episode shown when all other methods fail.',
          publishDate: 'January 1, 2024',
          duration: '5:00',
          audioUrl: 'https://example.com/fallback.mp3',
          imageUrl: 'https://via.placeholder.com/300'
        }
      ];
      setEpisodes(hardcodedFallback);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPodcastEpisodes();
  }, [loadPodcastEpisodes]);

  useEffect(() => {
    loadPodcastEpisodes();
  }, [loadPodcastEpisodes]);

  const renderPodcastItem = ({ item }: { item: PodcastEpisode }) => (
    <TouchableOpacity 
      style={styles.episodeCard}
      activeOpacity={0.7}
      onPress={() => openEpisode(item)}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }} 
        style={styles.episodeImage}
      />
      <View style={styles.episodeContent}>
        <ThemedText style={styles.episodeTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.episodeDate}>
          {item.publishDate} • {item.duration}
        </ThemedText>
        <ThemedText style={styles.episodeDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
      </View>
      <Ionicons 
        name="play-circle-outline" 
        size={28} 
        color={isDark ? "#fff" : "#000"} 
        style={styles.playIcon}
      />
    </TouchableOpacity>
  );

  console.log('Rendering podcast screen with', episodes.length, 'episodes');
  
  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Igniting Hope Podcast</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Inspiration for your journey</ThemedText>
        </View>
      </View>

      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <ThemedText style={styles.debugText}>
          Episodes: {episodes.length} | Loading: {isLoading ? 'Yes' : 'No'} | Refreshing: {refreshing ? 'Yes' : 'No'}
        </ThemedText>
      </View>

      {episodes.length === 0 && !isLoading && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            No episodes available. Please pull down to refresh.
          </ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <ThemedText style={styles.retryText}>
              Retry Loading
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#fff" : "#333"} />
        </View>
      ) : (
        <FlatList
          data={episodes}
          renderItem={renderPodcastItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={isDark ? "#fff" : "#333"}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyList}>
              <ThemedText style={styles.emptyText}>
                No podcast episodes found.
              </ThemedText>
            </View>
          )}
          ListFooterComponent={
            episodes.length > 0 ? (
              <TouchableOpacity 
                style={styles.visitPodcastButton}
                activeOpacity={0.7}
                onPress={visitPodcastSite}
              >
                <ThemedText style={styles.visitPodcastText}>
                  Visit Full Podcast Site
                </ThemedText>
                <Ionicons name="open-outline" size={18} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            ) : null
          }
        />
      )}
      
      {selectedEpisode && (
        <BlurView 
          intensity={90} 
          tint={isDark ? 'dark' : 'light'} 
          style={styles.playerContainer}
        >
          <View style={styles.playerHeader}>
            <ThemedText style={styles.playerTitle} numberOfLines={1}>
              {selectedEpisode.title}
            </ThemedText>
            <TouchableOpacity 
              onPress={() => setSelectedEpisode(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-back" size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.playButton]}>
              <Ionicons name="play" size={30} color={isDark ? "#000" : "#fff"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-forward" size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    marginBottom: 10,
  },
  headerContainer: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 100, // Extra space for player
  },
  episodeCard: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    alignItems: 'center',
  },
  episodeImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  episodeContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  episodeTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 13,
    opacity: 0.8,
  },
  playIcon: {
    marginLeft: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  playerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  controlButton: {
    padding: 10,
    marginHorizontal: 15,
  },
  playButton: {
    backgroundColor: '#5856D6',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitPodcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginTop: 20,
    marginBottom: 30,
  },
  visitPodcastText: {
    fontWeight: '600',
    marginRight: 10,
  },
  debugContainer: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
