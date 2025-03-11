
import AsyncStorage from '@react-native-async-storage/async-storage';

// Direct XML feed URL
const BLOG_XML_FEED = 'https://www.ignitinghope.com/blog/blog-feed.xml';

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  link: string;
  imageUrl?: string;
}

// Fetches blog posts from XML feed with caching
export const fetchWixBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    // Check for cached data first
    const cachedData = await AsyncStorage.getItem('wix_blog_posts');
    const cachedTime = await AsyncStorage.getItem('wix_blog_cache_time');

    if (cachedData && cachedTime) {
      const elapsedTime = Date.now() - parseInt(cachedTime);

      // Return cached data if it's still fresh
      if (elapsedTime < CACHE_EXPIRATION) {
        console.log('Using cached blog data');
        return JSON.parse(cachedData);
      }
    }
    
    console.log('Cache expired or not available, fetching fresh data');
    console.log('Fetching blog from XML feed:', BLOG_XML_FEED);
    
    try {
      const response = await fetch(BLOG_XML_FEED, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; BlogReader/1.0)'
        }
      });
      
      console.log('XML feed response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`XML feed response error: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('Received XML data length:', xmlData.length);
      
      // Parse the RSS XML
      const rssPosts = parseRssForBlogPosts(xmlData);
      
      if (rssPosts.length > 0) {
        console.log(`Successfully parsed ${rssPosts.length} posts from XML feed`);
        
        // Cache the successful data
        await AsyncStorage.setItem('wix_blog_posts', JSON.stringify(rssPosts));
        await AsyncStorage.setItem('wix_blog_cache_time', Date.now().toString());
        
        return rssPosts;
      } else {
        console.log('No blog posts found in the XML feed');
        throw new Error('No blog posts found in XML feed');
      }
    } catch (xmlError) {
      console.error('XML feed error:', xmlError);
      
      // If the direct XML feed fails, use fallback data
      console.log('Using fallback blog posts after XML feed attempt failed');
      return getFallbackBlogPosts();
    }
  } catch (error) {
    console.error('Error fetching Wix blog posts:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }

    // Return fallback data in case of error
    return getFallbackBlogPosts();
  }
};

// Simple HTML parser for blog posts
const parseHtmlForBlogPosts = (html: string): BlogPost[] => {
  const posts: BlogPost[] = [];
  
  try {
    // Look for blog post elements
    const postMatches = html.match(/<article[^>]*>([\s\S]*?)<\/article>/g);
    
    if (postMatches && postMatches.length > 0) {
      console.log(`Found ${postMatches.length} article elements`);
      
      postMatches.forEach((postHtml, index) => {
        // Extract title
        const titleMatch = postHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || 
                          postHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) ||
                          postHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        
        // Extract content/excerpt
        const contentMatch = postHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        
        // Extract date
        const dateMatch = postHtml.match(/datetime="([^"]*)"/) ||
                         postHtml.match(/<time[^>]*>([\s\S]*?)<\/time>/);
        
        // Extract image
        const imageMatch = postHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/);
        
        // Extract link
        const linkMatch = postHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
        
        if (titleMatch) {
          const title = stripHtml(titleMatch[1]);
          const excerpt = contentMatch ? stripHtml(contentMatch[1]).substring(0, 150) + '...' : 'No excerpt available';
          
          let dateStr = 'No date';
          if (dateMatch) {
            try {
              const dateObj = new Date(dateMatch[1]);
              dateStr = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } catch (e) {
              dateStr = dateMatch[1] || 'No date';
            }
          }
          
          const link = linkMatch ? linkMatch[1] : `https://www.ignitinghope.com/blog`;
          const imageUrl = imageMatch ? imageMatch[1] : undefined;
          
          posts.push({
            id: `post-${index}`,
            title,
            excerpt,
            date: dateStr,
            link,
            imageUrl
          });
        }
      });
    } else {
      console.log('No article elements found in HTML');
    }
  } catch (e) {
    console.error('Error parsing HTML:', e);
  }
  
  return posts;
};

// Simple XML parser for RSS feed
const parseRssForBlogPosts = (xml: string): BlogPost[] => {
  const posts: BlogPost[] = [];
  
  try {
    // Look for item elements in RSS
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g);
    
    if (itemMatches && itemMatches.length > 0) {
      console.log(`Found ${itemMatches.length} RSS items`);
      
      itemMatches.forEach((itemXml, index) => {
        // Extract title
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
        
        // Extract description/content
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/) ||
                         itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
        
        // Extract date
        const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        
        // Extract link
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
        
        // Extract image
        const imageMatch = descMatch && descMatch[1].match(/<img[^>]*src="([^"]*)"[^>]*>/);
        
        if (titleMatch) {
          const title = stripHtml(titleMatch[1]);
          const excerpt = descMatch ? stripHtml(descMatch[1]).substring(0, 150) + '...' : 'No excerpt available';
          
          let dateStr = 'No date';
          if (dateMatch) {
            try {
              const dateObj = new Date(dateMatch[1]);
              dateStr = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } catch (e) {
              dateStr = dateMatch[1] || 'No date';
            }
          }
          
          const link = linkMatch ? stripHtml(linkMatch[1]) : `https://www.ignitinghope.com/blog`;
          const imageUrl = imageMatch ? imageMatch[1] : undefined;
          
          posts.push({
            id: `rss-${index}`,
            title,
            excerpt,
            date: dateStr,
            link,
            imageUrl
          });
        }
      });
    } else {
      console.log('No item elements found in RSS XML');
    }
  } catch (e) {
    console.error('Error parsing RSS XML:', e);
  }
  
  return posts;
};

// Helper to strip HTML tags
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
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
