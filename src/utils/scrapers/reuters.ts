import { parseRSSFeed } from '../rssParser';
import type { NewsItem } from '../../types/news';

export async function scrapeReuters(): Promise<NewsItem[]> {
  const feeds = [
    'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best'
  ];
  
  try {
    const results = await Promise.all(
      feeds.map(feed => parseRSSFeed(feed, 'finance', 'Reuters'))
    );
    
    return results.flat().slice(0, 30);
  } catch (error) {
    console.error('Error scraping Reuters:', error);
    return [];
  }
}