import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsItem } from '../../types/news';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function scrapeVerge(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${CORS_PROXY}https://www.theverge.com`);
    const $ = cheerio.load(response.data);
    const news: NewsItem[] = [];

    $('.duet--content-cards--content-card').each((_, element) => {
      const titleElement = $(element).find('h2');
      const title = titleElement.text().trim();
      const url = $(element).find('a').attr('href') || '';
      const summary = $(element).find('p').text().trim();
      const imageUrl = $(element).find('img').attr('src') || 
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop';
      const timeElement = $(element).find('time');
      const publishedAt = timeElement.attr('datetime') || new Date().toISOString();

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.theverge.com${url}`,
          summary: summary || 'Read more on The Verge',
          source: 'The Verge',
          category: 'tech',
          imageUrl,
          publishedAt
        });
      }
    });

    return news.slice(0, 30);
  } catch (error) {
    console.error('Error scraping The Verge:', error);
    return [];
  }
}