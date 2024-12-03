import { parseRSSFeed } from '../rssParser';
import type { NewsItem } from '../../types/news';

export async function scrapeScienceDaily(): Promise<NewsItem[]> {
  const feeds = [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://www.sciencedaily.com/rss/top/science.xml',
    'https://www.sciencedaily.com/rss/top/technology.xml'
  ];
  
  try {
    const results = await Promise.all(
      feeds.map(feed => parseRSSFeed(feed, 'science', 'Science Daily'))
    );
    
    return results.flat().slice(0, 30);
  } catch (error) {
    console.error('Error scraping Science Daily:', error);
    return [];
  }
}