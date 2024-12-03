import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsItem } from '../../types/news';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function scrapePolitico(): Promise<NewsItem[]> {
  try {
    const urls = [
      'https://www.politico.com',
      'https://www.politico.com/politics'
    ];

    const responses = await Promise.all(
      urls.map(url => axios.get(`${CORS_PROXY}${url}`))
    );

    const news: NewsItem[] = [];
    const seenTitles = new Set<string>();

    for (const response of responses) {
      const $ = cheerio.load(response.data);

      $('.story-frag, .media-item, .headline').each((_, element) => {
        const titleElement = $(element).find('.headline, h3');
        const title = titleElement.text().trim();
        
        // Skip if we've seen this title already
        if (!title || seenTitles.has(title.toLowerCase())) {
          return;
        }
        seenTitles.add(title.toLowerCase());

        const url = $(element).find('a').attr('href') || '';
        const summary = $(element).find('.dek, .tease, p').first().text().trim();
        const imageElement = $(element).find('img');
        const imageUrl = imageElement.attr('data-src') || imageElement.attr('src') || 
          'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop';
        
        const timeElement = $(element).find('time');
        const publishedAt = timeElement.attr('datetime') || new Date().toISOString();

        if (title && url) {
          news.push({
            title,
            url: url.startsWith('http') ? url : `https://www.politico.com${url}`,
            summary: summary || 'Read more on Politico',
            source: 'Politico',
            category: 'politics',
            imageUrl,
            publishedAt
          });
        }
      });
    }

    return news.slice(0, 30);
  } catch (error) {
    console.error('Error scraping Politico:', error);
    return [];
  }
}