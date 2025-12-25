/**
 * Authentication Context
 * Provides auth state and actions throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/auth';
import apiClient from '../api/client';

// User roles
export const ROLES = {
  STUDENT: 'student',
  CENTER_ADMIN: 'center_admin',
  TABSERA_ADMIN: 'tabsera_admin',
};

// Role-based redirect paths
const ROLE_REDIRECTS = {
  [ROLES.STUDENT]: '/student/dashboard',
  [ROLES.CENTER_ADMIN]: '/center/dashboard',
  [ROLES.TABSERA_ADMIN]: '/admin/dashboard',
};

// Create context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Validate token with server
          const response = await authApi.getCurrentUser();
          setUser(response.user || response);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear storage
          console.error('Auth init error:', error);
          apiClient.clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password, rememberMe = false) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password, rememberMe);
      setUser(response.user);
      setIsAuthenticated(true);

      // Redirect based on role
      const role = response.user.role;
      const redirectPath = location.state?.from?.pathname || ROLE_REDIRECTS[role] || '/';
      navigate(redirectPath, { replace: true });

      return { success: true, user: response.user };
    } catch (error) {
      // Check if email verification is required
      if (error.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          email: error.email,
          error: error.message
        };
      }
      setError(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location.state]);

  // Register function
  const register = useCallback(async (data) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.register(data);
      return { success: true, message: response.message };
    } catch (error) {
      setError(error.message || 'Registration failed');
      return { success: false, error: error.message, errors: error.errors };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token, password, passwordConfirmation) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.resetPassword(token, password, passwordConfirmation);
      return { success: true, message: response.message };
    } catch (error) {
      setError(error.message || 'Failed to reset password');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify email function
  const verifyEmail = useCallback(async (token) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.verifyEmail(token);

      // If verification returns user and token, log them in
      if (response.user && response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
      }

      return { success: true, message: response.message, user: response.user };
    } catch (error) {
      setError(error.message || 'Failed to verify email');
      return { success: false, error: error.message, expired: error.expired };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resend verification email function
  const resendVerification = useCallback(async (email) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.resendVerification(email);
      return { success: true, message: response.message };
    } catch (error) {
      setError(error.message || 'Failed to send verification email');
      return { success: false, error: error.message, alreadyVerified: error.alreadyVerified };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (data) => {
    setError(null);

    try {
      const response = await authApi.updateProfile(data);
      setUser(response.user || response);
      localStorage.setItem('user', JSON.stringify(response.user || response));
      return { success: true, user: response.user || response };
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    updateProfile,
    hasRole,
    hasAnyRole,
    clearError,
    ROLES,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export context for edge cases
export { AuthContext };
export default AuthProvider;
