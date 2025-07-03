import { CalendarIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { AIEffectIndicator } from './AIEffectIndicator'; // Import the new component

export const NewsCard = ({ article }) => {
  return (
    <article className="block bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="flex justify-between items-center gap-4">
        {/* Left side content */}
        <div className="flex-grow">
          <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xl font-bold text-gray-800 mb-2 leading-tight hover:text-blue-600 transition-colors"
          >
            {article.headline}
          </a>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-3">
            <div className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 mr-1.5 text-gray-400"/>
                <span>{article.source}</span>
            </div>
            <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400"/>
                <span>{new Date(article.publishedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            {/* NEW: Confidence score is now displayed directly on the card */}
            {article.aiAnalysis && (
              <div className="flex items-center font-semibold text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 mr-1.5 text-green-500"/>
                <span>{(article.aiAnalysis.confidence * 100).toFixed(0)}% Confidence</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side AI Indicator */}
        <div className="flex-shrink-0 pl-4">
          <AIEffectIndicator analysis={article.aiAnalysis} />
        </div>
      </div>
    </article>
  );
};