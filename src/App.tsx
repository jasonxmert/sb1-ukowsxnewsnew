import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NewsList } from './components/NewsList';
import { Header } from './components/Header';
import type { NewsCategory } from './types/news';

const queryClient = new QueryClient();

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <Header 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <NewsList selectedCategory={selectedCategory} />
        </main>
        
        <footer className="bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500">
              © 2024 Global News Hub. Aggregating news from multiple sources.
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}