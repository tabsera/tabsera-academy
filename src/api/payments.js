/**
 * Payments API Client
 * Handles payment processing through the backend API
 * Backend then communicates with WaafiPay for actual payment processing
 */

import apiClient from './client';

/**
 * Initiate HPP payment (Hosted Payment Page)
 * User will be redirected to WaafiPay's payment page
 *
 * @param {Object} params
 * @param {string} params.orderReferenceId - Order reference ID
 * @param {string} params.payerPhone - Payer's phone number (optional, for pre-fill)
 * @returns {Promise<Object>} HPP result with redirect URL
 */
export async function initiateHppPayment({ orderReferenceId, payerPhone }) {
  try {
    const response = await apiClient.post('/payments/hpp', {
      orderReferenceId,
      payerPhone,
    });

    return {
      success: response.success,
      hppUrl: response.hppUrl,
      orderId: response.orderId,
      referenceId: response.referenceId,
    };
  } catch (error) {
    console.error('HPP payment error:', error);
    return {
      success: false,
      errorMessage: error.message || 'Failed to initiate payment',
    };
  }
}

/**
 * Initiate card/HPP payment
 * Backend returns HPP URL for redirect
 *
 * @param {Object} params
 * @param {string} params.orderReferenceId - Order reference ID
 * @param {string} params.payerPhone - Payer's phone number (optional)
 * @returns {Promise<Object>} HPP result with redirect URL
 */
export async function initiateCardPayment({ orderReferenceId, payerPhone }) {
  try {
    const response = await apiClient.post('/payments/initiate', {
      orderReferenceId,
      payerPhone,
      paymentMethod: 'MWALLET_ACCOUNT', // HPP handles card selection
    });

    return {
      success: response.success,
      hppUrl: response.hppUrl,
      orderId: response.orderId,
      transactionId: response.transactionId,
      referenceId: response.referenceId,
    };
  } catch (error) {
    console.error('Card payment initiation error:', error);
    return {
      success: false,
      errorMessage: error.message || 'Failed to initiate card payment',
    };
  }
}

/**
 * Verify payment status by order reference
 *
 * @param {string} referenceId - Order reference ID
 * @returns {Promise<Object>} Payment verification result
 */
export async function verifyPayment(referenceId) {
  try {
    const response = await apiClient.get(`/payments/verify/${referenceId}`);

    return {
      success: response.success,
      verified: response.verified,
      status: response.status,
      order: response.order,
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      errorMessage: error.message || 'Failed to verify payment',
    };
  }
}

/**
 * Get user's payment history
 *
 * @param {Object} params
 * @param {string} params.status - Filter by status (optional)
 * @param {number} params.limit - Limit results (default: 50)
 * @param {number} params.offset - Offset for pagination (default: 0)
 * @returns {Promise<Object>} Payments list
 */
export async function getPaymentHistory({ status, limit = 50, offset = 0 } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);

    const response = await apiClient.get(`/payments?${params.toString()}`);

    return {
      success: response.success,
      payments: response.payments,
      total: response.total,
    };
  } catch (error) {
    console.error('Get payment history error:', error);
    return {
      success: false,
      payments: [],
      total: 0,
    };
  }
}

/**
 * Test WaafiPay connection status
 *
 * @returns {Promise<Object>} Connection test result
 */
export async function testPaymentConnection() {
  try {
    const response = await apiClient.get('/payments/status');
    return response;
  } catch (error) {
    console.error('Payment connection test error:', error);
    return {
      success: false,
      message: error.message || 'Connection test failed',
    };
  }
}

export const paymentsApi = {
  initiateHppPayment,
  initiateCardPayment,
  verifyPayment,
  getPaymentHistory,
  testPaymentConnection,
};

export default paymentsApi;
