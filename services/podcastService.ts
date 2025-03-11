
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  duration: string;
  audioUrl: string;
  imageUrl?: string;
}

// Fetches podcast episodes from the RSS feed
export const fetchPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  try {
    // Check for cached data first
    const cachedData = await AsyncStorage.getItem('podcast_episodes');
    const cachedTime = await AsyncStorage.getItem('podcast_cache_time');

    if (cachedData && cachedTime) {
      const elapsedTime = Date.now() - parseInt(cachedTime);

      // Return cached data if it's still fresh
      if (elapsedTime < CACHE_EXPIRATION) {
        return JSON.parse(cachedData);
      }
    }

    // For now, return fallback data
    // In a real implementation, this would fetch from the Podbean RSS feed
    return getFallbackPodcastEpisodes();

  } catch (error) {
    console.error('Error fetching podcast episodes:', error);
    
    // Return fallback data in case of error
    return getFallbackPodcastEpisodes();
  }
};

// Fallback data in case the API is unavailable
const getFallbackPodcastEpisodes = (): PodcastEpisode[] => {
  return [
    {
      id: '1',
      title: 'Activating Your Prophetic Destiny',
      description: 'In this episode, we discuss how to discover and step into your prophetic calling and destiny.',
      publishDate: 'June 15, 2023',
      duration: '45:22',
      audioUrl: 'https://podcast.ignitinghope.com/episodes/episode1.mp3',
      imageUrl: 'https://podcast.ignitinghope.com/images/episode1.jpg'
    },
    {
      id: '2',
      title: 'Breakthrough Prayer Strategies',
      description: 'Learn powerful prayer techniques that can help you break through barriers in your spiritual life.',
      publishDate: 'May 22, 2023',
      duration: '38:15',
      audioUrl: 'https://podcast.ignitinghope.com/episodes/episode2.mp3',
      imageUrl: 'https://podcast.ignitinghope.com/images/episode2.jpg'
    },
    {
      id: '3',
      title: 'Kingdom Mindsets for Success',
      description: 'Discover how to develop mindsets that align with God\'s kingdom principles for success in every area of life.',
      publishDate: 'April 10, 2023',
      duration: '42:50',
      audioUrl: 'https://podcast.ignitinghope.com/episodes/episode3.mp3',
      imageUrl: 'https://podcast.ignitinghope.com/images/episode3.jpg'
    },
    {
      id: '4',
      title: 'Hearing God\'s Voice Clearly',
      description: 'Practical steps to enhance your ability to hear and discern God\'s voice in your daily life.',
      publishDate: 'March 5, 2023',
      duration: '36:40',
      audioUrl: 'https://podcast.ignitinghope.com/episodes/episode4.mp3',
      imageUrl: 'https://podcast.ignitinghope.com/images/episode4.jpg'
    }
  ];
};
