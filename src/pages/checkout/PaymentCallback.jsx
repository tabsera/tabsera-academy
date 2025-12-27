/**
 * Payment Callback Page
 * Handles WaafiPay HPP redirects for success and failure
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCart } from '../../context/CartContext';
import { paymentsApi } from '../../api/payments';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Home,
  ShoppingCart,
} from 'lucide-react';

function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState('loading'); // loading, success, failed, error
  const [message, setMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      // Get reference ID from URL params or session storage
      const referenceId = searchParams.get('ref') ||
        searchParams.get('referenceId') ||
        sessionStorage.getItem('pending_order_reference');

      if (!referenceId) {
        setStatus('error');
        setMessage('Order reference not found. Please contact support.');
        return;
      }

      // Verify payment via backend API (handles WaafiPay verification internally)
      const verifyResult = await paymentsApi.verifyPayment(referenceId);

      if (verifyResult.success) {
        setOrderDetails(verifyResult.order);

        if (verifyResult.verified || verifyResult.status === 'APPROVED') {
          // Payment verified successfully
          setTransactionDetails({
            transactionId: verifyResult.order?.payments?.[0]?.transactionId,
          });

          // Clear cart and pending order reference
          clearCart();
          sessionStorage.removeItem('pending_order_reference');

          setStatus('success');
          setMessage('Your payment was successful!');
        } else if (verifyResult.status === 'PENDING') {
          // Payment still pending
          setStatus('loading');
          setMessage('Payment is being processed. Please wait...');

          // Poll for status update
          setTimeout(() => processCallback(), 3000);
        } else {
          // Payment failed
          const errorMessage = getErrorMessage(verifyResult.status);
          setStatus('failed');
          setMessage(errorMessage);
        }
      } else {
        // Couldn't verify - show error
        setStatus('error');
        setMessage(verifyResult.errorMessage || 'Could not verify payment. Please contact support.');
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please contact support.');
    }
  };

  // Get user-friendly error message
  const getErrorMessage = (errorCodeOrStatus) => {
    const errorMessages = {
      CANCELLED: 'Payment was cancelled.',
      CANCELED: 'Payment was cancelled.',
      DECLINED: 'Payment was declined by your provider. Please check your balance and try again.',
      EXPIRED: 'Payment session expired. Please try again.',
      TIMEOUT: 'Payment request timed out. Please try again.',
      FAILED: 'Payment failed. Please try again or use a different payment method.',
      '5301': 'Invalid credentials. Please contact support.',
      '5302': 'Transaction failed. Please try again.',
      '5303': 'Insufficient balance.',
      '5304': 'User cancelled the transaction.',
      '5305': 'Transaction timed out.',
    };
    return errorMessages[errorCodeOrStatus] || 'Payment could not be completed. Please try again.';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Retry payment
  const handleRetry = () => {
    navigate('/checkout');
  };

  // View order details
  const handleViewOrder = () => {
    if (orderDetails?.referenceId) {
      navigate(`/order-confirmation/${orderDetails.referenceId}`, {
        state: { orderDetails },
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Processing Your Payment
              </h1>
              <p className="text-gray-500">
                Please wait while we verify your payment...
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Payment Successful!
              </h1>
              <p className="text-gray-500 mb-6">
                {message}
              </p>

              {/* Order Summary */}
              {orderDetails && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Reference:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails.referenceId}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(orderDetails.total)}
                    </span>
                  </div>
                  {transactionDetails?.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">
                        {transactionDetails.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleViewOrder}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Order Details
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/student/my-learning')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Start Learning
                </button>
              </div>
            </>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Payment Failed
              </h1>
              <p className="text-gray-500 mb-6">
                {message}
              </p>

              {orderDetails && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Reference:</span>
                    <span className="font-medium text-gray-900">
                      {orderDetails.referenceId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(orderDetails.total)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart size={18} />
                  Back to Cart
                </button>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Something Went Wrong
              </h1>
              <p className="text-gray-500 mb-6">
                {message}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Home size={18} />
                  Go Home
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PaymentCallback;
