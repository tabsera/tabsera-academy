/**
 * Checkout Page
 * Complete enrollment with payment via WaafiPay
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { paymentsApi } from '../../api/payments';
import { ordersApi } from '../../api/orders';
import {
  CreditCard, Smartphone, Building2, MapPin, User,
  Mail, Phone, ChevronRight, CheckCircle, AlertCircle,
  Loader2, ShoppingCart, ArrowLeft, Shield, Lock,
  BookOpen, Clock, Wallet
} from 'lucide-react';

// Payment method options
const PAYMENT_METHODS = {
  MOBILE_MONEY: 'mobile_money',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  PAY_AT_CENTER: 'pay_at_center',
};


// Learning centers for pay at center
const LEARNING_CENTERS = [
  { id: 'aqoonyahan', name: 'Aqoonyahan School', location: 'Hargeisa, Somalia' },
  { id: 'sunrise', name: 'Sunrise International', location: 'Nairobi, Kenya' },
  { id: 'alnoor', name: 'Al-Noor Academy', location: 'Mogadishu, Somalia' },
  { id: 'excel', name: 'Excel Learning Center', location: 'Addis Ababa, Ethiopia' },
];

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    promoDiscount,
    promoCode,
    total,
    clearCart,
    ITEM_TYPES,
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [billingInfo, setBillingInfo] = useState({
    firstName: user?.first_name || user?.firstName || '',
    lastName: user?.last_name || user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || 'SO',
    learningCenter: '',
  });

  // Check if billing info is complete (skip step 1 if so)
  const hasBillingInfo = billingInfo.firstName && billingInfo.lastName && billingInfo.email && billingInfo.phone;
  const [step, setStep] = useState(hasBillingInfo ? 2 : 1); // Start at step 2 if billing info exists

  const [paymentMethod, setPaymentMethod] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email || !billingInfo.phone) {
      setError('Please fill in all required fields');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return false;
    }
    if (paymentMethod === PAYMENT_METHODS.MOBILE_MONEY && !mobileNumber) {
      setError('Please enter your mobile number');
      return false;
    }
    if (paymentMethod === PAYMENT_METHODS.PAY_AT_CENTER && !selectedCenter) {
      setError('Please select a learning center');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  // Save billing info to user profile
  const saveBillingInfo = async () => {
    try {
      await apiClient.put('/users/profile', {
        firstName: billingInfo.firstName,
        lastName: billingInfo.lastName,
        phone: billingInfo.phone,
        country: billingInfo.country,
      });
    } catch (err) {
      console.error('Failed to save billing info:', err);
      // Don't block checkout if this fails
    }
  };

  const handlePlaceOrder = async () => {
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Save billing info to user profile for future use
      await saveBillingInfo();

      // Create order first
      const orderResult = await ordersApi.createOrder({
        items,
        billingInfo,
        paymentMethod,
        selectedCenter,
        subtotal,
        discount: discountAmount,
        promoCode,
        total,
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const order = orderResult.order;

      // Handle Mobile Money and Card payments via WaafiPay HPP
      if (paymentMethod === PAYMENT_METHODS.MOBILE_MONEY || paymentMethod === PAYMENT_METHODS.CARD) {
        // Mock mode: simulate successful payment
        if (import.meta.env.VITE_ENABLE_MOCK_API === 'true') {
          clearCart();
          navigate(`/order-confirmation/${order.referenceId}`, {
            state: { orderDetails: { ...order, paymentStatus: 'approved' } }
          });
          return;
        }

        // Store order reference for callback
        sessionStorage.setItem('pending_order_reference', order.referenceId);

        // Initiate HPP payment - redirects to WaafiPay payment page
        const hppResult = await paymentsApi.initiateHppPayment({
          orderReferenceId: order.referenceId,
          payerPhone: mobileNumber || billingInfo.phone,
        });

        if (hppResult.success && hppResult.hppUrl) {
          // Redirect to WaafiPay payment page
          window.location.href = hppResult.hppUrl;
          return;
        } else {
          throw new Error(hppResult.errorMessage || 'Failed to initiate payment');
        }
      }
      // Handle manual payment methods
      else if (paymentMethod === PAYMENT_METHODS.BANK_TRANSFER || paymentMethod === PAYMENT_METHODS.PAY_AT_CENTER) {
        clearCart();
        navigate(`/order-confirmation/${order.referenceId}`, {
          state: {
            orderDetails: {
              ...order,
              paymentPending: true,
              selectedCenter: selectedCenter
                ? LEARNING_CENTERS.find(c => c.id === selectedCenter)
                : null,
            }
          }
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some courses to your cart before checkout.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Billing Info' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Review' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > s.num ? 'bg-blue-600 text-white' :
                  step === s.num ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className="font-medium hidden sm:inline">{s.label}</span>
              </div>
              {idx < 2 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Step 1: Billing Information */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Billing Information</h2>
                
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="firstName"
                          value={billingInfo.firstName}
                          onChange={handleBillingChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={billingInfo.lastName}
                        onChange={handleBillingChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={billingInfo.email}
                        onChange={handleBillingChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={billingInfo.phone}
                        onChange={handleBillingChange}
                        placeholder="+252 61 234 5678"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="country"
                        value={billingInfo.country}
                        onChange={handleBillingChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="SO">🇸🇴 Somalia</option>
                        <option value="KE">🇰🇪 Kenya</option>
                        <option value="ET">🇪🇹 Ethiopia</option>
                        <option value="UG">🇺🇬 Uganda</option>
                        <option value="TZ">🇹🇿 Tanzania</option>
                        <option value="DJ">🇩🇯 Djibouti</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Center (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="learningCenter"
                        value={billingInfo.learningCenter}
                        onChange={handleBillingChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">Learning online (no center)</option>
                        {LEARNING_CENTERS.map(center => (
                          <option key={center.id} value={center.id}>{center.name} - {center.location}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select if you want to attend classes in person
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

                <div className="space-y-4">
                  {/* Mobile Money */}
                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === PAYMENT_METHODS.MOBILE_MONEY 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={PAYMENT_METHODS.MOBILE_MONEY}
                        checked={paymentMethod === PAYMENT_METHODS.MOBILE_MONEY}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Smartphone size={24} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Mobile Money</p>
                        <p className="text-sm text-gray-500">Zaad, EVC Plus, Sahal via WaafiPay</p>
                      </div>
                    </div>

                    {paymentMethod === PAYMENT_METHODS.MOBILE_MONEY && (
                      <div className="mt-4 pl-9">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="+252 61 234 5678"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your Zaad, EVC Plus, or Sahal number. You'll receive a payment request on your phone.
                        </p>
                      </div>
                    )}
                  </label>

                  {/* Pay at Learning Center */}
                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === PAYMENT_METHODS.PAY_AT_CENTER 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={PAYMENT_METHODS.PAY_AT_CENTER}
                        checked={paymentMethod === PAYMENT_METHODS.PAY_AT_CENTER}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Building2 size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Pay at Learning Center</p>
                        <p className="text-sm text-gray-500">Cash or mobile money at your center</p>
                      </div>
                    </div>

                    {paymentMethod === PAYMENT_METHODS.PAY_AT_CENTER && (
                      <div className="mt-4 pl-9">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Learning Center
                        </label>
                        <div className="space-y-2">
                          {LEARNING_CENTERS.map(center => (
                            <button
                              key={center.id}
                              type="button"
                              onClick={() => setSelectedCenter(center.id)}
                              className={`w-full p-3 border-2 rounded-xl text-left transition-colors ${
                                selectedCenter === center.id
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="font-medium">{center.name}</span>
                              <span className="block text-sm text-gray-500">{center.location}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Bank Transfer */}
                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === PAYMENT_METHODS.BANK_TRANSFER 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={PAYMENT_METHODS.BANK_TRANSFER}
                        checked={paymentMethod === PAYMENT_METHODS.BANK_TRANSFER}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Building2 size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-500">Direct bank transfer</p>
                      </div>
                    </div>

                    {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
                      <div className="mt-4 pl-9 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-2">Bank Details:</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Bank:</span> Dahabshiil Bank</p>
                          <p><span className="font-medium">Account:</span> TABSERA Education</p>
                          <p><span className="font-medium">Number:</span> 1234567890</p>
                          <p><span className="font-medium">Reference:</span> Your email address</p>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Credit/Debit Card */}
                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === PAYMENT_METHODS.CARD
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={PAYMENT_METHODS.CARD}
                        checked={paymentMethod === PAYMENT_METHODS.CARD}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <CreditCard size={24} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Credit / Debit Card</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard via WaafiPay</p>
                      </div>
                    </div>

                    {paymentMethod === PAYMENT_METHODS.CARD && (
                      <div className="mt-4 pl-9 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          You'll be redirected to WaafiPay's secure payment page to complete your card payment.
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Review Order
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>

                {/* Billing Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Billing Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 text-gray-900">{billingInfo.firstName} {billingInfo.lastName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-900">{billingInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 text-gray-900">{billingInfo.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment:</span>
                      <span className="ml-2 text-gray-900 capitalize">{paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          item.type === ITEM_TYPES.TRACK 
                            ? 'bg-blue-100' 
                            : 'bg-purple-100'
                        }`}>
                          <BookOpen size={20} className={
                            item.type === ITEM_TYPES.TRACK ? 'text-blue-600' : 'text-purple-600'
                          } />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatPrice(item.price)}/mo</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms Agreement */}
                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    I understand this is a monthly subscription that can be cancelled anytime.
                  </span>
                </label>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !agreeTerms}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Place Order - {formatPrice(total)}/month
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={`${item.type}-${item.id}`} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate pr-2">{item.name}</span>
                    <span className="text-gray-900 shrink-0">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({promoCode})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Monthly Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                  <Shield size={20} />
                  <span className="text-sm">Your payment info is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Checkout;
