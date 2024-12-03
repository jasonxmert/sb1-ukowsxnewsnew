import React from 'react';
import { ExternalLink, Image as ImageIcon, Clock } from 'lucide-react';
import type { NewsItem } from '../types/news';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const getTimeAgo = (publishedAt?: string) => {
    if (!publishedAt) return '';
    const date = new Date(publishedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    }
  };

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        {news.imageUrl && !imageError ? (
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              setImageError(true);
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://source.unsplash.com/800x600/?${news.category}`;
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white font-semibold">{news.source}</span>
            {news.publishedAt && (
              <span className="text-sm text-white flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeAgo(news.publishedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{news.title}</h2>
        <p className="mt-2 text-gray-600 line-clamp-3">{news.summary}</p>
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          Read more <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}