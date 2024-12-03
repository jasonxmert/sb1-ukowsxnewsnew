export type NewsCategory = 
  | 'tech' 
  | 'general' 
  | 'sports' 
  | 'finance' 
  | 'weather'
  | 'politics'
  | 'entertainment'
  | 'science'
  | 'health';

export interface NewsItem {
  title: string;
  summary: string;
  imageUrl?: string;
  source: string;
  url: string;
  category: NewsCategory;
  publishedAt?: string;
}