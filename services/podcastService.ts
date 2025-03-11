
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseString } from 'xml2js';

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

// Podbean RSS feed URL
const PODCAST_RSS_URL = 'https://podcast.ignitinghope.com/feed.xml';

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
    console.log("Fetching podcast episodes...");
    // Check for cached data first
    const cachedData = await AsyncStorage.getItem('podcast_episodes');
    const cachedTime = await AsyncStorage.getItem('podcast_cache_time');

    if (cachedData && cachedTime) {
      const elapsedTime = Date.now() - parseInt(cachedTime);

      // Return cached data if it's still fresh
      if (elapsedTime < CACHE_EXPIRATION) {
        console.log("Using cached podcast data");
        return JSON.parse(cachedData);
      }
    }
    console.log("Cache expired or not available, fetching fresh podcast data");

    // Fetch the RSS feed
    console.log('Attempting to fetch podcast RSS feed from:', PODCAST_RSS_URL);
    
    const response = await fetch(PODCAST_RSS_URL)
      .catch(error => {
        console.error('Network error fetching podcast feed:', error);
        throw new Error('Network error fetching podcast feed');
      });
    
    if (!response.ok) {
      console.error('Failed to fetch podcast RSS feed, status:', response.status);
      throw new Error(`Failed to fetch podcast RSS feed: ${response.status}`);
    }
    
    const xmlData = await response.text();
    console.log('Successfully fetched podcast RSS data, length:', xmlData.length);
    
    // Parse the XML
    const episodes = await parseRssFeed(xmlData);
    
    // Cache the data
    await AsyncStorage.setItem('podcast_episodes', JSON.stringify(episodes));
    await AsyncStorage.setItem('podcast_cache_time', Date.now().toString());
    
    return episodes;

  } catch (error) {
    console.error('Error fetching podcast episodes:', error);
    
    // Return fallback data in case of error
    console.log('Using fallback podcast episodes data');
    return getFallbackPodcastEpisodes();
  }
};

// Parse the RSS feed XML to extract podcast episodes
const parseRssFeed = (xmlData: string): Promise<PodcastEpisode[]> => {
  return new Promise((resolve, reject) => {
    parseString(xmlData, (err, result) => {
      if (err) {
        console.error("XML parsing error:", err);
        reject(err);
        return;
      }
      
      try {
        console.log("XML parsed successfully, structure:", Object.keys(result));
        
        // Safety check for structure
        if (!result || !result.rss || !result.rss.channel || !result.rss.channel[0]) {
          console.error("Invalid RSS structure:", result);
          throw new Error("Invalid RSS structure");
        }
        
        const channel = result.rss.channel[0];
        console.log("Channel found, contains items:", !!channel.item);
        
        // Check if items exist
        if (!channel.item || !Array.isArray(channel.item)) {
          console.error("No items found in channel:", channel);
          throw new Error("No podcast items found");
        }
        
        const items = channel.item;
        console.log(`Found ${items.length} podcast items`);
        
        // Get the channel image if available
        let channelImage = '';
        if (channel.image && channel.image[0].url) {
          channelImage = channel.image[0].url[0];
        }
        
        const episodes: PodcastEpisode[] = items.map((item: any, index: number) => {
          // Extract the enclosure (audio file)
          const enclosure = item.enclosure ? item.enclosure[0].$: null;
          
          // Get item-specific image or fall back to channel image
          let imageUrl = channelImage;
          if (item['itunes:image'] && item['itunes:image'][0].$) {
            imageUrl = item['itunes:image'][0].$.href;
          }
          
          // Get duration
          let duration = 'Unknown';
          if (item['itunes:duration']) {
            duration = item['itunes:duration'][0];
          }
          
          // Format the publish date
          let publishDate = '';
          if (item.pubDate) {
            const date = new Date(item.pubDate[0]);
            publishDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
          
          // Clean the description (remove HTML tags)
          let description = '';
          if (item.description) {
            description = item.description[0].replace(/<[^>]*>?/gm, '');
          }
          
          return {
            id: index.toString(),
            title: item.title[0],
            description: description,
            publishDate: publishDate,
            duration: duration,
            audioUrl: enclosure ? enclosure.url : '',
            imageUrl: imageUrl
          };
        });
        
        resolve(episodes);
      } catch (error) {
        console.error('Error parsing RSS feed:', error);
        reject(error);
      }
    });
  });
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
