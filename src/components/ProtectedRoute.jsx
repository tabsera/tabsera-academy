/**
 * Protected Route Component
 * Restricts access based on authentication and roles
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wraps routes that require authentication
 * @param {React.ReactNode} children - Child components to render
 * @param {string|string[]} roles - Required role(s) to access the route
 * @param {string} redirectTo - Path to redirect if unauthorized (default: /login)
 */
export function ProtectedRoute({ children, roles, redirectTo = '/login' }) {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if email is verified (unless already on verify-pending page)
  if (user && !user.emailVerified && location.pathname !== '/verify-pending') {
    return <Navigate to="/verify-pending" replace />;
  }

  // Check role requirements
  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!hasAnyRole(allowedRoles)) {
      // User doesn't have required role - redirect to their dashboard
      const roleRedirects = {
        student: '/student/dashboard',
        center_admin: '/center/dashboard',
        tabsera_admin: '/admin/dashboard',
        tutor: '/tutor/dashboard',
      };
      const userDashboard = roleRedirects[user?.role] || '/';
      return <Navigate to={userDashboard} replace />;
    }
  }

  // Authorized - render children
  return children;
}

/**
 * PublicRoute - Redirects authenticated users away from public pages (like login)
 * @param {React.ReactNode} children - Child components to render
 * @param {string} redirectTo - Path to redirect if already authenticated
 */
export function PublicRoute({ children, redirectTo }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Already authenticated - redirect appropriately
  if (isAuthenticated && user) {
    // If email not verified, go to verify-pending page
    if (!user.emailVerified) {
      return <Navigate to="/verify-pending" replace />;
    }

    const roleRedirects = {
      student: '/student/dashboard',
      center_admin: '/center/dashboard',
      tabsera_admin: '/admin/dashboard',
      tutor: '/tutor/dashboard',
    };

    // Use provided redirect or role-based redirect
    const destination = redirectTo ||
                        location.state?.from?.pathname ||
                        roleRedirects[user.role] ||
                        '/';

    return <Navigate to={destination} replace />;
  }

  // Not authenticated - render children (login/register pages)
  return children;
}

/**
 * RoleGuard - Conditionally renders content based on user role
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {string|string[]} roles - Required role(s)
 * @param {React.ReactNode} fallback - Content to render if unauthorized
 */
export function RoleGuard({ children, roles, fallback = null }) {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  if (!hasAnyRole(allowedRoles)) {
    return fallback;
  }

  return children;
}

export default ProtectedRoute;
