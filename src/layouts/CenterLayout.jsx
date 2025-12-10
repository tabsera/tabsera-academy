import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Users, DollarSign, Receipt,
  Settings, Bell, Menu, LogOut, BookOpen, BarChart3, Clock,
  FileText, UserCheck, Calendar, TrendingUp, Building2
} from 'lucide-react';

const CenterLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/center/dashboard') {
      return location.pathname === '/center' || location.pathname === '/center/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { section: 'Overview', items: [
      { path: '/center/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Finance', items: [
      { path: '/center/revenue', icon: DollarSign, label: 'Revenue Dashboard' },
      { path: '/center/fees', icon: Users, label: 'Student Fees' },
      { path: '/center/settlements', icon: Receipt, label: 'Settlement History' },
    ]},
    { section: 'Academic', items: [
      { path: '/center/progress', icon: BarChart3, label: 'Progress Tracker' },
      { path: '/center/students', icon: Users, label: 'Students' },
      { path: '/center/classrooms', icon: BookOpen, label: 'Classrooms' },
    ]},
    { section: 'Settings', items: [
      { path: '/center/settings', icon: Settings, label: 'Center Settings' },
    ]},
  ];

  // Sample center info
  const centerInfo = {
    name: 'Aqoonyahan School',
    location: 'Hargeisa, Somalia',
    logo: 'AS'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-800">
            <Link to="/center/dashboard" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block leading-none">TABSERA</span>
                <span className="text-xs text-gray-400 tracking-wider">LEARNING CENTER</span>
              </div>
            </Link>
          </div>

          {/* Center Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {centerInfo.logo}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{centerInfo.name}</p>
                <p className="text-xs text-gray-400">{centerInfo.location}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((section, idx) => (
              <div key={idx} className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  {section.section}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-600/20 text-blue-400 font-medium'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                AH
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Ahmed Hassan</p>
                <p className="text-xs text-gray-400">Center Admin</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-3">
              <Link 
                to="/admin/dashboard" 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Building2 size={16} />
                Switch to Admin Portal
              </Link>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CenterLayout;
