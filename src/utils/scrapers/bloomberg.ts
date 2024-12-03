import { parseRSSFeed } from '../rssParser';
import type { NewsItem } from '../../types/news';

export async function scrapeBloomberg(): Promise<NewsItem[]> {
  const feeds = [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://feeds.bloomberg.com/technology/news.rss',
    'https://feeds.bloomberg.com/politics/news.rss'
  ];
  
  try {
    const results = await Promise.all(
      feeds.map(feed => parseRSSFeed(feed, 'finance', 'Bloomberg'))
    );
    
    return results.flat().slice(0, 30);
  } catch (error) {
    console.error('Error scraping Bloomberg:', error);
    return [];
  }
}