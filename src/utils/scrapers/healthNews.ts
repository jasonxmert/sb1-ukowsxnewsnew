import { parseRSSFeed } from '../rssParser';
import type { NewsItem } from '../../types/news';

const HEALTH_FEEDS = [
  {
    url: 'https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
    source: 'WebMD'
  },
  {
    url: 'https://medicalxpress.com/rss-feed/medicine-news/',
    source: 'Medical Xpress'
  },
  {
    url: 'https://www.news-medical.net/syndication.axd?format=rss',
    source: 'News Medical'
  },
  {
    url: 'https://www.healthline.com/health-news/rss.xml',
    source: 'Healthline'
  }
];

export async function scrapeHealthNews(): Promise<NewsItem[]> {
  try {
    const feedPromises = HEALTH_FEEDS.map(({ url, source }) => 
      parseRSSFeed(url, 'health', source)
        .catch(error => {
          console.error(`Error fetching ${source}:`, error);
          return [];
        })
    );
    
    const results = await Promise.allSettled(feedPromises);
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<NewsItem[]> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value)
      .flat();
    
    // Deduplicate by title
    const uniqueNews = Array.from(
      new Map(successfulResults.map(item => [item.title.toLowerCase(), item]))
    ).map(([_, item]) => item);
    
    return uniqueNews.slice(0, 30);
  } catch (error) {
    console.error('Error scraping Health News:', error);
    return [];
  }
}