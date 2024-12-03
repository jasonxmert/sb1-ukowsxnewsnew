import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsItem } from '../../types/news';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function scrapeWebMD(): Promise<NewsItem[]> {
  try {
    const urls = [
      'https://www.webmd.com/news/default.htm',
      'https://www.webmd.com/health-news/default.htm',
      'https://www.webmd.com/medical-news/default.htm'
    ];

    const responses = await Promise.all(
      urls.map(url => axios.get(`${CORS_PROXY}${url}`))
    );

    const news: NewsItem[] = [];

    for (const response of responses) {
      const $ = cheerio.load(response.data);

      $('.article-feed-item, .article-section article, .news-article').each((_, element) => {
        const titleElement = $(element).find('h2, h3, .article-title');
        const title = titleElement.text().trim();
        const url = $(element).find('a').attr('href') || '';
        const summary = $(element).find('.article-description, .article-summary, p').first().text().trim();
        const imageElement = $(element).find('img');
        const imageUrl = imageElement.attr('data-src') || imageElement.attr('src') || 
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop';
        
        const timeElement = $(element).find('time, .article-date, .date');
        const publishedAt = timeElement.attr('datetime') || timeElement.text() || new Date().toISOString();

        if (title && url) {
          news.push({
            title,
            url: url.startsWith('http') ? url : `https://www.webmd.com${url}`,
            summary: summary || 'Read more on WebMD',
            source: 'WebMD',
            category: 'health',
            imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.webmd.com${imageUrl}`,
            publishedAt
          });
        }
      });
    }

    return news.slice(0, 30);
  } catch (error) {
    console.error('Error scraping WebMD:', error);
    return [];
  }
}