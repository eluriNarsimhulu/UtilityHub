import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Zap } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
          <Zap className="h-8 w-8" />
          <span className="text-xl font-bold">UtilityHub</span>
        </Link>
        
        {location.pathname !== '/' && (
          <Link 
            to="/" 
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-white"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;