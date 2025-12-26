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
};

export default adminApi;
