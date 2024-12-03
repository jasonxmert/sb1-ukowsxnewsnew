import { parseRSSFeed } from '../rssParser';
import type { NewsItem } from '../../types/news';

export async function scrapeTheHill(): Promise<NewsItem[]> {
  const feeds = [
    'https://thehill.com/news/feed/',
    'https://thehill.com/homenews/feed/',
    'https://thehill.com/policy/feed/'
  ];
  
  try {
    const results = await Promise.all(
      feeds.map(feed => parseRSSFeed(feed, 'politics', 'The Hill'))
    );
    
    return results.flat().slice(0, 30);
  } catch (error) {
    console.error('Error scraping The Hill:', error);
    return [];
  }
}