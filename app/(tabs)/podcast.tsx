
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, Linking, ActivityIndicator, RefreshControl } from 'react-native';
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

export default function PodcastScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPodcastEpisodes = useCallback(async () => {
    try {
      const data = await fetchPodcastEpisodes();
      setEpisodes(data);
    } catch (error) {
      console.error('Failed to load podcast episodes:', error);
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

  const openEpisode = async (url: string) => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Open in external browser
      await WebBrowser.openBrowserAsync(url);
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

  const renderPodcastItem = ({ item }: { item: PodcastEpisode }) => (
    <TouchableOpacity 
      style={styles.episodeCard}
      activeOpacity={0.7} 
      onPress={() => openEpisode(item.audioUrl)}
    >
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.episodeCardInner}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.episodeImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.episodeImage, styles.placeholderImage]}>
            <Ionicons name="mic" size={32} color={isDark ? "#fff" : "#333"} />
          </View>
        )}
        
        <View style={styles.episodeDetails}>
          <ThemedText style={styles.episodeTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          
          <ThemedText style={styles.episodeDate}>
            {item.publishDate} • {item.duration}
          </ThemedText>
          
          <ThemedText style={styles.episodeDescription} numberOfLines={3}>
            {item.description}
          </ThemedText>
          
          <View style={styles.playButtonContainer}>
            <Ionicons name="play-circle" size={20} color={isDark ? "#fff" : "#333"} />
            <ThemedText style={styles.playButtonText}>Play Episode</ThemedText>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.headerContainer}>
        <ThemedText style={styles.header}>
          Igniting Hope Podcast
        </ThemedText>
        <ThemedText style={styles.subheader}>
          Inspiration for your spiritual journey
        </ThemedText>
      </View>

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
          ListFooterComponent={
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
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
    paddingTop: 5,
  },
  episodeCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  episodeCardInner: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  episodeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  placeholderImage: {
    backgroundColor: '#5856D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeDetails: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 6,
  },
  episodeDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 8,
  },
  playButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  visitPodcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  visitPodcastText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
});
