/**
 * Tutor Layout
 * Layout wrapper for tutor portal pages
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, Calendar, Video, Menu, X, Bell,
  LogOut, ChevronDown, ExternalLink, BookOpen
} from 'lucide-react';

const TutorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/tutor/dashboard') {
      return location.pathname === '/tutor' || location.pathname === '/tutor/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/tutor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tutor/profile', icon: User, label: 'My Profile' },
    { path: '/tutor/availability', icon: Calendar, label: 'Availability' },
    { path: '/tutor/sessions', icon: Video, label: 'Sessions' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'T';
    const first = user.first_name?.[0] || user.firstName?.[0] || '';
    const last = user.last_name?.[0] || user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'T';
  };

  const getUserName = () => {
    if (!user) return 'Tutor';
    return `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || 'Tutor';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e1b4b] transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-indigo-800">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="TABSERA" className="h-10 w-auto" onError={(e) => e.target.style.display = 'none'} />
              <div>
                <span className="text-lg font-bold text-white block leading-none">TABSERA</span>
                <span className="text-xs text-indigo-300 tracking-wider">TUTOR PORTAL</span>
              </div>
            </Link>
          </div>

          {/* User Info Card */}
          <div className="p-4 mx-3 mt-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl border border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{getUserName()}</p>
                <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 px-3">Menu</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Links */}
          <div className="p-4 border-t border-indigo-800">
            <Link to="/courses" className="flex items-center gap-3 px-4 py-2 text-indigo-300 hover:text-white transition-colors">
              <BookOpen size={18} />
              <span className="text-sm">Browse Courses</span>
              <ExternalLink size={14} className="ml-auto" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors mt-2"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Tutor Portal</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials()}
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{getUserName()}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/tutor/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User size={16} /> My Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TutorLayout;
