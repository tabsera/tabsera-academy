import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Building2, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const location = useLocation();
  const { itemCount } = useCart();
  
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="TABSERA Academy" 
              className="h-12 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 leading-none">TABSERA</span>
              <span className="text-xs font-medium text-gray-500 tracking-wider">ACADEMY ONLINE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Home
            </Link>
            <Link 
              to="/courses" 
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/courses') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Courses
            </Link>
            <Link 
              to="/centers" 
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/centers') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Learning Centers
            </Link>
            <Link 
              to="/partner" 
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/partner') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Become a Partner
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-500 hover:text-blue-600 transition-colors">
              <Search size={20} />
            </button>
            <Link to="/cart" className="text-gray-500 hover:text-blue-600 transition-colors relative">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            
            {/* Portal Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowPortalMenu(!showPortalMenu)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="bg-gray-100 p-2 rounded-full">
                  <User size={20} />
                </div>
                <span>Login</span>
              </button>
              
              {showPortalMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Student</p>
                  <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User size={16} />
                    Student Login
                  </a>
                  <div className="border-t border-gray-100 my-2"></div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Partners</p>
                  <Link 
                    to="/center/dashboard" 
                    onClick={() => setShowPortalMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Building2 size={16} />
                    Learning Center Portal
                  </Link>
                  <Link 
                    to="/admin/dashboard" 
                    onClick={() => setShowPortalMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Shield size={16} />
                    TABSERA Admin Portal
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/courses" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Courses
            </Link>
            <Link to="/centers" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Learning Centers
            </Link>
            <Link to="/partner" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Become a Partner
            </Link>
            <div className="border-t border-gray-100 my-2 pt-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Portals</p>
              <Link to="/center/dashboard" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Learning Center Portal
              </Link>
              <Link to="/admin/dashboard" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
