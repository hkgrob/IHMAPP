import AsyncStorage from '@react-native-async-storage/async-storage';

// The Wix Content Manager API endpoint for a public site
// You'll need to replace SITE_ID with your actual Wix site ID
const SITE_ID = '9099b5e6-223e-4f2b-a71d-1ffac8658ea8'; 
const API_URL = `https://www.wixapis.com/wix-content-manager-api/v1/sites/${SITE_ID}/content/collection/blogs/items`;

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

interface WixBlogPost {
  id: string;
  title: string;
  content: {
    text: string;
  };
  createdDate: string;
  slug: string;
  coverImage?: {
    url: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  link: string;
  imageUrl?: string;
}

// Fetches blog posts from Wix API with caching
export const fetchWixBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    // Check for cached data first
    const cachedData = await AsyncStorage.getItem('wix_blog_posts');
    const cachedTime = await AsyncStorage.getItem('wix_blog_cache_time');

    if (cachedData && cachedTime) {
      const elapsedTime = Date.now() - parseInt(cachedTime);

      // Return cached data if it's still fresh
      if (elapsedTime < CACHE_EXPIRATION) {
        return JSON.parse(cachedData);
      }
    }

    // For now, just return fallback data while API integration is pending
    // In a real implementation, this would make a fetch request to the Wix API
    return getFallbackBlogPosts();

  } catch (error) {
    console.error('Error fetching Wix blog posts:', error);

    // Return fallback data in case of error
    return getFallbackBlogPosts();
  }
};

// Fallback data in case the API is unavailable
const getFallbackBlogPosts = (): BlogPost[] => {
  return [
    {
      id: '1',
      title: 'Prophetic Breakthrough',
      excerpt: 'Learning to hear God\'s voice clearly is vital for every believer. In this post, we explore practical steps to enhancing your prophetic gifting.',
      date: 'May 15, 2023',
      link: 'https://www.ignitinghope.com/blog/prophetic-breakthrough'
    },
    {
      id: '2',
      title: 'Kingdom Mindsets',
      excerpt: 'Discover how shifting your mindset can transform your life, relationships, and spiritual journey.',
      date: 'April 22, 2023',
      link: 'https://www.ignitinghope.com/blog/kingdom-mindsets'
    },
    {
      id: '3',
      title: 'Spirit-Led Leadership',
      excerpt: 'Effective leadership flows from intimacy with God. Learn how to lead from a place of spiritual authority and wisdom.',
      date: 'March 10, 2023',
      link: 'https://www.ignitinghope.com/blog/spirit-led-leadership'
    },
    {
      id: '4',
      title: 'The Power of Daily Declarations',
      excerpt: 'Discover how speaking scriptural declarations daily can renew your mind and transform your life over time.',
      date: 'February 5, 2023',
      link: 'https://www.ignitinghope.com/blog/power-of-daily-declarations'
    }
  ];
};