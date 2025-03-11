
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseString } from 'xml2js';

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

// Podbean RSS feed URL with CORS proxy alternatives
const PODCAST_RSS_URL = 'https://feed.podbean.com/ignitinghope/feed.xml';
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  duration: string;
  audioUrl: string;
  imageUrl?: string;
}

// Fallback data that's always available
const FALLBACK_EPISODES: PodcastEpisode[] = [
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

// Attempts to fetch using multiple CORS proxies
async function fetchWithCorsProxies(url: string): Promise<Response | null> {
  // First try direct fetch (works in native but often not in web)
  try {
    console.log('Trying direct fetch:', url);
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
      console.log('Direct fetch successful!');
      return response;
    }
  } catch (error) {
    console.log('Direct fetch failed, trying proxies...');
  }

  // Try each CORS proxy
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      console.log('Trying with proxy:', proxy);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        console.log('Fetch with proxy successful!');
        return response;
      }
      console.log('Proxy response status:', response.status);
    } catch (error) {
      console.log('Proxy fetch error, trying next...');
    }
  }

  console.log('All fetch attempts failed');
  return null;
}

// Fetches podcast episodes from the RSS feed with multiple fallback options
export const fetchPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  try {
    // Start by immediately setting the fallback episodes
    // This ensures we always have data to show
    console.log("Fetching podcast episodes...");

    // Check for cached data first
    const cachedData = await AsyncStorage.getItem('podcast_episodes');
    const cachedTime = await AsyncStorage.getItem('podcast_cache_time');

    // Return cached data if it's still fresh
    if (cachedData && cachedTime) {
      const elapsedTime = Date.now() - parseInt(cachedTime);
      if (elapsedTime < CACHE_EXPIRATION) {
        console.log("Using cached podcast data");
        return JSON.parse(cachedData);
      }
    }
    
    console.log("Cache expired or not available, fetching fresh podcast data");

    // Try to fetch the RSS feed with CORS proxies
    const response = await fetchWithCorsProxies(PODCAST_RSS_URL);
    
    if (!response) {
      console.error('All fetch attempts failed, using fallback data');
      return FALLBACK_EPISODES;
    }
    
    const xmlData = await response.text();
    console.log('Successfully fetched podcast RSS data, length:', xmlData.length);
    
    // Parse the XML
    try {
      const episodes = await parseRssFeed(xmlData);
      if (episodes && episodes.length > 0) {
        console.log(`Successfully parsed ${episodes.length} podcast episodes`);
        
        // Cache the data
        await AsyncStorage.setItem('podcast_episodes', JSON.stringify(episodes));
        await AsyncStorage.setItem('podcast_cache_time', Date.now().toString());
        
        return episodes;
      } else {
        console.log('No episodes parsed from XML, using fallback');
        return FALLBACK_EPISODES;
      }
    } catch (parseError) {
      console.error('Error parsing RSS data:', parseError);
      return FALLBACK_EPISODES;
    }
  } catch (error) {
    console.error('Error in podcast fetch process:', error);
    return FALLBACK_EPISODES;
  }
};

// Parse the RSS feed XML to extract podcast episodes
const parseRssFeed = (xmlData: string): Promise<PodcastEpisode[]> => {
  return new Promise((resolve, reject) => {
    parseString(xmlData, { explicitArray: true, trim: true }, (err, result) => {
      if (err) {
        console.error("XML parsing error:", err);
        reject(err);
        return;
      }
      
      try {
        console.log("XML parsed, checking structure");
        
        // Safety check for structure
        if (!result || !result.rss || !result.rss.channel || !result.rss.channel[0]) {
          console.error("Invalid RSS structure");
          throw new Error("Invalid RSS structure");
        }
        
        const channel = result.rss.channel[0];
        
        // Check if items exist
        if (!channel.item || !Array.isArray(channel.item) || channel.item.length === 0) {
          console.error("No items found in channel");
          throw new Error("No podcast items found");
        }
        
        const items = channel.item;
        console.log(`Found ${items.length} podcast items`);
        
        // Get the channel image if available
        let channelImage = '';
        if (channel.image && channel.image[0] && channel.image[0].url) {
          channelImage = channel.image[0].url[0];
        } else if (channel['itunes:image'] && channel['itunes:image'][0] && channel['itunes:image'][0].$) {
          channelImage = channel['itunes:image'][0].$.href;
        }
        
        const episodes: PodcastEpisode[] = items.map((item: any, index: number) => {
          // Extract the enclosure (audio file)
          let audioUrl = '';
          if (item.enclosure && item.enclosure[0] && item.enclosure[0].$) {
            audioUrl = item.enclosure[0].$.url;
          }
          
          // Get item-specific image or fall back to channel image
          let imageUrl = channelImage;
          if (item['itunes:image'] && item['itunes:image'][0] && item['itunes:image'][0].$) {
            imageUrl = item['itunes:image'][0].$.href;
          }
          
          // Get duration
          let duration = 'Unknown';
          if (item['itunes:duration'] && item['itunes:duration'][0]) {
            duration = item['itunes:duration'][0];
          }
          
          // Format the publish date
          let publishDate = '';
          if (item.pubDate && item.pubDate[0]) {
            try {
              const date = new Date(item.pubDate[0]);
              publishDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } catch (e) {
              publishDate = item.pubDate[0];
            }
          }
          
          // Clean the description (remove HTML tags)
          let description = '';
          if (item.description && item.description[0]) {
            description = item.description[0].replace(/<[^>]*>?/gm, '');
          } else if (item['itunes:summary'] && item['itunes:summary'][0]) {
            description = item['itunes:summary'][0].replace(/<[^>]*>?/gm, '');
          }
          
          let title = '';
          if (item.title && item.title[0]) {
            title = typeof item.title[0] === 'string' ? item.title[0] : 'Unnamed Episode';
          }
          
          return {
            id: (index + 1).toString(),
            title: title,
            description: description,
            publishDate: publishDate,
            duration: duration,
            audioUrl: audioUrl,
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
