import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsItem } from '../../types/news';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function scrapeHackerNews(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${CORS_PROXY}https://news.ycombinator.com`);
    const $ = cheerio.load(response.data);
    const news: NewsItem[] = [];

    $('.athing').each(async (_, element) => {
      const titleElement = $(element).find('.titleline > a');
      const title = titleElement.text();
      const url = titleElement.attr('href') || '';
      const domain = $(element).find('.sitestr').text();
      
      const imageUrl = domain ? 
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128` :
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop';
      
      if (title && url) {
        const subtext = $(element).next().find('.subtext');
        const points = subtext.find('.score').text();
        const comments = subtext.find('a').last().text();
        const timeElement = subtext.find('.age');
        const timeAgo = timeElement.attr('title');
        const publishedAt = timeAgo || new Date().toISOString();
        
        news.push({
          title,
          url,
          source: 'Hacker News',
          category: 'tech',
          summary: `${points} | ${comments}`,
          imageUrl,
          publishedAt
        });
      }
    });

    return news.slice(0, 30);
  } catch (error) {
    console.error('Error scraping Hacker News:', error);
    return [];
  }
}