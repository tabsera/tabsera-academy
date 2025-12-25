/**
 * Authentication API Service
 * Handles login, registration, password reset, etc.
 * Uses mock API when VITE_ENABLE_MOCK_API is true
 */

import apiClient from './client';
import { mockAuthApi } from './mockApi';

// Check if mock API is enabled
const useMockApi = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

export const authApi = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe
   * @returns {Promise<{user, access_token, refresh_token}>}
   */
  async login(email, password, rememberMe = false) {
    if (useMockApi) {
      const response = await mockAuthApi.login(email, password);

      // Store tokens and user
      if (response.token) {
        apiClient.setToken(response.token);
      }
      if (response.refreshToken) {
        apiClient.setRefreshToken(response.refreshToken);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    }

    const response = await apiClient.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    }, false);

    // Store tokens (backend returns 'token', normalize to access_token)
    const accessToken = response.access_token || response.token;
    if (accessToken) {
      apiClient.setToken(accessToken);
    }
    if (response.refresh_token) {
      apiClient.setRefreshToken(response.refresh_token);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return { ...response, access_token: accessToken };
  },

  /**
   * Register new user (student self-registration)
   * @param {Object} data - Registration data
   * @returns {Promise<{user, message}>}
   */
  async register(data) {
    if (useMockApi) {
      const response = await mockAuthApi.register({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        centerId: data.centerId
      });

      return { ...response, message: 'Registration successful! Please login.' };
    }

    return apiClient.post('/auth/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      country: data.country,
      centerId: data.centerId || null,
    }, false);
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      if (!useMockApi) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    } finally {
      apiClient.clearTokens();
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<{user}>}
   */
  async getCurrentUser() {
    if (useMockApi) {
      const token = apiClient.getToken();
      const response = await mockAuthApi.validateToken(token);
      return response;
    }

    return apiClient.get('/auth/me');
  },

  /**
   * Request password reset email
   * @param {string} email
   * @returns {Promise<{message}>}
   */
  async forgotPassword(email) {
    if (useMockApi) {
      return mockAuthApi.forgotPassword(email);
    }

    return apiClient.post('/auth/forgot-password', { email }, false);
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} password
   * @param {string} passwordConfirmation
   * @returns {Promise<{message}>}
   */
  async resetPassword(token, password, passwordConfirmation) {
    if (useMockApi) {
      return mockAuthApi.resetPassword(token, password);
    }

    return apiClient.post('/auth/reset-password', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    }, false);
  },

  /**
   * Verify email with token
   * @param {string} token
   * @returns {Promise<{message}>}
   */
  async verifyEmail(token) {
    if (useMockApi) {
      return { success: true, message: 'Email verified successfully' };
    }

    return apiClient.post('/auth/verify-email', { token }, false);
  },

  /**
   * Resend verification email
   * @param {string} email
   * @returns {Promise<{message}>}
   */
  async resendVerification(email) {
    if (useMockApi) {
      return { success: true, message: 'Verification email sent' };
    }

    return apiClient.post('/auth/resend-verification', { email }, false);
  },

  /**
   * Change password (authenticated user)
   * @param {string} currentPassword
   * @param {string} newPassword
   * @param {string} newPasswordConfirmation
   * @returns {Promise<{message}>}
   */
  async changePassword(currentPassword, newPassword, newPasswordConfirmation) {
    if (useMockApi) {
      return mockAuthApi.changePassword(null, currentPassword, newPassword);
    }

    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
  },

  /**
   * Update user profile
   * @param {Object} data
   * @returns {Promise<{user}>}
   */
  async updateProfile(data) {
    if (useMockApi) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await mockAuthApi.updateProfile(storedUser.id, data);

      if (response.success) {
        const updatedUser = { ...storedUser, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      }

      return response;
    }

    return apiClient.put('/auth/profile', data);
  },

  /**
   * Check if token is valid
   * @returns {Promise<boolean>}
   */
  async validateToken() {
    if (useMockApi) {
      const token = apiClient.getToken();
      try {
        await mockAuthApi.validateToken(token);
        return true;
      } catch {
        return false;
      }
    }

    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default authApi;
