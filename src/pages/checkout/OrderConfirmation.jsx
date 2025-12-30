/**
 * Order Confirmation Page
 * Shows order details after successful checkout
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ordersApi } from '../../api/orders';
import {
  CheckCircle, Download, Mail, Calendar, CreditCard,
  BookOpen, ArrowRight, ExternalLink, Clock, MapPin,
  Share2, Printer, Home, Loader2, AlertCircle
} from 'lucide-react';

function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(location.state?.orderDetails || null);
  const [loading, setLoading] = useState(!orderDetails);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no order details from navigation state, fetch from API
    if (!orderDetails && orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await ordersApi.getOrder(orderId);
      if (result.success && result.order) {
        // Map API response to expected format
        const order = result.order;
        setOrderDetails({
          referenceId: order.referenceId,
          items: order.items?.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            price: parseFloat(item.price),
            coursesCount: item.coursesCount,
          })) || [],
          total: parseFloat(order.total),
          subtotal: parseFloat(order.subtotal),
          discount: parseFloat(order.discount || 0),
          promoCode: order.promoCode,
          billingInfo: {
            firstName: order.user?.firstName || order.billingFirstName || 'Customer',
            lastName: order.user?.lastName || order.billingLastName || '',
            email: order.user?.email || order.billingEmail || '',
            phone: order.user?.phone || order.billingPhone || '',
          },
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        });
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !orderDetails) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h1>
          <p className="text-gray-500 mb-8">{error || 'We could not find this order.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            <Home size={18} />
            Go to Homepage
          </Link>
        </div>
      </Layout>
    );
  }

  const {
    items = [],
    total = 0,
    subtotal = 0,
    discount = 0,
    promoCode,
    billingInfo = {},
    paymentMethod,
    paymentStatus,
    selectedCenter,
    createdAt,
  } = orderDetails;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodText = () => {
    const method = paymentMethod?.toLowerCase();
    switch (method) {
      case 'mobile_money':
        return `Mobile Money (${orderDetails.mobileProvider?.toUpperCase() || 'Mobile'})`;
      case 'pay_at_center':
        return 'Pay at Learning Center';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'card':
        return 'Credit/Debit Card';
      default:
        return paymentMethod;
    }
  };

  const getNextSteps = () => {
    const method = paymentMethod?.toLowerCase();
    switch (method) {
      case 'mobile_money':
        return [
          'Check your phone for a payment prompt',
          'Confirm the payment on your mobile device',
          'You\'ll receive a confirmation SMS once complete',
          'Access to courses will be granted within minutes',
        ];
      case 'pay_at_center':
        return [
          'Visit your selected learning center',
          'Show this order confirmation to the staff',
          'Complete payment via cash or mobile money',
          'Your enrollment will be activated immediately',
        ];
      case 'bank_transfer':
        return [
          'Transfer the amount to our bank account',
          'Use your email as the payment reference',
          'Send proof of payment to payments@tabsera.com',
          'Enrollment activates within 24 hours of verification',
        ];
      case 'card':
        return [
          'Your card has been charged successfully',
          'Check your email for the payment receipt',
          'Access to courses is now available',
          'Start learning right away!',
        ];
      default:
        return [];
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-lg">
            Thank you for your enrollment, {billingInfo.firstName}!
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Order Date</p>
                <p className="font-semibold">{formatDate(createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Total</p>
                <p className="text-2xl font-bold">{formatPrice(total)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Enrolled Courses</h2>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    item.type === 'track'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      : item.type === 'pack' || item.type === 'tuition_pack'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    <BookOpen size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {item.type === 'track' ? 'Learning Track' :
                       item.type === 'pack' || item.type === 'tuition_pack' ? 'Tuition Pack' :
                       'Individual Course'}
                      {item.coursesCount && ` • ${item.coursesCount} courses`}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({promoCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Billing & Payment Info */}
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Mail size={18} className="text-gray-400" />
                Billing Information
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{billingInfo.firstName} {billingInfo.lastName}</p>
                <p>{billingInfo.email}</p>
                <p>{billingInfo.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-400" />
                Payment Method
              </h3>
              <p className="text-sm text-gray-600">{getPaymentMethodText()}</p>
              {selectedCenter && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin size={14} />
                  {selectedCenter}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mb-8">
          <h2 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Next Steps
          </h2>
          <ol className="space-y-3">
            {getNextSteps().map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-blue-800">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Email Confirmation Note */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
              <Mail size={24} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Confirmation Email Sent</h3>
              <p className="text-sm text-gray-600 mt-1">
                We've sent a confirmation email to <span className="font-medium">{billingInfo.email}</span> with 
                your order details and instructions to access your courses.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            to="/student/my-learning"
            className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            Start Learning
          </Link>
          <a
            href="https://learn.tabsera.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={20} />
            Go to EdX Platform
          </a>
        </div>

        {/* Additional Actions */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <Download size={18} />
            Download Receipt
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <Printer size={18} />
            Print Order
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <Share2 size={18} />
            Share
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <Home size={18} />
            Back to Homepage
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Questions about your order? Contact us at{' '}
            <a href="mailto:support@tabsera.com" className="text-blue-600 hover:underline">
              support@tabsera.com
            </a>
            {' '}or call{' '}
            <a href="tel:+252634567890" className="text-blue-600 hover:underline">
              +252 63 456 7890
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default OrderConfirmation;
