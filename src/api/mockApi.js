/**
 * Mock API Service
 * Simulates backend API calls with mock data
 * Enable by setting VITE_ENABLE_MOCK_API=true in .env
 */

import {
  demoUsers,
  courses,
  tracks,
  learningCenters,
  studentEnrollments,
  studentPayments,
  studentCertificates,
  adminDashboardStats,
  settlements,
  centerRevenueData,
  centerStudents,
  allUsers,
  partnerApplications,
  recentActivity,
  validatePromoCode,
  calculateDiscount,
  getCourseById,
  getTrackById,
  getCenterById,
  getCoursesByTrack,
  courseCurriculum
} from '../utils/mockData';

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Authentication API
export const mockAuthApi = {
  async login(email, password) {
    await delay(800);

    // Check demo users
    const users = Object.values(demoUsers);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        token: `mock_token_${generateId()}`,
        refreshToken: `mock_refresh_${generateId()}`
      };
    }

    throw new Error('Invalid email or password');
  },

  async register(data) {
    await delay(1000);

    // Check if email already exists
    const users = Object.values(demoUsers);
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: `user-${generateId()}`,
      email: data.email,
      name: data.name,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      phone: data.phone || '',
      centerId: data.centerId || null,
      centerName: data.centerId ? getCenterById(data.centerId)?.name : null,
      enrolledTracks: [],
      enrolledCourses: [],
      completedCourses: [],
      joinedDate: new Date().toISOString().split('T')[0]
    };

    return {
      success: true,
      user: newUser,
      token: `mock_token_${generateId()}`,
      refreshToken: `mock_refresh_${generateId()}`
    };
  },

  async validateToken(token) {
    await delay(300);

    if (token && token.startsWith('mock_token_')) {
      // Return a default user for demo purposes
      const { password: _, ...user } = demoUsers.student;
      return { success: true, user };
    }

    throw new Error('Invalid token');
  },

  async forgotPassword(email) {
    await delay(800);

    const users = Object.values(demoUsers);
    const user = users.find(u => u.email === email);

    if (user) {
      return { success: true, message: 'Password reset email sent' };
    }

    // Don't reveal if email exists or not for security
    return { success: true, message: 'If this email exists, you will receive a reset link' };
  },

  async resetPassword(token, newPassword) {
    await delay(800);
    return { success: true, message: 'Password updated successfully' };
  },

  async updateProfile(userId, data) {
    await delay(600);
    return { success: true, user: { ...data, id: userId } };
  },

  async changePassword(userId, currentPassword, newPassword) {
    await delay(600);
    return { success: true, message: 'Password changed successfully' };
  }
};

// Mock Courses API
export const mockCoursesApi = {
  async getAll(filters = {}) {
    await delay(400);

    let filteredCourses = [...courses];

    if (filters.trackId) {
      filteredCourses = filteredCourses.filter(c => c.trackId === filters.trackId);
    }

    if (filters.category) {
      filteredCourses = filteredCourses.filter(c => c.category === filters.category);
    }

    if (filters.level) {
      filteredCourses = filteredCourses.filter(c => c.level === filters.level);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCourses = filteredCourses.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    return { success: true, courses: filteredCourses };
  },

  async getById(id) {
    await delay(300);
    const course = getCourseById(id);

    if (course) {
      return { success: true, course };
    }

    throw new Error('Course not found');
  },

  async getCurriculum(courseId) {
    await delay(400);
    const curriculum = courseCurriculum[courseId];

    if (curriculum) {
      return { success: true, curriculum };
    }

    // Return empty curriculum for courses without one
    return { success: true, curriculum: { modules: [] } };
  }
};

// Mock Tracks API
export const mockTracksApi = {
  async getAll() {
    await delay(300);
    return { success: true, tracks };
  },

  async getById(id) {
    await delay(300);
    const track = getTrackById(id);

    if (track) {
      const trackCourses = getCoursesByTrack(id);
      return { success: true, track, courses: trackCourses };
    }

    throw new Error('Track not found');
  }
};

// Mock Learning Centers API
export const mockCentersApi = {
  async getAll() {
    await delay(400);
    return { success: true, centers: learningCenters };
  },

  async getById(id) {
    await delay(300);
    const center = getCenterById(id);

    if (center) {
      return { success: true, center };
    }

    throw new Error('Learning center not found');
  }
};

// Mock Student API
export const mockStudentApi = {
  async getEnrollments(studentId) {
    await delay(400);
    const enrollments = studentEnrollments.filter(e => e.studentId === studentId);
    return { success: true, enrollments };
  },

  async getPayments(studentId) {
    await delay(400);
    const payments = studentPayments.filter(p => p.studentId === studentId);
    return { success: true, payments };
  },

  async getCertificates(studentId) {
    await delay(400);
    const certificates = studentCertificates.filter(c => c.studentId === studentId);
    return { success: true, certificates };
  },

  async enrollInTrack(studentId, trackId) {
    await delay(800);

    const track = getTrackById(trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    const newEnrollment = {
      id: `enroll-${generateId()}`,
      studentId,
      type: 'track',
      itemId: trackId,
      title: track.title,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'in_progress',
      completedLessons: 0,
      totalLessons: track.coursesCount * 20,
      lastAccessDate: new Date().toISOString().split('T')[0],
      courses: []
    };

    return { success: true, enrollment: newEnrollment };
  },

  async enrollInCourse(studentId, courseId) {
    await delay(800);

    const course = getCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const newEnrollment = {
      id: `enroll-${generateId()}`,
      studentId,
      type: 'course',
      itemId: courseId,
      title: course.title,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      completedLessons: 0,
      totalLessons: course.lessons,
      lastAccessDate: new Date().toISOString().split('T')[0]
    };

    return { success: true, enrollment: newEnrollment };
  },

  async updateProgress(enrollmentId, progress) {
    await delay(400);
    return { success: true, progress };
  }
};

// Mock Admin API
export const mockAdminApi = {
  async getDashboardStats() {
    await delay(400);
    return { success: true, stats: adminDashboardStats };
  },

  async getRecentActivity() {
    await delay(300);
    return { success: true, activity: recentActivity };
  },

  async getUsers(filters = {}) {
    await delay(400);

    let filteredUsers = [...allUsers];

    if (filters.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }

    if (filters.centerId) {
      filteredUsers = filteredUsers.filter(u => u.centerId === filters.centerId);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    return { success: true, users: filteredUsers };
  },

  async getPartnerApplications() {
    await delay(400);
    return { success: true, applications: partnerApplications };
  },

  async updateApplicationStatus(applicationId, status) {
    await delay(600);
    return { success: true, applicationId, status };
  },

  async getSettlements(filters = {}) {
    await delay(400);

    let filteredSettlements = [...settlements];

    if (filters.centerId) {
      filteredSettlements = filteredSettlements.filter(s => s.centerId === filters.centerId);
    }

    if (filters.status) {
      filteredSettlements = filteredSettlements.filter(s => s.status === filters.status);
    }

    return { success: true, settlements: filteredSettlements };
  },

  async processSettlement(settlementId) {
    await delay(1000);
    return { success: true, settlementId, status: 'completed', paidDate: new Date().toISOString() };
  }
};

// Mock Center Admin API
export const mockCenterApi = {
  async getDashboard(centerId) {
    await delay(400);
    const center = getCenterById(centerId);
    return {
      success: true,
      center,
      stats: {
        students: center?.students || 0,
        courses: center?.courses || 0,
        revenue: centerRevenueData.currentMonth.revenue,
        pendingPayments: centerRevenueData.currentMonth.pendingPayments
      }
    };
  },

  async getRevenue(centerId) {
    await delay(400);
    return { success: true, revenue: centerRevenueData };
  },

  async getStudents(centerId) {
    await delay(400);
    return { success: true, students: centerStudents };
  },

  async getSettlements(centerId) {
    await delay(400);
    const centerSettlements = settlements.filter(s => s.centerId === centerId);
    return { success: true, settlements: centerSettlements };
  },

  async registerStudent(centerId, studentData) {
    await delay(800);

    const newStudent = {
      id: `cs-${generateId()}`,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      enrolledTracks: studentData.trackId ? [getTrackById(studentData.trackId)?.title] : [],
      enrolledCourses: 0,
      progress: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      totalPaid: 0,
      pendingAmount: studentData.trackId ? getTrackById(studentData.trackId)?.price : 0
    };

    return { success: true, student: newStudent };
  }
};

// Mock Checkout API
export const mockCheckoutApi = {
  async validatePromo(code, cartTotal) {
    await delay(300);
    const result = validatePromoCode(code, cartTotal);

    if (result.valid) {
      const discount = calculateDiscount(result.promo, cartTotal);
      return {
        success: true,
        valid: true,
        discount,
        discountPercent: result.promo.type === 'percentage' ? result.promo.discount : null,
        message: `Promo code applied! You save $${discount.toFixed(2)}`
      };
    }

    return { success: true, valid: false, message: result.message };
  },

  async processPayment(paymentData) {
    await delay(1500);

    // Simulate payment processing
    const orderId = `ORD-${Date.now()}-${generateId()}`;

    return {
      success: true,
      orderId,
      status: 'completed',
      message: 'Payment processed successfully',
      receipt: {
        orderId,
        amount: paymentData.amount,
        currency: 'USD',
        method: paymentData.method,
        date: new Date().toISOString(),
        items: paymentData.items
      }
    };
  },

  async getOrderDetails(orderId) {
    await delay(400);

    return {
      success: true,
      order: {
        orderId,
        status: 'completed',
        date: new Date().toISOString(),
        items: [],
        total: 0,
        paymentMethod: 'Credit Card'
      }
    };
  }
};

// Mock Partner Application API
export const mockPartnerApi = {
  async submitApplication(applicationData) {
    await delay(1000);

    const newApplication = {
      id: `app-${generateId()}`,
      ...applicationData,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0]
    };

    return { success: true, application: newApplication };
  }
};

// Mock WaafiPay API
export const mockWaafiPayApi = {
  async initiatePurchase(orderData) {
    await delay(800);

    // In mock mode, we skip HPP redirect and simulate success
    return {
      success: true,
      hppUrl: null, // null triggers mock mode in checkout
      orderId: `WP-${generateId()}`,
      referenceId: orderData.referenceId,
      mock: true
    };
  },

  async getTransactionInfo(referenceId) {
    await delay(400);

    return {
      success: true,
      transaction: {
        transactionId: `TXN-${generateId()}`,
        referenceId: referenceId,
        amount: '0.00',
        currency: 'USD',
        status: 'APPROVED',
        paymentMethod: 'MWALLET_ACCOUNT',
        payerId: '252XXXXXXXXX',
        transactionDate: new Date().toISOString()
      }
    };
  },

  async processRefund(refundData) {
    await delay(600);

    return {
      success: true,
      transactionId: `REF-${generateId()}`,
      referenceId: refundData.referenceId,
      state: 'approved'
    };
  }
};

// Mock Orders API
export const mockOrdersApi = {
  orders: {},

  async createOrder(orderData) {
    await delay(500);

    const referenceId = `ORD-${Date.now().toString(36).toUpperCase()}-${generateId().toUpperCase()}`;
    const order = {
      referenceId,
      ...orderData,
      status: 'pending_payment',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders[referenceId] = order;
    return { success: true, order };
  },

  async getOrder(referenceId) {
    await delay(300);

    const order = this.orders[referenceId];
    if (order) {
      return { success: true, order };
    }
    return { success: false, error: 'Order not found' };
  },

  async updateOrderPayment(referenceId, paymentData) {
    await delay(400);

    if (this.orders[referenceId]) {
      this.orders[referenceId] = {
        ...this.orders[referenceId],
        ...paymentData,
        status: paymentData.status === 'approved' ? 'completed' : 'failed',
        updatedAt: new Date().toISOString()
      };
      return { success: true, order: this.orders[referenceId] };
    }
    return { success: false, error: 'Order not found' };
  },

  async getOrders(filters = {}) {
    await delay(400);

    let orders = Object.values(this.orders);
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { success: true, orders };
  }
};

// Export a unified mock API object
export const mockApi = {
  auth: mockAuthApi,
  courses: mockCoursesApi,
  tracks: mockTracksApi,
  centers: mockCentersApi,
  student: mockStudentApi,
  admin: mockAdminApi,
  center: mockCenterApi,
  checkout: mockCheckoutApi,
  partner: mockPartnerApi,
  waafipay: mockWaafiPayApi,
  orders: mockOrdersApi
};

export default mockApi;
