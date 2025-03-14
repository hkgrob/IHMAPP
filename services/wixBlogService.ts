
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

// Fetch individual blog post content
export const fetchBlogContentById = async (id: string, link: string): Promise<string> => {
  try {
    // Check for cached content
    const cachedContent = await AsyncStorage.getItem(`wix_blog_content_${id}`);
    
    if (cachedContent) {
      console.log(`Using cached content for blog post ${id}`);
      return cachedContent;
    }
    
    console.log(`Fetching content for blog post ${id} from ${link}`);
    
    // Try to fetch the blog post content using a CORS proxy
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.allorigins.win/raw?url='
    ];
    
    let response = null;
    let htmlContent = '';
    
    // Try each proxy until one works
    for (const proxy of corsProxies) {
      try {
        response = await fetch(proxy + encodeURIComponent(link), {
          method: 'GET',
          headers: {
            'Accept': 'text/html, application/xhtml+xml, */*'
          }
        });
        
        if (response.ok) {
          htmlContent = await response.text();
          
          // Try to extract the main content from the HTML
          const contentMatch = htmlContent.match(/<article[^>]*>([\s\S]*?)<\/article>/) || 
                              htmlContent.match(/<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
                              htmlContent.match(/<div[^>]*class="[^"]*blog-post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
          
          if (contentMatch && contentMatch[1]) {
            // Clean up the content (remove HTML tags but keep paragraphs)
            const cleanContent = contentMatch[1]
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
              .replace(/<[^>]*>/g, '\n')
              .replace(/\n+/g, '\n\n')
              .trim();
            
            // Cache the content
            await AsyncStorage.setItem(`wix_blog_content_${id}`, cleanContent);
            
            return cleanContent;
          }
          
          break;
        }
      } catch (proxyError) {
        console.error(`Error with proxy ${proxy}:`, proxyError);
      }
    }
    
    // If we couldn't extract the content properly, return a placeholder
    return "We couldn't fetch the full content. Please check the original post on our website.";
    
  } catch (error) {
    console.error('Error fetching blog content:', error);
    return "An error occurred while fetching the blog content. Please try again later.";
  }
};

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
      // Try multiple CORS proxies in case one fails
      const corsProxies = [
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url='
      ];
      
      let response = null;
      let xmlData = '';
      
      // Try each proxy until one works
      for (const proxy of corsProxies) {
        try {
          console.log(`Trying CORS proxy: ${proxy}`);
          response = await fetch(proxy + encodeURIComponent(BLOG_XML_FEED), {
            method: 'GET',
            headers: {
              'Accept': 'application/xml, text/xml, */*'
            }
          });
          
          console.log('XML feed response status:', response.status);
          
          if (response.ok) {
            xmlData = await response.text();
            console.log('Received XML data length:', xmlData.length);
            break; // We found a working proxy
          }
        } catch (proxyError) {
          console.error(`Error with proxy ${proxy}:`, proxyError);
          // Continue to the next proxy
        }
      }
      
      // If no proxy worked, try a direct fetch as a last resort
      if (!xmlData) {
        console.log('All proxies failed. Trying direct fetch...');
        try {
          response = await fetch(BLOG_XML_FEED, {
            method: 'GET',
            headers: {
              'Accept': 'application/xml, text/xml, */*'
            }
          });
          
          if (response.ok) {
            xmlData = await response.text();
          }
        } catch (directError) {
          console.error('Direct fetch failed:', directError);
        }
      }
      
      if (!xmlData) {
        throw new Error('Could not fetch XML data through any method');
      }
      
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
      
      // Try one more approach - scrape the blog page directly
      try {
        console.log('Attempting to scrape blog page directly...');
        const blogPageUrl = 'https://www.ignitinghope.com/blog';
        
        const corsProxyUrl = 'https://corsproxy.io/?';
        const response = await fetch(corsProxyUrl + encodeURIComponent(blogPageUrl), {
          method: 'GET',
          headers: {
            'Accept': 'text/html'
          }
        });
        
        if (response.ok) {
          const htmlData = await response.text();
          console.log('Received HTML data length:', htmlData.length);
          
          // Parse the HTML
          const htmlPosts = parseHtmlForBlogPosts(htmlData);
          
          if (htmlPosts.length > 0) {
            console.log(`Successfully scraped ${htmlPosts.length} posts from HTML`);
            return htmlPosts;
          }
        }
      } catch (scrapeError) {
        console.error('HTML scraping error:', scrapeError);
      }
      
      // If all approaches fail, use fallback data
      console.log('Using fallback blog posts after all fetch methods failed');
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

// XML parser for RSS feed using xml2js
const parseRssForBlogPosts = (xml: string): BlogPost[] => {
  const posts: BlogPost[] = [];
  
  try {
    // Import xml2js parser
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });
    
    // Parse the XML data
    parser.parseString(xml, (err: any, result: any) => {
      if (err) {
        console.error('XML parsing error:', err);
        return [];
      }
      
      if (!result || !result.rss || !result.rss.channel || !result.rss.channel.item) {
        console.log('No RSS items found in the XML structure');
        return [];
      }
      
      // Get the items from the RSS feed
      const items = Array.isArray(result.rss.channel.item) 
        ? result.rss.channel.item 
        : [result.rss.channel.item];
      
      console.log(`Found ${items.length} RSS items`);
      
      items.forEach((item: any, index: number) => {
        if (!item) return;
        
        const title = item.title ? stripHtml(item.title) : 'No title';
        
        // Get content from either description or content:encoded
        const content = item['content:encoded'] || item.description || '';
        const excerpt = stripHtml(content).substring(0, 150) + '...';
        
        // Extract date
        let dateStr = 'No date';
        if (item.pubDate) {
          try {
            const dateObj = new Date(item.pubDate);
            dateStr = dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          } catch (e) {
            dateStr = item.pubDate || 'No date';
          }
        }
        
        // Extract link
        const link = item.link || `https://www.ignitinghope.com/blog`;
        
        // Try to extract image from content
        let imageUrl;
        const imgMatch = content.match(/<img[^>]*src="([^"]*)"[^>]*>/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
        
        posts.push({
          id: `rss-${index}`,
          title,
          excerpt,
          date: dateStr,
          link,
          imageUrl
        });
      });
    });
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
