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
   * Upload avatar photo
   * @param {File} file - The image file to upload
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('folder', 'avatars');  // Must be before 'file' for multer
    formData.append('file', file);

    return apiClient.upload('/tutors/avatar', formData);
  },

  /**
   * Upload a certification document
   * @param {File} file - The file to upload
   * @param {Object} data - Certification data (title, institution)
   */
  async uploadCertification(file, data) {
    const formData = new FormData();
    formData.append('folder', 'certifications');  // Must be before 'file' for multer
    if (data.title) formData.append('title', data.title);
    if (data.institution) formData.append('institution', data.institution);
    formData.append('file', file);

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
  // UNAVAILABILITY (TEMPORARY TIME-OFF)
  // ============================================

  /**
   * Get current and upcoming unavailability periods
   */
  async getUnavailability() {
    return apiClient.get('/tutors/unavailability');
  },

  /**
   * Set unavailable for a period
   * @param {Object} data - { preset, startDate, endDate, reason }
   */
  async setUnavailable(data) {
    return apiClient.post('/tutors/unavailability', data);
  },

  /**
   * Resume availability (cancel/end an unavailability period)
   */
  async resumeAvailability(unavailabilityId) {
    return apiClient.delete(`/tutors/unavailability/${unavailabilityId}`);
  },

  /**
   * Get sessions that would be affected by a date range
   */
  async getAffectedSessions(startDate, endDate) {
    return apiClient.get(`/tutors/sessions/affected?startDate=${startDate}&endDate=${endDate}`);
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

  // ============================================
  // STUDENT: SESSION BOOKING
  // ============================================

  /**
   * Book a session with a tutor
   * @param {string} tutorId - Tutor's ID
   * @param {Object} data - Booking data { scheduledAt, courseId?, topic? }
   */
  async bookSession(tutorId, data) {
    return apiClient.post(`/tutors/${tutorId}/book`, data);
  },

  /**
   * Cancel a booked session
   * @param {string} sessionId - Session ID to cancel
   */
  async cancelSession(sessionId) {
    return apiClient.patch(`/tutors/sessions/${sessionId}/cancel`);
  },

  /**
   * Get student's tuition credit summary
   */
  async getStudentCredits() {
    return apiClient.get('/tutors/student/credits');
  },

  /**
   * Get student's tutoring sessions
   * @param {Object} params - Query params { status?, upcoming? }
   */
  async getStudentSessions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/tutors/student/sessions${query ? `?${query}` : ''}`);
  },

  /**
   * Rate a completed session
   * @param {string} sessionId - Session ID
   * @param {Object} data - Rating data { rating, feedback? }
   */
  async rateSession(sessionId, data) {
    return apiClient.post(`/tutors/sessions/${sessionId}/rate`, data);
  },

  // ============================================
  // LIVEKIT VIDEO SESSION
  // ============================================

  /**
   * Join a video session - gets LiveKit access token
   * @param {string} sessionId - Session ID
   * @returns {Promise<{token: string, roomName: string, wsUrl: string, isRecording: boolean, session: Object}>}
   */
  async joinSession(sessionId) {
    return apiClient.post(`/tutors/sessions/${sessionId}/join`);
  },

  /**
   * Leave a video session
   * @param {string} sessionId - Session ID
   * @param {boolean} endSession - If true (and tutor), ends the session completely
   */
  async leaveSession(sessionId, endSession = false) {
    return apiClient.post(`/tutors/sessions/${sessionId}/leave`, { endSession });
  },

  /**
   * Get recording details for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<{recording: Object}>}
   */
  async getRecording(sessionId) {
    return apiClient.get(`/tutors/sessions/${sessionId}/recording`);
  },

  /**
   * Save whiteboard snapshot
   * @param {string} sessionId - Session ID
   * @param {Object} snapshot - tldraw document state
   */
  async saveWhiteboard(sessionId, snapshot) {
    return apiClient.post(`/tutors/sessions/${sessionId}/whiteboard`, { snapshot });
  },

  /**
   * Get whiteboard snapshot
   * @param {string} sessionId - Session ID
   * @returns {Promise<{snapshot: Object}>}
   */
  async getWhiteboard(sessionId) {
    return apiClient.get(`/tutors/sessions/${sessionId}/whiteboard`);
  },
};

export default tutorsApi;
