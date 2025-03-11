import AsyncStorage from '@react-native-async-storage/async-storage';

// The Wix Site ID for your site
const SITE_ID = '9099b5e6-223e-4f2b-a71d-1ffac8658ea8'; 
// Use the public content API endpoint instead
const API_URL = `https://www.wixapis.com/site-data/v1/sites/${SITE_ID}/data/blog/posts`;

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

    // Attempt to fetch from multiple possible Wix API endpoints
    const endpoints = [
      // New format
      `https://www.wixapis.com/site-data/v1/sites/${SITE_ID}/data/blog/posts`,
      // Standard blog API
      `https://www.wixapis.com/blog/v3/blogs/${SITE_ID}/posts`,
      // Public content API
      `https://www.wixapis.com/wix-public-v1/content/query?site_id=${SITE_ID}`,
      // Headless API
      `https://www.ignitinghope.com/_functions/blogPosts`
    ];

    let blogPosts = null;

    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Received data:', JSON.stringify(data).substring(0, 200) + '...');

          // Process response based on different API formats
          if (data.posts && Array.isArray(data.posts)) {
            blogPosts = data.posts.map((item: any) => ({
              id: item.id || `id-${Math.random()}`,
              title: item.title || 'Untitled Post',
              excerpt: (item.excerpt || (item.content?.text ? item.content.text.substring(0, 150) + '...' : 'No content available')),
              date: item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'No date',
              link: item.slug ? `https://www.ignitinghope.com/blog/${item.slug}` : 'https://www.ignitinghope.com/blog',
              imageUrl: item.coverMedia?.image?.url || item.coverImage?.url
            }));
            break;
          } else if (data.items && Array.isArray(data.items)) {
            blogPosts = data.items.map((item: any) => ({
              id: item.id || `id-${Math.random()}`,
              title: item.title || 'Untitled Post',
              excerpt: (item.excerpt || item.content || 'No content').substring(0, 150) + '...',
              date: item.publishedDate || 'No date',
              link: `https://www.ignitinghope.com/blog/${item.slug || ''}`,
              imageUrl: item.image || item.coverImage
            }));
            break;
          } else if (Array.isArray(data)) {
            blogPosts = data.map((item: any) => ({
              id: item.id || `id-${Math.random()}`,
              title: item.title || 'Untitled',
              excerpt: (item.description || item.content || 'No content').substring(0, 150) + '...',
              date: item.date || 'No date',
              link: item.url || 'https://www.ignitinghope.com/blog',
              imageUrl: item.image
            }));
            break;
          }
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error);
      }
    }

    if (blogPosts && blogPosts.length > 0) {
      console.log(`Successfully processed ${blogPosts.length} blog posts`);
      // Cache the successful data
      await AsyncStorage.setItem('wix_blog_posts', JSON.stringify(blogPosts));
      await AsyncStorage.setItem('wix_blog_cache_time', Date.now().toString());
      return blogPosts;
    }

    // If all attempts fail, use fallback data
    console.log('Using fallback blog posts after all API attempts failed');
    return getFallbackBlogPosts();
  } catch (error) {
    console.error('Error fetching Wix blog posts:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }

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