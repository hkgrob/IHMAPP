import AsyncStorage from '@react-native-async-storage/async-storage';

// The Wix Site ID for your site
const SITE_ID = '9099b5e6-223e-4f2b-a71d-1ffac8658ea8'; 
// Using the public content query API instead of the content manager API
const API_URL = `https://www.wixapis.com/wix-public-v1/content/query?site_id=${SITE_ID}`;

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

    // Actually fetch from Wix API
    console.log('Attempting to fetch from Wix API:', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        // Query for blog posts specifically
        query: {
          paging: {
            limit: 10,
            offset: 0
          },
          sort: [
            {
              fieldName: 'createdDate',
              order: 'DESC'
            }
          ],
          contentType: 'blog-post'
        }
      })
    });
    
    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data).substring(0, 200) + '...');
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid API response format');
    }
    
    // Transform the Wix data to our BlogPost format
    const posts: BlogPost[] = data.results.map((item: any) => ({
      id: item.id || `id-${Math.random()}`,
      title: item.title || 'Untitled Post',
      excerpt: (item.content?.text || item.excerpt || 'No content available').substring(0, 150) + '...',
      date: item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'No date',
      link: item.slug ? `https://www.ignitinghope.com/blog/${item.slug}` : 'https://www.ignitinghope.com/blog',
      imageUrl: item.coverImage?.url || item.image?.url
    }));
    
    console.log(`Processed ${posts.length} blog posts from API`);

    // Cache the data
    await AsyncStorage.setItem('wix_blog_posts', JSON.stringify(posts));
    await AsyncStorage.setItem('wix_blog_cache_time', Date.now().toString());

    return posts;
  } catch (error) {
    console.error('Error fetching Wix blog posts:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    // Try fetching with a different approach if the first one failed
    try {
      console.log('Attempting alternative API endpoint');
      const altApiUrl = `https://www.ignitinghope.com/_functions/wixCode/query?collectionName=Blog&limit=10`;
      const altResponse = await fetch(altApiUrl);
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        if (altData && Array.isArray(altData.items)) {
          const posts = altData.items.map((item: any) => ({
            id: item.id || `id-${Math.random()}`,
            title: item.title || 'Untitled',
            excerpt: (item.excerpt || item.content || 'No content').substring(0, 150) + '...',
            date: item.publishedDate || 'No date',
            link: `https://www.ignitinghope.com/blog/${item.slug || ''}`,
            imageUrl: item.image || item.coverImage
          }));
          
          console.log('Successfully retrieved posts from alternative endpoint');
          return posts;
        }
      }
    } catch (altError) {
      console.error('Alternative API approach also failed:', altError);
    }

    console.log('Using fallback blog posts after failed API attempts');
    // Return fallback data after all attempts fail
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