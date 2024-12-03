import { NewsItem } from '../types/news';

export function isWithinLastHours(date: Date, hours: number): boolean {
  const now = new Date();
  const hoursAgo = new Date(now.getTime() - (hours * 60 * 60 * 1000));
  return date >= hoursAgo && date <= now;
}

export function parsePublishedDate(dateStr: string): Date {
  try {
    // Handle relative time strings
    if (dateStr.includes('ago')) {
      const now = new Date();
      const match = dateStr.match(/(\d+)\s*(hour|minute|day|week|month|year)s?\s+ago/i);
      if (match) {
        const [_, amount, unit] = match;
        const num = parseInt(amount, 10);
        switch (unit.toLowerCase()) {
          case 'minute': return new Date(now.getTime() - num * 60 * 1000);
          case 'hour': return new Date(now.getTime() - num * 60 * 60 * 1000);
          case 'day': return new Date(now.getTime() - num * 24 * 60 * 60 * 1000);
          case 'week': return new Date(now.getTime() - num * 7 * 24 * 60 * 60 * 1000);
          case 'month': return new Date(now.getTime() - num * 30 * 24 * 60 * 60 * 1000);
          case 'year': return new Date(now.getTime() - num * 365 * 24 * 60 * 60 * 1000);
        }
      }
    }

    // Try parsing as ISO date first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try multiple date formats
    const formats = [
      // US format MM/DD/YYYY
      (str: string) => new Date(str.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, '$3-$1-$2')),
      // UK format DD/MM/YYYY
      (str: string) => new Date(str.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, '$3-$2-$1')),
      // Month DD, YYYY
      (str: string) => {
        const parts = str.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
        return parts ? new Date(`${parts[1]} ${parts[2]} ${parts[3]}`) : new Date(str);
      },
      // Today/Yesterday
      (str: string) => {
        const now = new Date();
        if (str.toLowerCase().includes('today')) {
          return new Date(now.setHours(0, 0, 0, 0));
        }
        if (str.toLowerCase().includes('yesterday')) {
          return new Date(now.setDate(now.getDate() - 1));
        }
        return new Date(str);
      }
    ];

    for (const format of formats) {
      try {
        const date = format(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        continue;
      }
    }

    // If all parsing attempts fail, return current date
    console.warn(`Could not parse date: ${dateStr}, using current date`);
    return new Date();
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return new Date();
  }
}

export function filterRecentNews(news: NewsItem[]): NewsItem[] {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return news.filter(item => {
    if (!item.publishedAt) return false;
    try {
      const date = parsePublishedDate(item.publishedAt);
      return date >= twentyFourHoursAgo;
    } catch (error) {
      console.error('Error filtering news item:', error);
      return false;
    }
  });
}