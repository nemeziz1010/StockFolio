import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuth } from './context/AuthContext';

function App() {
  const [page, setPage] = useState('home');
  const { user, loading } = useAuth();

  const handleNavigate = (targetPage) => {
    if (targetPage === 'portfolio' && !user) {
      setPage('login');
      return;
    }
    setPage(targetPage);
  };

  const renderPage = () => {
    if (loading) {
      return <div className="text-center p-10">Initializing...</div>;
    }

    if (page === 'portfolio') {
      return user ? <PortfolioPage /> : <LoginPage onNavigate={handleNavigate} />;
    }

    switch (page) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

export default App;
