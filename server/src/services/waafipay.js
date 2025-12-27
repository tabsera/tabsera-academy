/**
 * WaafiPay Payment Integration Service
 * Implements HPP (Hosted Payment Page) for mobile money and card payments
 *
 * Documentation: https://docs.waafipay.com
 */

const { v4: uuidv4 } = require('uuid');

// WaafiPay configuration
const config = {
  apiUrl: process.env.WAAFIPAY_API_URL || 'https://sandbox.waafipay.net/asm',
  merchantUid: process.env.WAAFIPAY_MERCHANT_UID,
  apiUserId: process.env.WAAFIPAY_API_USER_ID,
  apiKey: process.env.WAAFIPAY_API_KEY,
  hppKey: process.env.WAAFIPAY_HPP_KEY,
  storeId: process.env.WAAFIPAY_STORE_ID ? parseInt(process.env.WAAFIPAY_STORE_ID) : null,
};

/**
 * Generate a unique request ID
 */
const generateRequestId = () => uuidv4();

/**
 * Get current timestamp in ISO format
 */
const getTimestamp = () => new Date().toISOString();

/**
 * Make API request to WaafiPay
 * @param {string} serviceName - WaafiPay service name
 * @param {Object} serviceParams - Service-specific parameters
 * @param {boolean} isHpp - Whether this is an HPP request (uses hppKey, not apiKey)
 */
const makeRequest = async (serviceName, serviceParams, isHpp = false) => {
  // HPP requests use merchantUid + hppKey only
  // API requests use merchantUid + apiUserId + apiKey
  const baseParams = isHpp
    ? { merchantUid: config.merchantUid }
    : {
        merchantUid: config.merchantUid,
        apiUserId: config.apiUserId,
        apiKey: config.apiKey,
      };

  const requestBody = {
    schemaVersion: '1.0',
    requestId: generateRequestId(),
    timestamp: getTimestamp(),
    channelName: 'WEB',
    serviceName,
    serviceParams: {
      ...baseParams,
      ...serviceParams,
    },
  };

  console.log(`WaafiPay ${serviceName} request:`, JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log(`WaafiPay ${serviceName} response:`, JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error(`WaafiPay ${serviceName} error:`, error);
    throw error;
  }
};

/**
 * Initiate HPP Purchase
 * Redirects user to WaafiPay hosted payment page
 *
 * @param {Object} params
 * @param {string} params.referenceId - Order reference ID
 * @param {number} params.amount - Payment amount
 * @param {string} params.currency - Currency code (USD, default)
 * @param {string} params.description - Payment description
 * @param {string} params.payerPhone - Payer's phone number (for mobile money)
 * @param {string} params.paymentMethod - MWALLET_ACCOUNT or CREDIT_CARD
 * @param {string} params.successUrl - Callback URL for successful payment
 * @param {string} params.failureUrl - Callback URL for failed payment
 * @returns {Object} HPP response with redirect URL
 */
const initiatePurchase = async ({
  referenceId,
  amount,
  currency = 'USD',
  description,
  payerPhone,
  paymentMethod = 'MWALLET_ACCOUNT',
  successUrl,
  failureUrl,
}) => {
  // Format phone number for subscriptionId (international format without +)
  let subscriptionId = null;
  if (payerPhone) {
    subscriptionId = payerPhone.replace(/\D/g, ''); // Remove non-digits
    subscriptionId = subscriptionId.replace(/^0+/, ''); // Remove leading zeros
    if (!subscriptionId.startsWith('252')) {
      subscriptionId = '252' + subscriptionId;
    }
  }

  // HPP request format - matching frontend implementation
  const serviceParams = {
    merchantUid: config.merchantUid,
    hppKey: config.hppKey,
    paymentMethod,
    hppSuccessCallbackUrl: successUrl,
    hppFailureCallbackUrl: failureUrl,
    hppRespDataFormat: 1,
    transactionInfo: {
      referenceId,
      amount: parseFloat(amount).toFixed(2),
      currency,
      description: (description || `Payment for order ${referenceId}`).substring(0, 255),
    },
  };

  // Add storeId only if configured
  if (config.storeId) {
    serviceParams.storeId = parseInt(config.storeId);
  }

  // Add subscriptionId for mobile money (directly in serviceParams, not payerInfo)
  if (subscriptionId) {
    serviceParams.subscriptionId = subscriptionId;
  }

  // For HPP, we don't add merchantUid to base params since it's in serviceParams
  const requestBody = {
    schemaVersion: '1.0',
    requestId: generateRequestId(),
    timestamp: getTimestamp(),
    channelName: 'WEB',
    serviceName: 'HPP_PURCHASE',
    serviceParams,
  };

  console.log('WaafiPay HPP_PURCHASE request:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    console.log('WaafiPay HPP_PURCHASE response:', JSON.stringify(data, null, 2));

    if (data.responseCode === '2001') {
      return {
        success: true,
        hppUrl: data.params?.hppUrl,
        orderId: data.params?.orderId,
        referenceId: data.params?.referenceId,
        transactionId: data.params?.transactionId,
        responseCode: data.responseCode,
        responseMsg: data.responseMsg,
      };
    }

    return {
      success: false,
      errorCode: data.responseCode,
      errorMessage: data.responseMsg || 'Payment initiation failed',
      params: data.params,
    };
  } catch (error) {
    console.error('WaafiPay HPP_PURCHASE error:', error);
    return {
      success: false,
      errorMessage: error.message || 'Network error',
    };
  }
};

/**
 * Get transaction information
 * Used to verify payment status after callback
 *
 * @param {string} transactionId - WaafiPay transaction ID
 * @returns {Object} Transaction details
 */
const getTransactionInfo = async (transactionId) => {
  const serviceParams = {
    hppKey: config.hppKey,
    transactionId,
  };

  if (config.storeId) {
    serviceParams.storeId = config.storeId;
  }

  const response = await makeRequest('HPP_GETTRANINFO', serviceParams, true);

  if (response.responseCode === '2001') {
    const params = response.params || {};
    return {
      success: true,
      transactionId: params.transactionId,
      state: params.state, // APPROVED, DECLINED, PENDING, etc.
      referenceId: params.referenceId,
      amount: params.amount,
      currency: params.currency,
      issuerTransactionId: params.issuerTransactionId,
      payerId: params.payerId,
      payerPhone: params.payerPhone,
      payerName: params.payerName,
    };
  }

  return {
    success: false,
    errorCode: response.responseCode,
    errorMessage: response.responseMsg || 'Failed to get transaction info',
  };
};

/**
 * Direct API Purchase (no redirect)
 * Used for server-to-server payments with USSD prompt
 *
 * @param {Object} params
 * @param {string} params.referenceId - Order reference ID
 * @param {number} params.amount - Payment amount
 * @param {string} params.currency - Currency code
 * @param {string} params.description - Payment description
 * @param {string} params.payerPhone - Payer's phone number
 * @returns {Object} Payment result
 */
const apiPurchase = async ({
  referenceId,
  amount,
  currency = 'USD',
  description,
  payerPhone,
}) => {
  // Format phone number with country code (252 for Somalia)
  let accountNo = payerPhone.replace(/\D/g, ''); // Remove non-digits
  accountNo = accountNo.replace(/^0+/, ''); // Remove leading zeros
  if (!accountNo.startsWith('252')) {
    accountNo = '252' + accountNo;
  }

  const serviceParams = {
    paymentMethod: 'MWALLET_ACCOUNT',
    payerInfo: {
      accountNo,
    },
    transactionInfo: {
      referenceId,
      invoiceId: referenceId,
      amount: parseFloat(amount).toFixed(2),
      currency,
      description: description || `Payment for order ${referenceId}`,
    },
  };

  const response = await makeRequest('API_PURCHASE', serviceParams);

  if (response.responseCode === '2001') {
    const params = response.params || {};
    return {
      success: true,
      state: params.state,
      transactionId: params.transactionId,
      issuerTransactionId: params.issuerTransactionId,
      referenceId: params.referenceId,
      amount: params.amount,
      currency: params.currency,
    };
  }

  return {
    success: false,
    errorCode: response.responseCode,
    errorMessage: response.responseMsg || 'Payment failed',
    params: response.params,
  };
};

/**
 * Pre-authorize a payment (hold funds)
 *
 * @param {Object} params - Same as initiatePurchase
 * @returns {Object} Pre-auth result
 */
const preAuthorize = async ({
  referenceId,
  amount,
  currency = 'USD',
  description,
  payerPhone,
  successUrl,
  failureUrl,
}) => {
  // Format phone number for subscriptionId
  let subscriptionId = null;
  if (payerPhone) {
    subscriptionId = payerPhone.replace(/\D/g, '');
    subscriptionId = subscriptionId.replace(/^0+/, '');
    if (!subscriptionId.startsWith('252')) {
      subscriptionId = '252' + subscriptionId;
    }
  }

  const serviceParams = {
    hppKey: config.hppKey,
    paymentMethod: 'MWALLET_ACCOUNT',
    hppSuccessCallbackUrl: successUrl,
    hppFailureCallbackUrl: failureUrl,
    hppRespDataFormat: 1,
    transactionInfo: {
      referenceId,
      invoiceId: referenceId,
      amount: parseFloat(amount).toFixed(2),
      currency,
      description: description || `Pre-auth for order ${referenceId}`,
    },
  };

  if (config.storeId) {
    serviceParams.storeId = config.storeId;
  }

  if (subscriptionId) {
    serviceParams.subscriptionId = subscriptionId;
  }

  const response = await makeRequest('HPP_PREAUTHORIZE', serviceParams, true);

  if (response.responseCode === '2001') {
    return {
      success: true,
      hppUrl: response.params?.hppUrl,
      transactionId: response.params?.transactionId,
      referenceId: response.params?.referenceId,
    };
  }

  return {
    success: false,
    errorCode: response.responseCode,
    errorMessage: response.responseMsg || 'Pre-authorization failed',
  };
};

/**
 * Commit a pre-authorized payment
 *
 * @param {string} transactionId - Pre-auth transaction ID
 * @param {string} referenceId - Original reference ID
 * @param {number} amount - Amount to commit (can be less than pre-auth)
 * @param {string} description - Commit description
 * @returns {Object} Commit result
 */
const commitPreAuth = async (transactionId, referenceId, amount, description) => {
  const serviceParams = {
    transactionId,
    transactionInfo: {
      referenceId,
      invoiceId: referenceId,
      amount: parseFloat(amount).toFixed(2),
      description: description || 'Payment committed',
    },
  };

  const response = await makeRequest('API_PREAUTHORIZE_COMMIT', serviceParams);

  return {
    success: response.responseCode === '2001',
    responseCode: response.responseCode,
    responseMsg: response.responseMsg,
    params: response.params,
  };
};

/**
 * Cancel a pre-authorized payment
 *
 * @param {string} transactionId - Pre-auth transaction ID
 * @param {string} referenceId - Original reference ID
 * @param {string} description - Cancellation reason
 * @returns {Object} Cancel result
 */
const cancelPreAuth = async (transactionId, referenceId, description) => {
  const serviceParams = {
    transactionId,
    transactionInfo: {
      referenceId,
      invoiceId: referenceId,
      description: description || 'Pre-auth cancelled',
    },
  };

  const response = await makeRequest('API_PREAUTHORIZE_CANCEL', serviceParams);

  return {
    success: response.responseCode === '2001',
    responseCode: response.responseCode,
    responseMsg: response.responseMsg,
    params: response.params,
  };
};

/**
 * Process a refund
 *
 * @param {string} transactionId - Original transaction ID
 * @param {number} amount - Refund amount
 * @param {string} description - Refund reason
 * @returns {Object} Refund result
 */
const refund = async (transactionId, amount, description) => {
  const serviceParams = {
    transactionId,
    transactionInfo: {
      amount: parseFloat(amount).toFixed(2),
      description: description || 'Refund processed',
    },
  };

  const response = await makeRequest('API_REFUND', serviceParams);

  if (response.responseCode === '2001') {
    return {
      success: true,
      refundTransactionId: response.params?.transactionId,
      state: response.params?.state,
    };
  }

  return {
    success: false,
    errorCode: response.responseCode,
    errorMessage: response.responseMsg || 'Refund failed',
  };
};

/**
 * Parse HPP callback data
 * Called when user returns from WaafiPay payment page
 *
 * @param {Object} callbackData - Data from WaafiPay callback
 * @returns {Object} Parsed callback data
 */
const parseCallback = (callbackData) => {
  return {
    transactionId: callbackData.transactionId,
    referenceId: callbackData.referenceId,
    state: callbackData.state, // APPROVED, DECLINED, CANCELLED, etc.
    amount: callbackData.amount,
    currency: callbackData.currency,
    issuerTransactionId: callbackData.issuerTransactionId,
    payerId: callbackData.payerId,
    responseCode: callbackData.responseCode,
    responseMsg: callbackData.responseMsg,
    isApproved: callbackData.state === 'APPROVED',
    isDeclined: callbackData.state === 'DECLINED',
    isCancelled: callbackData.state === 'CANCELLED',
    isPending: callbackData.state === 'PENDING',
  };
};

/**
 * Test WaafiPay connection
 * Makes a simple request to verify credentials
 */
const testConnection = async () => {
  try {
    // Use API_CREDITACCOUNT_INFO to test - it will fail but confirm we can reach the API
    const requestBody = {
      schemaVersion: '1.0',
      requestId: generateRequestId(),
      timestamp: getTimestamp(),
      channelName: 'WEB',
      serviceName: 'API_CREDITACCOUNT_INFO',
      serviceParams: {
        merchantUid: config.merchantUid,
        apiUserId: config.apiUserId,
        apiKey: config.apiKey,
        accountNo: '0',
      },
    };

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Any response from WaafiPay (except network errors) means connection works
    // Valid response codes that indicate API is reachable:
    // 2001 = Success
    // 5xxx = Parameter validation errors (means we reached the API)
    // 4xxx = Business logic errors (means we reached the API)
    const isConnected = data.responseCode && (
      data.responseCode.startsWith('2') ||
      data.responseCode.startsWith('4') ||
      data.responseCode.startsWith('5')
    );

    return {
      success: isConnected,
      message: isConnected ? 'WaafiPay API is reachable' : 'WaafiPay connection failed',
      apiUrl: config.apiUrl,
      merchantUid: config.merchantUid,
      hppKey: config.hppKey ? 'configured' : 'missing',
      responseCode: data.responseCode,
      responseMsg: data.responseMsg,
    };
  } catch (error) {
    return {
      success: false,
      message: `WaafiPay connection error: ${error.message}`,
      apiUrl: config.apiUrl,
    };
  }
};

module.exports = {
  initiatePurchase,
  getTransactionInfo,
  apiPurchase,
  preAuthorize,
  commitPreAuth,
  cancelPreAuth,
  refund,
  parseCallback,
  testConnection,
};
