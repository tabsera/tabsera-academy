import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Building2, Shield, LogOut, ChevronDown, GraduationCap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowPortalMenu(false);
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = user.role?.toLowerCase();
    if (role === 'tabsera_admin') return '/admin/dashboard';
    if (role === 'center_admin') return '/center/dashboard';
    if (role === 'tutor') return '/tutor/dashboard';
    return '/student/dashboard';
  };

  // Check if user is a tutor
  const isTutor = user?.role?.toLowerCase() === 'tutor';
  const isStudent = user?.role?.toLowerCase() === 'student';

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
              to="/tuition"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/tuition') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Tuition
            </Link>
            <Link
              to="/tutors"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/tutors') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Tutors
            </Link>
            <Link
              to="/centers"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/centers') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Centers
            </Link>
            <Link
              to="/partner"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/partner') ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Become a Partner
            </Link>
            <Link
              to="/tutor/register"
              className={`text-sm font-medium transition-colors hover:text-green-600 ${isActive('/tutor/register') ? 'text-green-600' : 'text-gray-700'}`}
            >
              Become a Tutor
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

            {/* User Menu / Portal Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPortalMenu(!showPortalMenu)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {isAuthenticated ? (
                  <>
                    <div className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${showPortalMenu ? 'rotate-180' : ''}`} />
                  </>
                ) : (
                  <>
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User size={20} />
                    </div>
                    <span>Login</span>
                  </>
                )}
              </button>

              {showPortalMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPortalMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">
                            {user?.firstName || user?.first_name || 'User'} {user?.lastName || user?.last_name || ''}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {user?.role?.replace('_', ' ') || 'Student'}
                          </span>
                        </div>

                        {/* Dashboard Link */}
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User size={16} />
                          My Dashboard
                        </Link>

                        {/* Role-specific links */}
                        {isStudent && (
                          <>
                            <Link
                              to="/student/my-learning"
                              onClick={() => setShowPortalMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Building2 size={16} />
                              My Learning
                            </Link>
                            <Link
                              to="/tutor/register"
                              onClick={() => setShowPortalMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50"
                            >
                              <GraduationCap size={16} />
                              Become a Tutor
                            </Link>
                          </>
                        )}

                        {isTutor && (
                          <Link
                            to="/tutor/dashboard"
                            onClick={() => setShowPortalMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <GraduationCap size={16} />
                            Tutor Portal
                          </Link>
                        )}

                        <div className="border-t border-gray-100 my-2"></div>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Student</p>
                        <Link
                          to="/login"
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User size={16} />
                          Student Login
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          <User size={16} />
                          Create Account
                        </Link>
                        <div className="border-t border-gray-100 my-2"></div>
                        <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Partner Portals</p>
                        <Link
                          to="/login"
                          state={{ redirectTo: '/tutor/dashboard' }}
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <GraduationCap size={16} />
                          Tutor Portal
                        </Link>
                        <Link
                          to="/login"
                          state={{ redirectTo: '/center/dashboard' }}
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Building2 size={16} />
                          Learning Center Portal
                        </Link>
                        <Link
                          to="/login"
                          state={{ redirectTo: '/admin/dashboard' }}
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Shield size={16} />
                          TABSERA Admin Portal
                        </Link>
                      </>
                    )}
                  </div>
                </>
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
            <Link to="/tuition" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Tuition
            </Link>
            <Link to="/tutors" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Tutors
            </Link>
            <Link to="/centers" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Centers
            </Link>
            <Link to="/partner" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Become a Partner
            </Link>
            <Link to="/tutor/register" className="block px-3 py-3 text-base font-medium text-green-600 hover:bg-green-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Become a Tutor
            </Link>
            <Link to="/cart" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>

            <div className="border-t border-gray-100 my-2 pt-2">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-3 bg-gray-50 rounded-md mb-2">
                    <p className="font-semibold text-gray-900">
                      {user?.firstName || user?.first_name || 'User'} {user?.lastName || user?.last_name || ''}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    className="block px-3 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  {isStudent && (
                    <Link
                      to="/tutor/register"
                      className="block px-3 py-3 text-base font-medium text-green-600 hover:bg-green-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Become a Tutor
                    </Link>
                  )}
                  {isTutor && (
                    <Link
                      to="/tutor/dashboard"
                      className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tutor Portal
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Account</p>
                  <Link to="/login" className="block px-3 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                    Student Login
                  </Link>
                  <Link to="/register" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                    Create Account
                  </Link>
                  <p className="px-3 py-2 mt-2 text-xs font-semibold text-gray-400 uppercase">Partner Portals</p>
                  <Link to="/login" state={{ redirectTo: '/tutor/dashboard' }} className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                    Tutor Portal
                  </Link>
                  <Link to="/login" state={{ redirectTo: '/center/dashboard' }} className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                    Learning Center Portal
                  </Link>
                  <Link to="/login" state={{ redirectTo: '/admin/dashboard' }} className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                    Admin Portal
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
