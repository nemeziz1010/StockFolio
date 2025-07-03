import React from 'react';
import { NewsList } from '../components/NewsList';

export const HomePage = () => {
  return (
    <div >
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Latest Market News</h1>
        <p className="text-gray-500 mt-1">A live feed of general stock market news from India.</p>
      </header>
      <NewsList />
    </div>
  );
}
