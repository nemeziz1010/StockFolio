import { useState, useEffect } from 'react';
import axios from 'axios';
import { NewsCard } from './NewsCard';
import { NewspaperIcon } from '@heroicons/react/24/outline';

export const NewsList = ({ portfolioSymbols }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const source = axios.CancelToken.source();
    
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = 'http://localhost:4000/api/news';
        let url = `${API_BASE_URL}/general`;
        
        if (portfolioSymbols && portfolioSymbols.length > 0) {
          url = `${API_BASE_URL}/filtered?stocks=${portfolioSymbols.join(',')}`;
        }
        
        const response = await axios.get(url, { cancelToken: source.token });
        setArticles(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
        } else {
          setError('Failed to fetch news. Is the backend server running?');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    return () => {
      source.cancel('Component unmounted, canceling request.');
    };
  }, [JSON.stringify(portfolioSymbols)]);

  if (loading) {
    return (
        <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading News...</p>
        </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>;
  }

  if (articles.length === 0) {
    return (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
            <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No News Found</h3>
            <p className="mt-1 text-sm text-gray-500">
                {portfolioSymbols ? "We couldn't find any news matching your portfolio." : "There are no news articles to display right now."}
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <NewsCard key={article._id || article.url} article={article} />
      ))}
    </div>
  );
};
