import React from 'react';

export const Layout = ({ children, currentPage, onNavigate }) => {
  const navLinks = [
    { name: 'General News', href: 'home' },
    { name: 'My Portfolio', href: 'portfolio' },
  ];

  return (
    // This root div is now a flex column to better control the layout
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-10 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-2xl font-bold text-blue-600">
                SmartNews
              </a>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                {navLinks.map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate(item.href); }}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* This wrapper ensures the main content is centered and grows to fill space */}
      <div className="w-full flex-grow flex justify-center">
        <main className="w-full max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <footer className="w-full text-center py-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Smart News App. All Rights Reserved.</p>
      </footer>
    </div>
  );
}