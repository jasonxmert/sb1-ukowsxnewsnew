import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsItem } from '../../types/news';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function scrapeNYTimes(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${CORS_PROXY}https://www.nytimes.com`);
    const $ = cheerio.load(response.data);
    const news: NewsItem[] = [];

    $('article').each((_, element) => {
      const titleElement = $(element).find('h3');
      const title = titleElement.text().trim();
      const url = $(element).find('a').attr('href') || '';
      const summary = $(element).find('p').first().text().trim();
      const imageUrl = $(element).find('img').attr('src') || 
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop';
      const timeElement = $(element).find('time');
      const publishedAt = timeElement.attr('datetime') || new Date().toISOString();
      const section = $(element).closest('section').attr('aria-labelledby')?.toLowerCase() || '';

      let category: NewsCategory = 'general';
      if (section.includes('politics')) category = 'politics';
      else if (section.includes('science')) category = 'science';
      else if (section.includes('health')) category = 'health';
      else if (section.includes('tech')) category = 'tech';
      else if (section.includes('business') || section.includes('finance')) category = 'finance';
      else if (section.includes('sports')) category = 'sports';

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.nytimes.com${url}`,
          summary: summary || 'Read more on The New York Times',
          source: 'The New York Times',
          category,
          imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.nytimes.com${imageUrl}`,
          publishedAt
        });
      }
    });

    return news.slice(0, 30);
  } catch (error) {
    console.error('Error scraping NY Times:', error);
    return [];
  }
}