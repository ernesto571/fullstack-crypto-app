import React from 'react';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

const NotFound = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8  mt-[69px]">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry, it happens to the best of us!
          </p>
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
              <HelpCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                This could happen if the URL was typed incorrectly, the page was moved, or it no longer exists.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Home size={20} />
            Go Home
          </button>
          
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/dashboard"
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Dashboard</h4>
                <p className="text-sm text-gray-500">Main application dashboard</p>
              </div>
            </a>
            
            <a
              href="/portfolio"
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Portfolio</h4>
                <p className="text-sm text-gray-500">View your investments</p>
              </div>
            </a>
            
            <a
              href="/watchlist"
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Watchlist</h4>
                <p className="text-sm text-gray-500">View you watchlist</p>
              </div>
            </a>
            
            
          </div>
        </div>

    
      </div>
    </div>
  );
};

export default NotFound;