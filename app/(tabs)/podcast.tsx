
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveText from '@/components/ResponsiveText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchPodcastEpisodes, PodcastEpisode } from '@/services/podcastService';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import MobileContainer from '@/components/MobileContainer';

export default function PodcastScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const windowDimensions = Dimensions.get('window');
  const screenWidth = windowDimensions.width;
  const screenHeight = windowDimensions.height;
  
  // Add responsiveness checks
  const isSmallDevice = screenWidth < 360;
  const isLandscape = screenWidth > screenHeight;

  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);

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

  const openEpisode = (episode: PodcastEpisode) => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
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

  const renderPodcastItem = ({ item }: { item: PodcastEpisode }) => {
    // Truncate description
    const maxDescriptionLength = isSmallDevice ? 60 : 90;
    const truncatedDescription = item.description.length > maxDescriptionLength
      ? `${item.description.substring(0, maxDescriptionLength)}...`
      : item.description;

    return (
      <TouchableOpacity
        style={styles.episodeCard}
        activeOpacity={0.7}
        onPress={() => openEpisode(item)}
      >
        <ThemedView style={styles.episodeCardInner}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.episodeImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.episodeImage, styles.placeholderImage]}>
              <Ionicons name="mic" size={24} color="#fff" />
            </View>
          )}
          
          <View style={styles.episodeDetails}>
            <ResponsiveText style={styles.episodeTitle} numberOfLines={2}>
              {item.title}
            </ResponsiveText>
            
            <ResponsiveText style={styles.episodeDate}>
              {item.publishDate}
            </ResponsiveText>
            
            <ResponsiveText style={styles.episodeDescription} numberOfLines={2}>
              {truncatedDescription}
            </ResponsiveText>
            
            <View style={styles.playButtonContainer}>
              <Ionicons name="play-circle" size={16} color={isDark ? "#fff" : "#000"} />
              <ResponsiveText style={styles.playButtonText}>
                Play Episode
              </ResponsiveText>
            </View>
          </View>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <MobileContainer withInsets={false}>
      <ThemedView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDark ? "#fff" : "#333"} />
          </View>
        ) : (
          <FlatList
            data={episodes}
            renderItem={renderPodcastItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 20 }
            ]}
            showsVerticalScrollIndicator={false}
            initialNumToRender={4}
            maxToRenderPerBatch={6}
            windowSize={5}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={isDark ? "#fff" : "#333"}
              />
            }
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <ResponsiveText 
                  variant={isSmallDevice ? "h3" : "h2"} 
                  style={styles.headerTitle}
                >
                  Podcast
                </ResponsiveText>
              </View>
            }
            ListFooterComponent={
              <TouchableOpacity 
                style={styles.visitPodcastButton}
                activeOpacity={0.7}
                onPress={visitPodcastSite}
              >
                <ResponsiveText 
                  style={[styles.visitPodcastText, isSmallDevice && { fontSize: 14 }]}
                >
                  Visit Full Podcast Site
                </ResponsiveText>
                <Ionicons 
                  name="open-outline" 
                  size={isSmallDevice ? 16 : 18} 
                  color={isDark ? "#fff" : "#000"} 
                />
              </TouchableOpacity>
            }
          />
        )}
        
        {selectedEpisode && (
          <BlurView
            intensity={90}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.playerContainer,
              { backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(240, 240, 240, 0.8)' }
            ]}
          >
            <View style={styles.playerHeader}>
              <ResponsiveText style={styles.playerTitle} numberOfLines={1}>
                {selectedEpisode.title}
              </ResponsiveText>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedEpisode(null)}
              >
                <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.audioPlayerWrapper}>
              {Platform.OS === 'web' ? (
                <audio 
                  src={selectedEpisode.audioUrl} 
                  controls 
                  style={styles.audioPlayer}
                  autoPlay
                />
              ) : (
                <View style={styles.mobilePlayerFallback}>
                  <TouchableOpacity 
                    onPress={() => WebBrowser.openBrowserAsync(selectedEpisode.audioUrl)}
                    style={styles.mobilePlayButton}
                  >
                    <Ionicons name="play-circle" size={40} color={isDark ? "#fff" : "#333"} />
                    <ResponsiveText style={styles.mobilePlayText}>Play in Browser</ResponsiveText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </BlurView>
        )}
      </ThemedView>
    </MobileContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Dimensions.get('window').width < 360 ? 8 : 16,
    paddingBottom: 20,
  },
  episodeCard: {
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  episodeCardInner: {
    flexDirection: 'row',
    padding: Dimensions.get('window').width < 360 ? 8 : 12,
    alignItems: 'center',
  },
  episodeImage: {
    width: Dimensions.get('window').width < 360 ? 60 : 70,
    height: Dimensions.get('window').width < 360 ? 60 : 70,
    borderRadius: 8,
    marginRight: Dimensions.get('window').width < 360 ? 8 : 12,
  },
  placeholderImage: {
    backgroundColor: '#5856D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: Dimensions.get('window').width < 360 ? 14 : 16,
  },
  episodeDate: {
    marginBottom: 2,
    fontSize: Dimensions.get('window').width < 360 ? 11 : 12,
  },
  episodeDescription: {
    lineHeight: Dimensions.get('window').width < 360 ? 16 : 18,
    marginBottom: 4,
    fontSize: Dimensions.get('window').width < 360 ? 11 : 12,
  },
  playButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    fontWeight: '500',
    marginLeft: 5,
    fontSize: Dimensions.get('window').width < 360 ? 12 : 14,
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
    marginRight: 5,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  playerTitle: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 10,
  },
  closeButton: {
    padding: 4,
  },
  audioPlayerWrapper: {
    width: '100%',
  },
  audioPlayer: {
    width: '100%',
  },
  mobilePlayerFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mobilePlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    padding: 10,
    borderRadius: 8,
  },
  mobilePlayText: {
    marginLeft: 8,
    fontWeight: '500',
  },
});
