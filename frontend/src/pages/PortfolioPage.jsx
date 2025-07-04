import React, { useState, useEffect } from 'react';
import { NewsList } from '../components/NewsList';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [isLinked, setIsLinked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useAuth();
  
  // State for manual input
  const [inputValue, setInputValue] = useState('');

  // This effect now correctly depends on the user's token
  useEffect(() => {
    // THIS IS THE FIX: Reset all local state whenever the user changes (i.e., token changes)
    setPortfolio([]);
    setIsLinked(false);
    setMessage('');
    setIsSyncing(false);
    setInputValue('');

    const fetchInitialData = async () => {
      // Only fetch data if a user is logged in (i.e., a token exists)
      if (token) {
        try {
          const portfolioRes = await api.post('/portfolio');
          if (portfolioRes.data.success) setPortfolio(portfolioRes.data.portfolio);

          const statusRes = await api.post('/broker/status');
          if (statusRes.data.success) setIsLinked(statusRes.data.isLinked);
        } catch (error) {
          console.error("Failed to fetch initial data", error);
        }
      }
    };
    fetchInitialData();
  }, [token]); // The dependency array ensures this runs on login/logout
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('broker_linked')) {
      setMessage(`Successfully linked your Zerodha account! Sync your portfolio to see your holdings.`);
      setIsLinked(true);
      window.history.replaceState({}, document.title, "/portfolio");
    }
  }, []);

  const handleBrokerLink = async () => {
    try {
      const res = await api.post('/broker/connect');
      if (res.data.success) {
        window.location.href = res.data.authUrl;
      }
    } catch (error) {
      setMessage('Error connecting to Zerodha. Please try again.');
    }
  };

  const handleSyncPortfolio = async () => {
    setIsSyncing(true);
    setMessage('');
    try {
        const res = await api.post('/broker/sync-portfolio');
        if (res.data.success) {
            setPortfolio(res.data.portfolio);
            setMessage('Portfolio synced successfully!');
        }
    } catch (error) {
        setMessage('Error syncing portfolio. Please try again.');
    } finally {
        setIsSyncing(false);
    }
  };
  
  // --- NEW FUNCTIONS FOR MANUAL PORTFOLIO MANAGEMENT ---
  const handleManualUpdate = async (newPortfolioSymbols) => {
    try {
        const res = await api.put('/portfolio', { portfolioSymbols: newPortfolioSymbols });
        if(res.data.success) {
            setPortfolio(res.data.portfolio);
        }
    } catch (error) {
        console.error("Failed to update manual portfolio", error);
    }
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!inputValue) return;
    const currentSymbols = portfolio.map(item => item.symbol);
    const newSymbols = inputValue.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
    const updatedSymbols = [...new Set([...currentSymbols, ...newSymbols])];
    handleManualUpdate(updatedSymbols);
    setInputValue('');
  };

  const handleRemoveStock = (stockToRemove) => {
    const updatedSymbols = portfolio.map(item => item.symbol).filter(symbol => symbol !== stockToRemove);
    handleManualUpdate(updatedSymbols);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Portfolio</h1>
        <p className="text-gray-500 mt-1">Manage your holdings manually or link a broker to sync automatically.</p>
      </header>
      {message && <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 text-center">{message}</div>}
      
      {/* Conditionally render Broker Connection or Manual Management */}
      {isLinked ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Broker Connection</h2>
            <button onClick={handleSyncPortfolio} disabled={isSyncing} className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-green-300">
                {isSyncing ? 'Syncing...' : 'Sync Zerodha Portfolio'}
            </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Manual Portfolio</h2>
            <form onSubmit={handleAddStock}>
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
                  className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
                <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Add
                </button>
              </div>
            </form>
            <hr className="my-6"/>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Or, Connect a Broker</h3>
            <button onClick={handleBrokerLink} className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-semibold hover:bg-gray-300 transition-colors">
                Link Zerodha Account
            </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Holdings</h2>
        <div>
            {portfolio.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                {portfolio.map(item => (
                    <span key={item.symbol} className="inline-flex items-center bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        {item.symbol}
                        {!isLinked && (
                            <button onClick={() => handleRemoveStock(item.symbol)} className="ml-2 -mr-1 p-0.5 rounded-full text-gray-500 hover:bg-gray-300 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                    </span>
                ))}
                </div>
            ) : (
                <p className="text-gray-500">Your portfolio is empty. Add stocks or link a broker to get started.</p>
            )}
        </div>
      </div>
      
      {portfolio.length > 0 && (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filtered News For You</h2>
            <NewsList portfolioSymbols={portfolio.map(item => item.symbol)} />
        </div>
      )}
    </div>
  );
};
