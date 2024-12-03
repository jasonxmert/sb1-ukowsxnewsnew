import * as cheerio from 'cheerio';
import { proxyManager } from './proxyManager';
import { sanitizeHTML, extractImageUrl } from './htmlUtils';
import { sanitizeNewsItem } from './serialization';
import type { NewsItem } from '../types/news';

export async function parseRSSFeed(url: string, category: NewsItem['category'], source: string): Promise<NewsItem[]> {
  try {
    const response = await proxyManager.fetch(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json, application/xml, text/xml, application/rss+xml, */*'
      }
    });

    const items: NewsItem[] = [];
    const seenTitles = new Set<string>();

    // Handle array responses (from RSS2JSON API)
    if (Array.isArray(response.data)) {
      for (const item of response.data) {
        try {
          const title = sanitizeHTML(item.title);
          if (!title || seenTitles.has(title.toLowerCase())) continue;

          seenTitles.add(title.toLowerCase());
          items.push(sanitizeNewsItem({
            title,
            url: item.link || item.url,
            summary: sanitizeHTML(item.description || item.content),
            source,
            category,
            imageUrl: item.thumbnail || item.enclosure?.url || extractImageUrl(item.description || '', category),
            publishedAt: item.pubDate || item.published || new Date().toISOString()
          }));
        } catch (e) {
          console.error('Error processing RSS item:', e);
        }
      }
      return items;
    }

    // Parse XML content
    const $ = cheerio.load(response.data, { xmlMode: true });
    
    $('item, entry').each((_, element) => {
      try {
        const $item = $(element);
        const title = sanitizeHTML($item.find('title').first().text().trim());
        
        if (!title || seenTitles.has(title.toLowerCase())) return;
        seenTitles.add(title.toLowerCase());

        const link = $item.find('link').first().text().trim() || 
                    $item.find('link').first().attr('href') || 
                    $item.find('guid').first().text().trim();
        
        const description = sanitizeHTML(
          $item.find('description, content\\:encoded, content').first().text().trim()
        );
        
        const pubDate = $item.find('pubDate, published, updated, dc\\:date').first().text().trim();
        const imageUrl = extractImageUrl(description, category);

        if (title && link) {
          items.push(sanitizeNewsItem({
            title,
            url: link,
            summary: description || `Read more on ${source}`,
            source,
            category,
            imageUrl,
            publishedAt: pubDate || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error('Error processing XML item:', e);
      }
    });

    return items
      .filter(item => item.title && item.url)
      .slice(0, 30);
  } catch (error) {
    console.error(`Error parsing RSS feed for ${source}:`, error);
    return [];
  }
}