import React, { useState, useEffect } from 'react';
import { NewsList } from '../components/NewsList';

export const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    try {
      const savedPortfolio = localStorage.getItem('stockPortfolio');
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      }
    } catch (error) {
      console.error("Failed to parse portfolio from localStorage", error);
      localStorage.removeItem('stockPortfolio');
    }
  }, []);

  const handleUpdatePortfolio = (e) => {
    e.preventDefault();
    if (!inputValue) return;
    
    const newSymbols = inputValue
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s);

    const updatedPortfolio = [...new Set([...portfolio, ...newSymbols])];
    setPortfolio(updatedPortfolio);
    localStorage.setItem('stockPortfolio', JSON.stringify(updatedPortfolio));
    setInputValue('');
  };

  const handleClearPortfolio = () => {
    setPortfolio([]);
    localStorage.removeItem('stockPortfolio');
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Portfolio News</h1>
        <p className="text-gray-500 mt-1">A personalized news feed based on your holdings.</p>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your Mock Portfolio</h2>
                {portfolio.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                    {portfolio.map(stock => (
                        <span key={stock} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {stock}
                        </span>
                    ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Your portfolio is empty. Add some stocks below.</p>
                )}
            </div>
            {portfolio.length > 0 && (
                <button 
                    onClick={handleClearPortfolio}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md transition-colors"
                >
                    Clear All
                </button>
            )}
        </div>

        <form onSubmit={handleUpdatePortfolio} className="mt-6">
          <label htmlFor="stock-input" className="block text-sm font-medium text-gray-700 mb-1">
            Add Stocks (comma-separated)
          </label>
          <div className="flex gap-2">
            <input
              id="stock-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., RELIANCE, TCS, INFY"
              className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </form>
      </div>
      
      {portfolio.length > 0 ? <NewsList portfolioSymbols={portfolio} /> : null}
    </div>
  );
}
