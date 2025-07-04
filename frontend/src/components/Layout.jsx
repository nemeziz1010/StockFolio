import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Layout = ({ children, onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-20 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-2xl font-bold text-blue-600">
              SmartNews
            </a>
            <div className="flex items-center space-x-2">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">General News</a>
              {user ? (
                <>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">My Portfolio</a>
                  <button onClick={handleLogout} className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Logout</button>
                </>
              ) : (
                <>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('register'); }} className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Register</a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="w-full max-w-5xl mx-auto flex-grow py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="w-full text-center py-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Smart News App. All Rights Reserved.</p>
      </footer>
    </div>
  );
};
