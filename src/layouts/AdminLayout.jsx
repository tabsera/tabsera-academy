import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Building2, LayoutDashboard, Users, FileText, Receipt,
  CircleDollarSign, Settings, Bell, Menu, X, ChevronDown, LogOut,
  Briefcase, UserPlus, KeyRound, BookOpen, BarChart3, FileCheck, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'TA';
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    return 'TA';
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { section: 'Overview', items: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ]},
    { section: 'Content', items: [
      { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
      { path: '/admin/tracks', icon: Layers, label: 'Learning Tracks' },
    ]},
    { section: 'Partners', items: [
      { path: '/admin/partners', icon: Building2, label: 'Learning Centers' },
      { path: '/admin/contracts', icon: FileText, label: 'Contracts' },
      { path: '/admin/applications', icon: Briefcase, label: 'Applications', badge: 3 },
    ]},
    { section: 'Students', items: [
      { path: '/admin/students', icon: Users, label: 'Student Registry' },
      { path: '/admin/students/enroll', icon: UserPlus, label: 'Enrollment' },
      { path: '/admin/password-reset', icon: KeyRound, label: 'Password Reset' },
    ]},
    { section: 'Finance', items: [
      { path: '/admin/orders', icon: Receipt, label: 'Orders' },
      { path: '/admin/settlements', icon: Receipt, label: 'Settlements', badge: 4 },
      { path: '/admin/settlements/process', icon: FileCheck, label: 'Process Settlement' },
      { path: '/admin/revenue', icon: CircleDollarSign, label: 'Revenue' },
    ]},
    { section: 'System', items: [
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-800">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block leading-none">TABSERA</span>
                <span className="text-xs text-gray-400 tracking-wider">ADMIN PORTAL</span>
              </div>
            </Link>
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
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-600/20 text-blue-400 font-medium'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName || user?.first_name || 'Admin'} {user?.lastName || user?.last_name || ''}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                title="Logout"
              >
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
                to="/center/dashboard" 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Building2 size={16} />
                Switch to Center Portal
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

export default AdminLayout;
