/**
 * Orders API
 * Handles order creation, retrieval, and status updates
 */

import apiClient from './client';

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  PENDING_PAYMENT: 'pending_payment',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  TIMEOUT: 'timeout',
};

// Generate order reference ID
const generateOrderReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Check if mock API is enabled
const isMockEnabled = () => import.meta.env.VITE_ENABLE_MOCK_API === 'true';

// Local storage key for pending orders (used in mock mode)
const PENDING_ORDERS_KEY = 'tabsera_pending_orders';

/**
 * Get pending orders from local storage (mock mode)
 */
const getPendingOrders = () => {
  try {
    const orders = localStorage.getItem(PENDING_ORDERS_KEY);
    return orders ? JSON.parse(orders) : {};
  } catch {
    return {};
  }
};

/**
 * Save pending order to local storage (mock mode)
 */
const savePendingOrder = (order) => {
  const orders = getPendingOrders();
  orders[order.referenceId] = order;
  localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));
};

/**
 * Update pending order in local storage (mock mode)
 */
const updatePendingOrder = (referenceId, updates) => {
  const orders = getPendingOrders();
  if (orders[referenceId]) {
    orders[referenceId] = { ...orders[referenceId], ...updates };
    localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));
    return orders[referenceId];
  }
  return null;
};

/**
 * Orders API Methods
 */
export const ordersApi = {
  /**
   * Create a new order
   * @param {Object} orderData - Order details
   * @param {Array} orderData.items - Cart items
   * @param {Object} orderData.billingInfo - Billing information
   * @param {string} orderData.paymentMethod - Selected payment method
   * @param {number} orderData.subtotal - Order subtotal
   * @param {number} orderData.discount - Discount amount
   * @param {string} orderData.promoCode - Applied promo code
   * @param {number} orderData.total - Order total
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    const referenceId = generateOrderReference();

    const order = {
      referenceId,
      items: orderData.items,
      billingInfo: orderData.billingInfo,
      paymentMethod: orderData.paymentMethod,
      mobileProvider: orderData.mobileProvider,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      promoCode: orderData.promoCode || null,
      total: orderData.total,
      currency: 'USD',
      status: ORDER_STATUS.PENDING_PAYMENT,
      paymentStatus: PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isMockEnabled()) {
      // Mock mode: save to local storage
      savePendingOrder(order);
      return { success: true, order };
    }

    // Real API call
    try {
      const response = await apiClient.post('/orders', order);
      return { success: true, order: response.order || response };
    } catch (error) {
      console.error('Create order error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get order by reference ID
   * @param {string} referenceId - Order reference ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(referenceId) {
    if (isMockEnabled()) {
      const orders = getPendingOrders();
      const order = orders[referenceId];
      if (order) {
        return { success: true, order };
      }
      return { success: false, error: 'Order not found' };
    }

    try {
      const response = await apiClient.get(`/orders/${referenceId}`);
      return { success: true, order: response.order || response };
    } catch (error) {
      console.error('Get order error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update order payment status
   * @param {string} referenceId - Order reference ID
   * @param {Object} paymentData - Payment details from WaafiPay
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderPayment(referenceId, paymentData) {
    const updates = {
      paymentStatus: paymentData.status,
      transactionId: paymentData.transactionId,
      waafipayOrderId: paymentData.orderId,
      payerId: paymentData.payerId,
      paidAt: paymentData.status === PAYMENT_STATUS.APPROVED ? new Date().toISOString() : null,
      status: paymentData.status === PAYMENT_STATUS.APPROVED
        ? ORDER_STATUS.COMPLETED
        : ORDER_STATUS.FAILED,
      updatedAt: new Date().toISOString(),
    };

    if (isMockEnabled()) {
      const order = updatePendingOrder(referenceId, updates);
      if (order) {
        return { success: true, order };
      }
      return { success: false, error: 'Order not found' };
    }

    try {
      const response = await apiClient.patch(`/orders/${referenceId}/payment`, {
        ...paymentData,
        ...updates,
      });
      return { success: true, order: response.order || response };
    } catch (error) {
      console.error('Update order payment error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's orders
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} List of orders
   */
  async getOrders(filters = {}) {
    if (isMockEnabled()) {
      const allOrders = getPendingOrders();
      let orders = Object.values(allOrders);

      // Apply filters
      if (filters.status) {
        orders = orders.filter(o => o.status === filters.status);
      }

      // Sort by date (newest first)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return { success: true, orders };
    }

    try {
      const response = await apiClient.get('/orders', filters);
      return { success: true, orders: response.orders || response };
    } catch (error) {
      console.error('Get orders error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cancel an order
   * @param {string} referenceId - Order reference ID
   * @returns {Promise<Object>} Cancelled order
   */
  async cancelOrder(referenceId) {
    const updates = {
      status: ORDER_STATUS.CANCELLED,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isMockEnabled()) {
      const order = updatePendingOrder(referenceId, updates);
      if (order) {
        return { success: true, order };
      }
      return { success: false, error: 'Order not found' };
    }

    try {
      const response = await apiClient.patch(`/orders/${referenceId}/cancel`, updates);
      return { success: true, order: response.order || response };
    } catch (error) {
      console.error('Cancel order error:', error);
      return { success: false, error: error.message };
    }
  },
};

export default ordersApi;
