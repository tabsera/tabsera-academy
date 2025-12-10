/**
 * Authentication API Service
 * Handles login, registration, password reset, etc.
 */

import apiClient from './client';

export const authApi = {
  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @param {boolean} rememberMe 
   * @returns {Promise<{user, access_token, refresh_token}>}
   */
  async login(email, password, rememberMe = false) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    }, false);

    // Store tokens
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    if (response.refresh_token) {
      apiClient.setRefreshToken(response.refresh_token);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Register new user (student self-registration)
   * @param {Object} data - Registration data
   * @returns {Promise<{user, message}>}
   */
  async register(data) {
    return apiClient.post('/auth/register', {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      country: data.country,
      center_id: data.centerId || null,
    }, false);
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    } finally {
      apiClient.clearTokens();
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<{user}>}
   */
  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  /**
   * Request password reset email
   * @param {string} email 
   * @returns {Promise<{message}>}
   */
  async forgotPassword(email) {
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
    return apiClient.post('/auth/verify-email', { token }, false);
  },

  /**
   * Resend verification email
   * @param {string} email 
   * @returns {Promise<{message}>}
   */
  async resendVerification(email) {
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
    return apiClient.put('/auth/profile', data);
  },

  /**
   * Check if token is valid
   * @returns {Promise<boolean>}
   */
  async validateToken() {
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default authApi;
