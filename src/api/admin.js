/**
 * Admin API Service
 * Handles admin operations for courses and tracks management
 */

import apiClient from './client';

export const adminApi = {
  // ============================================
  // COURSES
  // ============================================

  /**
   * Get all courses (admin view)
   */
  async getCourses(params = {}) {
    const { search, trackId, status, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    return apiClient.get('/admin/courses', {
      search,
      trackId,
      status,
      limit,
      offset,
      sortBy,
      sortOrder,
    });
  },

  /**
   * Get single course by ID
   */
  async getCourse(id) {
    return apiClient.get(`/admin/courses/${id}`);
  },

  /**
   * Create a new course
   */
  async createCourse(data) {
    return apiClient.post('/admin/courses', data);
  },

  /**
   * Update a course
   */
  async updateCourse(id, data) {
    return apiClient.put(`/admin/courses/${id}`, data);
  },

  /**
   * Delete a course
   */
  async deleteCourse(id) {
    return apiClient.delete(`/admin/courses/${id}`);
  },

  /**
   * Duplicate a course
   */
  async duplicateCourse(id) {
    return apiClient.post(`/admin/courses/${id}/duplicate`);
  },

  /**
   * Bulk action on courses
   */
  async bulkActionCourses(action, courseIds) {
    return apiClient.post('/admin/courses/bulk-action', { action, courseIds });
  },

  /**
   * Sync courses from edX platform
   * Only imports missing courses (skips existing)
   */
  async syncEdxCourses() {
    return apiClient.post('/admin/courses/sync-edx');
  },

  // ============================================
  // TRACKS
  // ============================================

  /**
   * Get all tracks (admin view)
   */
  async getTracks(params = {}) {
    const { search, status, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    return apiClient.get('/admin/tracks', {
      search,
      status,
      limit,
      offset,
      sortBy,
      sortOrder,
    });
  },

  /**
   * Get single track by ID with courses
   */
  async getTrack(id) {
    return apiClient.get(`/admin/tracks/${id}`);
  },

  /**
   * Create a new track
   */
  async createTrack(data) {
    return apiClient.post('/admin/tracks', data);
  },

  /**
   * Update a track
   */
  async updateTrack(id, data) {
    return apiClient.put(`/admin/tracks/${id}`, data);
  },

  /**
   * Delete a track
   */
  async deleteTrack(id) {
    return apiClient.delete(`/admin/tracks/${id}`);
  },

  /**
   * Update courses assigned to a track
   */
  async updateTrackCourses(id, courseIds) {
    return apiClient.put(`/admin/tracks/${id}/courses`, { courseIds });
  },

  /**
   * Duplicate a track
   */
  async duplicateTrack(id) {
    return apiClient.post(`/admin/tracks/${id}/duplicate`);
  },

  // ============================================
  // DASHBOARD
  // ============================================

  /**
   * Get admin dashboard stats
   */
  async getStats() {
    return apiClient.get('/admin/stats');
  },

  // ============================================
  // UPLOADS
  // ============================================

  /**
   * Upload an image
   * @param {File} file - The file to upload
   * @param {string} folder - The folder to upload to (tracks, courses)
   */
  async uploadImage(file, folder = 'general') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return apiClient.upload('/upload/image', formData);
  },

  /**
   * Delete an uploaded image
   */
  async deleteImage(url) {
    return apiClient.delete('/upload/image', { url });
  },

  // ============================================
  // USERS
  // ============================================

  /**
   * Get all users (admin view)
   */
  async getUsers(params = {}) {
    const { role, status, centerId, search, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    return apiClient.get('/admin/users', {
      role,
      status,
      centerId,
      search,
      limit,
      offset,
      sortBy,
      sortOrder,
    });
  },

  /**
   * Get single user by ID
   */
  async getUser(id) {
    return apiClient.get(`/admin/users/${id}`);
  },

  /**
   * Create a new user
   */
  async createUser(data) {
    return apiClient.post('/admin/users', data);
  },

  /**
   * Update a user
   */
  async updateUser(id, data) {
    return apiClient.put(`/admin/users/${id}`, data);
  },

  /**
   * Delete a user
   */
  async deleteUser(id) {
    return apiClient.delete(`/admin/users/${id}`);
  },

  /**
   * Send password reset email to user
   */
  async resetUserPassword(id) {
    return apiClient.post(`/admin/users/${id}/reset-password`);
  },

  /**
   * Send password reset emails to multiple users
   */
  async bulkResetPasswords(userIds) {
    return apiClient.post('/admin/users/bulk-reset-password', { userIds });
  },

  // ============================================
  // ENROLLMENTS
  // ============================================

  /**
   * Get all enrollments
   */
  async getEnrollments(params = {}) {
    const { userId, trackId, courseId, status, search, limit = 50, offset = 0 } = params;
    return apiClient.get('/admin/enrollments', {
      userId,
      trackId,
      courseId,
      status,
      search,
      limit,
      offset,
    });
  },

  /**
   * Create an enrollment
   */
  async createEnrollment(data) {
    return apiClient.post('/admin/enrollments', data);
  },

  /**
   * Bulk enroll students
   */
  async bulkEnroll(data) {
    return apiClient.post('/admin/enrollments/bulk', data);
  },

  /**
   * Delete an enrollment
   */
  async deleteEnrollment(id) {
    return apiClient.delete(`/admin/enrollments/${id}`);
  },

  // ============================================
  // LEARNING CENTERS
  // ============================================

  /**
   * Get all learning centers
   */
  async getCenters() {
    return apiClient.get('/admin/centers');
  },
};

export default adminApi;
