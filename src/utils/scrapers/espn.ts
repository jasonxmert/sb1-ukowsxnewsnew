import { parseRSSFeed } from '../rssParser';
import type { NewsItem } from '../../types/news';

export async function scrapeESPN(): Promise<NewsItem[]> {
  const feeds = [
    'https://www.espn.com/espn/rss/news',
    'https://www.espn.com/espn/rss/nfl/news',
    'https://www.espn.com/espn/rss/nba/news'
  ];
  
  try {
    const results = await Promise.all(
      feeds.map(feed => parseRSSFeed(feed, 'sports', 'ESPN'))
    );
    
    return results.flat().slice(0, 30);
  } catch (error) {
    console.error('Error scraping ESPN:', error);
    return [];
  }
}