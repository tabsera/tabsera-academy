/**
 * Admin API Service
 * Handles admin operations for courses and learning packs management
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
    const { search, packId, status, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    return apiClient.get('/admin/courses', {
      search,
      packId,
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
   * Generate AI image for course using Seedream
   */
  async generateCourseImage(id, customPrompt = null) {
    return apiClient.post(`/admin/courses/${id}/generate-image`, { customPrompt });
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
  // LEARNING PACKS
  // ============================================

  /**
   * Get all learning packs (admin view)
   */
  async getPacks(params = {}) {
    const { search, status, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    return apiClient.get('/admin/packs', {
      search,
      status,
      limit,
      offset,
      sortBy,
      sortOrder,
    });
  },

  /**
   * Get single learning pack by ID with courses and tuition packs
   */
  async getPack(id) {
    return apiClient.get(`/admin/packs/${id}`);
  },

  /**
   * Create a new learning pack
   */
  async createPack(data) {
    return apiClient.post('/admin/packs', data);
  },

  /**
   * Update a learning pack
   */
  async updatePack(id, data) {
    return apiClient.put(`/admin/packs/${id}`, data);
  },

  /**
   * Delete a learning pack
   */
  async deletePack(id) {
    return apiClient.delete(`/admin/packs/${id}`);
  },

  /**
   * Generate AI image for learning pack using Seedream
   */
  async generatePackImage(id, customPrompt = null) {
    return apiClient.post(`/admin/packs/${id}/generate-image`, { customPrompt });
  },

  /**
   * Update courses assigned to a learning pack
   */
  async updatePackCourses(id, courseIds) {
    return apiClient.put(`/admin/packs/${id}/courses`, { courseIds });
  },

  /**
   * Update tuition packs assigned to a learning pack
   */
  async updatePackTuitionPacks(id, tuitionPackIds) {
    return apiClient.put(`/admin/packs/${id}/tuition-packs`, { tuitionPackIds });
  },

  /**
   * Duplicate a learning pack
   */
  async duplicatePack(id) {
    return apiClient.post(`/admin/packs/${id}/duplicate`);
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
    const { userId, learningPackId, courseId, status, search, limit = 50, offset = 0 } = params;
    return apiClient.get('/admin/enrollments', {
      userId,
      learningPackId,
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

  // ============================================
  // TUTOR MANAGEMENT
  // ============================================

  /**
   * Get all tutor applications
   */
  async getTutors(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/tutors${query ? `?${query}` : ''}`);
  },

  /**
   * Get tutor details
   */
  async getTutor(id) {
    return apiClient.get(`/admin/tutors/${id}`);
  },

  /**
   * Get tutor statistics
   */
  async getTutorStats() {
    return apiClient.get('/admin/tutors/stats');
  },

  /**
   * Approve a tutor application
   */
  async approveTutor(id, options = {}) {
    return apiClient.post(`/admin/tutors/${id}/approve`, options);
  },

  /**
   * Reject a tutor application
   */
  async rejectTutor(id, data = {}) {
    return apiClient.post(`/admin/tutors/${id}/reject`, data);
  },

  /**
   * Suspend an active tutor
   */
  async suspendTutor(id, data = {}) {
    return apiClient.post(`/admin/tutors/${id}/suspend`, data);
  },

  /**
   * Reactivate a suspended tutor
   */
  async reactivateTutor(id) {
    return apiClient.post(`/admin/tutors/${id}/reactivate`);
  },

  /**
   * Add courses to a tutor
   */
  async addTutorCourses(tutorId, courseIds, options = {}) {
    return apiClient.post(`/admin/tutors/${tutorId}/courses`, { courseIds, ...options });
  },

  /**
   * Remove a course from a tutor
   */
  async removeTutorCourse(tutorId, courseId) {
    return apiClient.delete(`/admin/tutors/${tutorId}/courses/${courseId}`);
  },

  // ============================================
  // TUITION PACKS
  // ============================================

  /**
   * Get all tuition packs
   */
  async getTuitionPacks() {
    return apiClient.get('/admin/tuition-packs');
  },

  /**
   * Create a tuition pack
   */
  async createTuitionPack(data) {
    return apiClient.post('/admin/tuition-packs', data);
  },

  /**
   * Update a tuition pack
   */
  async updateTuitionPack(id, data) {
    return apiClient.put(`/admin/tuition-packs/${id}`, data);
  },

  /**
   * Delete a tuition pack
   */
  async deleteTuitionPack(id) {
    return apiClient.delete(`/admin/tuition-packs/${id}`);
  },

  /**
   * Assign tuition pack to a student
   */
  async assignTuitionPack(packId, userId, notes) {
    return apiClient.post(`/admin/tuition-packs/${packId}/assign`, { userId, notes });
  },

  /**
   * Get tuition pack purchases
   */
  async getTuitionPurchases(params = {}) {
    return apiClient.get('/admin/tuition-purchases', params);
  },

  /**
   * Get tuition purchase statistics
   */
  async getTuitionPurchasesStats() {
    return apiClient.get('/admin/tuition-purchases/stats');
  },

  // ============================================
  // SYSTEM SETTINGS
  // ============================================

  /**
   * Get all system settings
   */
  async getSettings() {
    return apiClient.get('/admin/settings');
  },

  /**
   * Get a specific system setting
   */
  async getSetting(key) {
    return apiClient.get(`/admin/settings/${key}`);
  },

  /**
   * Update a system setting
   */
  async updateSetting(key, value, description) {
    return apiClient.put(`/admin/settings/${key}`, { value, description });
  },

  /**
   * Update multiple settings at once
   */
  async updateSettings(settings) {
    return apiClient.post('/admin/settings/bulk', { settings });
  },
};

export default adminApi;
