/**
 * Tutor API Service
 * Handles tutor registration, profile management, and session booking
 */

import apiClient from './client';

export const tutorsApi = {
  // ============================================
  // TUTOR REGISTRATION & PROFILE
  // ============================================

  /**
   * Register as a tutor
   * @param {Object} data - Registration data (bio, headline, timezone, courses)
   */
  async register(data) {
    return apiClient.post('/tutors/register', data);
  },

  /**
   * Get current tutor's profile
   */
  async getProfile() {
    return apiClient.get('/tutors/profile');
  },

  /**
   * Update tutor profile
   */
  async updateProfile(data) {
    return apiClient.put('/tutors/profile', data);
  },

  // ============================================
  // CERTIFICATIONS
  // ============================================

  /**
   * Upload a certification document
   * @param {File} file - The file to upload
   * @param {Object} data - Certification data (title, institution)
   */
  async uploadCertification(file, data) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'certifications');
    if (data.title) formData.append('title', data.title);
    if (data.institution) formData.append('institution', data.institution);

    return apiClient.upload('/tutors/certifications', formData);
  },

  /**
   * Delete a certification
   */
  async deleteCertification(id) {
    return apiClient.delete(`/tutors/certifications/${id}`);
  },

  // ============================================
  // COURSES
  // ============================================

  /**
   * Get tutor's assigned courses
   */
  async getCourses() {
    return apiClient.get('/tutors/courses');
  },

  /**
   * Add courses to profile
   */
  async addCourses(courseIds) {
    return apiClient.post('/tutors/courses', { courseIds });
  },

  // ============================================
  // AVAILABILITY
  // ============================================

  /**
   * Get tutor's availability
   */
  async getAvailability() {
    return apiClient.get('/tutors/availability');
  },

  /**
   * Set tutor's availability slots
   * @param {Array} slots - Array of { dayOfWeek, startTime, endTime }
   */
  async setAvailability(slots) {
    return apiClient.post('/tutors/availability', { slots });
  },

  // ============================================
  // SESSIONS (FOR TUTORS)
  // ============================================

  /**
   * Get tutor's sessions
   */
  async getSessions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/tutors/sessions${query ? `?${query}` : ''}`);
  },

  /**
   * Update a session (add notes, complete)
   */
  async updateSession(id, data) {
    return apiClient.put(`/tutors/sessions/${id}`, data);
  },

  // ============================================
  // PUBLIC: BROWSE TUTORS (FOR STUDENTS)
  // ============================================

  /**
   * List approved tutors
   */
  async listTutors(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/tutors${query ? `?${query}` : ''}`);
  },

  /**
   * Get tutor details
   */
  async getTutor(id) {
    return apiClient.get(`/tutors/${id}`);
  },

  /**
   * Get available booking slots for a tutor on a specific date
   */
  async getAvailableSlots(tutorId, date, studentTimezone) {
    const params = new URLSearchParams({ date });
    if (studentTimezone) params.append('studentTimezone', studentTimezone);
    return apiClient.get(`/tutors/${tutorId}/slots?${params}`);
  },
};

export default tutorsApi;
