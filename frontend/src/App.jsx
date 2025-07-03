import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';

function App() {
  const [page, setPage] = useState('home'); // 'home' or 'portfolio'

  const renderPage = () => {
    switch (page) {
      case 'portfolio':
        return <PortfolioPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
