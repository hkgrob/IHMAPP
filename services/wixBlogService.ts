
import AsyncStorage from '@react-native-async-storage/async-storage';

// The Wix Content Manager API endpoint for a public site
// You'll need to replace SITE_ID with your actual Wix site ID
const SITE_ID = 'YOUR_WIX_SITE_ID'; 
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
    
    // Fetch fresh data from Wix API
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform Wix data to our app format
    const posts: BlogPost[] = data.items.map((post: WixBlogPost) => {
      // Create an excerpt by trimming content text to ~100 characters
      const excerpt = post.content.text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .substring(0, 120) + '...';
      
      // Format the date
      const date = new Date(post.createdDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      return {
        id: post.id,
        title: post.title,
        excerpt: excerpt,
        date: date,
        link: `https://www.ignitinghope.com/blog/${post.slug}`,
        imageUrl: post.coverImage?.url,
      };
    });
    
    // Cache the results
    await AsyncStorage.setItem('wix_blog_posts', JSON.stringify(posts));
    await AsyncStorage.setItem('wix_blog_cache_time', Date.now().toString());
    
    return posts;
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
    }
  ];
};
