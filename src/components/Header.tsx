import React from 'react';
import { Newspaper } from 'lucide-react';
import type { NewsCategory } from '../types/news';

interface HeaderProps {
  selectedCategory: NewsCategory | 'all';
  onCategoryChange: (category: NewsCategory | 'all') => void;
}

export function Header({ selectedCategory, onCategoryChange }: HeaderProps) {
  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'tech', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'sports', label: 'Sports' },
    { value: 'politics', label: 'Politics' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'science', label: 'Science' },
    { value: 'health', label: 'Health' }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Newspaper className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Global News Hub</h1>
            </div>
            <div className="text-sm text-gray-500">
              Auto-updates every 5 minutes
            </div>
          </div>
          
          <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onCategoryChange(value as NewsCategory | 'all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedCategory === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}