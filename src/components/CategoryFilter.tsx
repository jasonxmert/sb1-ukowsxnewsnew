import React from 'react';
import type { NewsCategory } from '../types/news';

interface CategoryFilterProps {
  selectedCategory: NewsCategory | 'all';
  onCategoryChange: (category: NewsCategory | 'all') => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'tech', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'sports', label: 'Sports' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onCategoryChange(value as NewsCategory | 'all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${selectedCategory === value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}