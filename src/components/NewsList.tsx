import React from 'react';
import { useQuery } from 'react-query';
import { NewsCard } from './NewsCard';
import { fetchAllNews, filterNewsByCategory } from '../utils/scraper';
import { Loader2, RefreshCw } from 'lucide-react';
import type { NewsCategory } from '../types/news';

interface NewsListProps {
  selectedCategory: NewsCategory | 'all';
}

export function NewsList({ selectedCategory }: NewsListProps) {
  const { 
    data: news, 
    isLoading, 
    error,
    refetch,
    isFetching 
  } = useQuery('news', fetchAllNews, {
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 290000, // Consider data stale after 4 minutes 50 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Failed to load news. Please try again later.
      </div>
    );
  }

  const filteredNews = filterNewsByCategory(news || [], selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Latest News {selectedCategory !== 'all' && `- ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
        </h2>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {filteredNews.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No recent news found in the last 24 hours for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <NewsCard key={`${item.source}-${index}`} news={item} />
          ))}
        </div>
      )}
    </div>
  );
}