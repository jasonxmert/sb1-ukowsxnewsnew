import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsItem } from '../../types/news';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function scrapeTechCrunch(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${CORS_PROXY}https://techcrunch.com`);
    const $ = cheerio.load(response.data);
    const news: NewsItem[] = [];

    $('article').each((_, element) => {
      const titleElement = $(element).find('h2 a');
      const title = titleElement.text().trim();
      const url = titleElement.attr('href') || '';
      const summary = $(element).find('div.post-block__content').text().trim();
      const imageUrl = $(element).find('img').attr('src') || 
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop';
      const timeElement = $(element).find('time');
      const publishedAt = timeElement.attr('datetime') || new Date().toISOString();

      if (title && url) {
        news.push({
          title,
          url,
          summary: summary || 'Read more on TechCrunch',
          source: 'TechCrunch',
          category: 'tech',
          imageUrl,
          publishedAt
        });
      }
    });

    return news.slice(0, 30);
  } catch (error) {
    console.error('Error scraping TechCrunch:', error);
    return [];
  }
}