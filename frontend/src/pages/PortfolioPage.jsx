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

  useEffect(() => {
    const fetchInitialData = async () => {
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
  }, [token]);
  
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

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Portfolio</h1>
        <p className="text-gray-500 mt-1">Link your Zerodha account to automatically sync your holdings.</p>
      </header>
      {message && <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 text-center">{message}</div>}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Broker Connection</h2>
        {isLinked ? (
            <button onClick={handleSyncPortfolio} disabled={isSyncing} className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-green-300">
                {isSyncing ? 'Syncing...' : 'Sync Zerodha Portfolio'}
            </button>
        ) : (
            <button onClick={handleBrokerLink} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                Link Zerodha Account
            </button>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Holdings</h2>
        <div>
            {portfolio.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                {/* Updated to map over portfolio objects and display the symbol */}
                {portfolio.map(item => (
                    <span key={item.symbol} className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        {item.symbol}
                    </span>
                ))}
                </div>
            ) : (
                <p className="text-gray-500">Your portfolio is empty. Link and sync your broker to see your holdings.</p>
            )}
        </div>
      </div>
      {/* Updated to pass only the symbols to the NewsList component */}
      {portfolio.length > 0 && (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filtered News For You</h2>
            <NewsList portfolioSymbols={portfolio.map(item => item.symbol)} />
        </div>
      )}
    </div>
  );
};

