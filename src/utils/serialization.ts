import type { NewsItem } from '../types/news';

export function ensureSerializable<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error('Serialization error:', error);
    if (Array.isArray(data)) {
      return data.filter(item => {
        try {
          JSON.stringify(item);
          return true;
        } catch {
          return false;
        }
      }) as T;
    }
    throw error;
  }
}

export function sanitizeNewsItem(item: NewsItem): NewsItem {
  return {
    title: String(item.title || ''),
    url: String(item.url || ''),
    summary: String(item.summary || ''),
    source: String(item.source || ''),
    category: item.category,
    imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    publishedAt: item.publishedAt ? String(item.publishedAt) : new Date().toISOString()
  };
}