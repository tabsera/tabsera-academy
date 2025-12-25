/**
 * WaafiPay API Client
 * Handles payment processing via WaafiPay
 *
 * Supports two modes:
 * 1. Direct API (API_PURCHASE) - For mobile money with in-app PIN verification
 * 2. HPP (Hosted Payment Page) - For card payments with redirect
 *
 * Mobile Money: Zaad, EVC Plus, Sahal
 * Cards: Visa, Mastercard (via HPP only)
 */

// Configuration
const config = {
  merchantUid: import.meta.env.VITE_WAAFIPAY_MERCHANT_UID,
  apiUserId: import.meta.env.VITE_WAAFIPAY_API_USER_ID,
  apiKey: import.meta.env.VITE_WAAFIPAY_API_KEY,
  storeId: parseInt(import.meta.env.VITE_WAAFIPAY_STORE_ID) || 0,
  hppKey: import.meta.env.VITE_WAAFIPAY_HPP_KEY,
  apiUrl: import.meta.env.VITE_WAAFIPAY_API_URL || 'https://api.waafipay.net/asm',
};

// Payment method constants
export const WAAFIPAY_PAYMENT_METHODS = {
  MOBILE_MONEY: 'MWALLET_ACCOUNT',
  CARD: 'CARD',
};

// Supported mobile money providers
export const MOBILE_PROVIDERS = {
  ZAAD: { id: 'zaad', name: 'Zaad', prefix: '252' },
  EVC: { id: 'evc', name: 'EVC Plus', prefix: '252' },
  SAHAL: { id: 'sahal', name: 'Sahal', prefix: '252' },
};

// Generate unique request ID (UUID v4 format)
const generateRequestId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate timestamp in WaafiPay format
const generateTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 23);
};

// Format phone number for WaafiPay (international format without +)
export const formatPhoneNumber = (phone, countryCode = '252') => {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');

  // If doesn't start with country code, add it
  if (!cleaned.startsWith(countryCode)) {
    cleaned = countryCode + cleaned;
  }

  return cleaned;
};

/**
 * WaafiPay API Client
 */
class WaafiPayClient {
  constructor() {
    this.config = config;
  }

  /**
   * Check if direct API is configured (for mobile money)
   */
  isDirectApiConfigured() {
    return !!(this.config.merchantUid && this.config.apiUserId && this.config.apiKey);
  }

  /**
   * Check if HPP is configured (for card payments)
   */
  isHppConfigured() {
    return !!(this.config.merchantUid && this.config.hppKey);
  }

  /**
   * Check if WaafiPay is configured (either mode)
   */
  isConfigured() {
    return this.isDirectApiConfigured() || this.isHppConfigured();
  }

  /**
   * Get base URL for callbacks
   */
  getCallbackBaseUrl() {
    return import.meta.env.VITE_APP_URL || window.location.origin;
  }

  /**
   * Direct API Purchase (API_PURCHASE)
   * For mobile money payments - user receives PIN prompt on phone
   *
   * @param {Object} orderData - Order details
   * @param {string} orderData.referenceId - Unique order reference
   * @param {number} orderData.amount - Payment amount
   * @param {string} orderData.currency - Currency code (USD, SLSH)
   * @param {string} orderData.description - Payment description
   * @param {string} orderData.customerPhone - Customer phone number (required)
   * @returns {Promise<Object>} Payment result
   */
  async purchaseMobileMoney(orderData) {
    const {
      referenceId,
      amount,
      currency = 'USD',
      description,
      customerPhone,
    } = orderData;

    if (!customerPhone) {
      return {
        success: false,
        errorMessage: 'Phone number is required for mobile money payment',
      };
    }

    const formattedPhone = formatPhoneNumber(customerPhone);

    const requestBody = {
      schemaVersion: '1.0',
      requestId: generateRequestId(),
      timestamp: generateTimestamp(),
      channelName: 'WEB',
      serviceName: 'API_PURCHASE',
      serviceParams: {
        merchantUid: this.config.merchantUid,
        apiUserId: this.config.apiUserId,
        apiKey: this.config.apiKey,
        paymentMethod: WAAFIPAY_PAYMENT_METHODS.MOBILE_MONEY,
        payerInfo: {
          accountNo: formattedPhone,
        },
        transactionInfo: {
          referenceId: referenceId,
          invoiceId: referenceId,
          amount: parseFloat(amount).toFixed(2),
          currency: currency,
          description: description || `Payment for order ${referenceId}`,
        },
      },
    };

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // Check for success response
      if (data.responseCode === '2001') {
        const params = data.params || {};

        // Check transaction state
        if (params.state === 'APPROVED') {
          return {
            success: true,
            transactionId: params.transactionId,
            issuerTransactionId: params.issuerTransactionId,
            referenceId: params.referenceId || referenceId,
            amount: params.txAmount || amount,
            state: params.state,
            accountNo: params.accountNo,
            merchantCharges: params.merchantCharges,
          };
        } else {
          // Transaction initiated but not approved (user may have cancelled/declined)
          return {
            success: false,
            state: params.state,
            errorMessage: getStateMessage(params.state),
            transactionId: params.transactionId,
          };
        }
      }

      // Handle error response
      return {
        success: false,
        errorCode: data.errorCode,
        responseCode: data.responseCode,
        errorMessage: data.responseMsg || getErrorMessage(data.errorCode),
      };
    } catch (error) {
      console.error('WaafiPay purchaseMobileMoney error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Network error. Please try again.',
        error,
      };
    }
  }

  /**
   * HPP Purchase (for card payments)
   * Redirects user to WaafiPay's hosted payment page
   *
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} HPP response with redirect URL
   */
  async initiateCardPayment(orderData) {
    if (!this.isHppConfigured()) {
      return {
        success: false,
        errorMessage: 'Card payments are not configured. Please use mobile money.',
      };
    }

    const {
      referenceId,
      amount,
      currency = 'USD',
      description,
      customerPhone,
    } = orderData;

    const callbackBase = this.getCallbackBaseUrl();

    const serviceParams = {
      merchantUid: this.config.merchantUid,
      hppKey: this.config.hppKey,
      paymentMethod: WAAFIPAY_PAYMENT_METHODS.MOBILE_MONEY, // HPP handles card selection
      hppSuccessCallbackUrl: `${callbackBase}/payment/success`,
      hppFailureCallbackUrl: `${callbackBase}/payment/failure`,
      hppRespDataFormat: 1,
      transactionInfo: {
        referenceId: referenceId,
        amount: parseFloat(amount).toFixed(2),
        currency: currency,
        description: description || `Payment for order ${referenceId}`,
      },
    };

    // Add storeId if configured
    if (this.config.storeId) {
      serviceParams.storeId = this.config.storeId;
    }

    const requestBody = {
      schemaVersion: '1.0',
      requestId: generateRequestId(),
      timestamp: generateTimestamp(),
      channelName: 'WEB',
      serviceName: 'HPP_PURCHASE',
      serviceParams,
    };

    if (customerPhone) {
      requestBody.serviceParams.subscriptionId = formatPhoneNumber(customerPhone);
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.responseCode === '2001' && data.params?.hppUrl) {
        return {
          success: true,
          hppUrl: data.params.hppUrl,
          directPaymentLink: data.params.directPaymentLink,
          orderId: data.params.orderId,
          referenceId: data.params.referenceId,
        };
      }

      return {
        success: false,
        errorCode: data.errorCode,
        errorMessage: data.responseMsg || 'Failed to initiate card payment',
      };
    } catch (error) {
      console.error('WaafiPay initiateCardPayment error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Network error',
      };
    }
  }

  /**
   * Get Transaction Information
   * Query the status of a transaction
   *
   * @param {string} referenceId - Order reference ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransactionInfo(referenceId) {
    // Use HPP method if configured, otherwise not available for direct API
    if (!this.isHppConfigured()) {
      return {
        success: false,
        errorMessage: 'Transaction lookup requires HPP configuration',
      };
    }

    const serviceParams = {
      merchantUid: this.config.merchantUid,
      hppKey: this.config.hppKey,
      referenceId: referenceId,
    };

    if (this.config.storeId) {
      serviceParams.storeId = this.config.storeId;
    }

    const requestBody = {
      schemaVersion: '1.0',
      requestId: generateRequestId(),
      timestamp: generateTimestamp(),
      channelName: 'WEB',
      serviceName: 'HPP_GETTRANINFO',
      serviceParams,
    };

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.responseCode === '2001' && data.params) {
        return {
          success: true,
          transaction: {
            transactionId: data.params.transactionId,
            referenceId: data.params.referenceId || referenceId,
            amount: data.params.amount,
            currency: data.params.currency,
            status: data.params.status || data.params.tranStatusDesc,
            paymentMethod: data.params.paymentMethod,
            payerId: data.params.payerId,
            transactionDate: data.params.tranDate,
          },
        };
      }

      return {
        success: false,
        errorCode: data.errorCode,
        errorMessage: data.responseMsg || 'Failed to get transaction info',
      };
    } catch (error) {
      console.error('WaafiPay getTransactionInfo error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Network error',
      };
    }
  }

  /**
   * Reverse a transaction (within 24 hours, before settlement)
   *
   * @param {string} transactionId - WaafiPay transaction ID
   * @param {string} description - Reason for reversal
   * @returns {Promise<Object>} Reversal result
   */
  async reverseTransaction(transactionId, description = 'Order cancelled') {
    const requestBody = {
      schemaVersion: '1.0',
      requestId: generateRequestId(),
      timestamp: generateTimestamp(),
      channelName: 'WEB',
      serviceName: 'API_REVERSAL',
      serviceParams: {
        merchantUid: this.config.merchantUid,
        apiUserId: this.config.apiUserId,
        apiKey: this.config.apiKey,
        transactionId: transactionId,
        description: description,
      },
    };

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.responseCode === '2001' && data.params?.state === 'approved') {
        return {
          success: true,
          transactionId: data.params.transactionId,
          referenceId: data.params.referenceId,
          state: data.params.state,
        };
      }

      return {
        success: false,
        errorCode: data.errorCode,
        errorMessage: data.responseMsg || 'Reversal failed',
      };
    } catch (error) {
      console.error('WaafiPay reverseTransaction error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Network error',
      };
    }
  }

  /**
   * Parse HPP callback data
   */
  parseCallbackData(params) {
    const get = (key) => {
      if (params instanceof URLSearchParams) {
        return params.get(key);
      }
      return params[key];
    };

    return {
      transactionId: get('transactionId') || get('transaction_id'),
      referenceId: get('referenceId') || get('reference_id'),
      orderId: get('orderId') || get('order_id'),
      amount: get('amount'),
      currency: get('currency'),
      status: get('status') || get('state'),
      paymentMethod: get('paymentMethod') || get('payment_method'),
      payerId: get('payerId') || get('payer_id'),
      errorCode: get('errorCode') || get('error_code'),
      errorMessage: get('errorMessage') || get('error_message'),
    };
  }
}

// Helper function to get user-friendly state message
function getStateMessage(state) {
  const messages = {
    PENDING: 'Payment is pending. Please check your phone for PIN prompt.',
    DECLINED: 'Payment was declined. Please check your balance and try again.',
    CANCELLED: 'Payment was cancelled.',
    FAILED: 'Payment failed. Please try again.',
    EXPIRED: 'Payment request expired. Please try again.',
    TIMEOUT: 'Payment request timed out. Please try again.',
  };
  return messages[state] || `Payment status: ${state}`;
}

// Helper function to get user-friendly error message
function getErrorMessage(errorCode) {
  const messages = {
    '5301': 'Invalid merchant credentials.',
    '5302': 'Transaction failed. Please try again.',
    '5303': 'Insufficient balance.',
    '5304': 'Transaction was cancelled by user.',
    '5305': 'Transaction timed out.',
    '5306': 'Invalid phone number.',
    '5307': 'Account not found.',
    '5308': 'Service temporarily unavailable.',
    '5309': 'Transaction limit exceeded.',
  };
  return messages[errorCode] || 'Payment could not be completed. Please try again.';
}

// Export singleton instance
export const waafipayClient = new WaafiPayClient();
export default waafipayClient;
