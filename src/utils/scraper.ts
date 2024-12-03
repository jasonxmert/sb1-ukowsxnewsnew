import { scrapeHackerNews } from './scrapers/hackernews';
import { scrapeTechCrunch } from './scrapers/techcrunch';
import { scrapeReuters } from './scrapers/reuters';
import { scrapeESPN } from './scrapers/espn';
import { scrapeNYTimes } from './scrapers/nytimes';
import { scrapeVerge } from './scrapers/verge';
import { scrapePolitico } from './scrapers/politico';
import { scrapeTheHill } from './scrapers/thehill';
import { scrapeScienceDaily } from './scrapers/scienceDaily';
import { scrapeWebMD } from './scrapers/webmd';
import { scrapeHealthNews } from './scrapers/healthNews';
import { scrapeEntertainment } from './scrapers/entertainment';
import { scrapeBloomberg } from './scrapers/bloomberg';
import { filterRecentNews } from './dateUtils';
import { ensureSerializable, sanitizeNewsItem } from './serialization';
import type { NewsItem, NewsCategory } from '../types/news';

let cachedNews: NewsItem[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const scrapers = {
  tech: [scrapeHackerNews, scrapeTechCrunch, scrapeVerge],
  finance: [scrapeReuters, scrapeBloomberg],
  sports: [scrapeESPN],
  politics: [scrapePolitico, scrapeTheHill],
  science: [scrapeScienceDaily],
  health: [scrapeWebMD, scrapeHealthNews],
  entertainment: [scrapeEntertainment],
  general: [scrapeNYTimes]
};

async function retryWithDelay<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
      return retryWithDelay(fn, retries - 1);
    }
    throw error;
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const now = Date.now();
  
  if (cachedNews.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return filterRecentNews(cachedNews);
  }

  try {
    const allScraperPromises = Object.entries(scrapers).flatMap(([category, categoryScrapers]) =>
      categoryScrapers.map(scraper =>
        retryWithDelay(async () => {
          try {
            const results = await scraper();
            return results.map(item => {
              const sanitizedItem = sanitizeNewsItem({
                ...item,
                publishedAt: item.publishedAt || new Date().toISOString(),
                summary: item.summary || `Read more on ${item.source}`,
                imageUrl: item.imageUrl || `https://source.unsplash.com/800x600/?${category},news`
              });
              return ensureSerializable(sanitizedItem);
            });
          } catch (e) {
            console.error(`Error in ${scraper.name}:`, e instanceof Error ? e.message : String(e));
            return [];
          }
        })
      )
    );

    const results = await Promise.allSettled(allScraperPromises);
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<NewsItem[]> => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();

    if (successfulResults.length === 0) {
      console.error('No news could be fetched from any source');
      return filterRecentNews(cachedNews);
    }

    // Deduplicate by title and ensure unique images per article
    const uniqueNews = Array.from(
      new Map(successfulResults.map(item => [item.title.toLowerCase(), item]))
    ).map(([_, item]) => ensureSerializable(item));

    cachedNews = uniqueNews;
    lastFetchTime = now;
    
    const filteredNews = filterRecentNews(cachedNews);
    console.log(`Fetched ${filteredNews.length} articles within last 24h`);
    
    return filteredNews;
  } catch (error) {
    console.error('Error fetching news:', error instanceof Error ? error.message : String(error));
    return filterRecentNews(cachedNews);
  }
}

export function filterNewsByCategory(news: NewsItem[], category: NewsCategory | 'all'): NewsItem[] {
  if (category === 'all') return news;
  return news.filter(item => item.category === category).slice(0, 30);
}