import { parseRSSFeed } from '../rssParser';
import type { NewsItem } from '../../types/news';

export async function scrapeEntertainment(): Promise<NewsItem[]> {
  const feeds = [
    'https://variety.com/feed/',
    'https://deadline.com/feed/',
    'https://www.hollywoodreporter.com/feed/'
  ];
  
  try {
    const results = await Promise.all(
      feeds.map(feed => parseRSSFeed(feed, 'entertainment', 'Entertainment News'))
    );
    
    return results.flat().slice(0, 30);
  } catch (error) {
    console.error('Error scraping Entertainment News:', error);
    return [];
  }
}