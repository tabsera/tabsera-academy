/**
 * Cart Page
 * View and manage items before checkout
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import {
  ShoppingCart, Trash2, Tag, ArrowRight, ArrowLeft,
  BookOpen, Clock, Users, X, CheckCircle, AlertCircle,
  Loader2, ShoppingBag
} from 'lucide-react';

function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    promoDiscount,
    promoCode,
    total,
    isLoading,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode,
    ITEM_TYPES,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    
    setPromoError('');
    setPromoSuccess('');
    
    const result = await applyPromoCode(promoInput);
    if (result.success) {
      setPromoSuccess(`Promo code applied! ${result.discount}% off`);
      setPromoInput('');
    } else {
      setPromoError(result.error);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={40} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any courses or tracks yet.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <BookOpen size={20} />
              Browse Courses
            </Link>
          </div>

          {/* Suggested Tracks */}
          <div className="mt-16">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">Popular Learning Tracks</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 1, name: 'Cambridge IGCSE Full', price: 80, courses: 12, color: 'blue' },
                { id: 2, name: 'Islamic Studies', price: 25, courses: 8, color: 'emerald' },
                { id: 3, name: 'ESL Intensive', price: 45, courses: 6, color: 'purple' },
              ].map(track => (
                <Link
                  key={track.id}
                  to={`/courses?track=${track.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className={`w-12 h-12 bg-${track.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                    <BookOpen size={24} className={`text-${track.color}-600`} />
                  </div>
                  <h3 className="font-bold text-gray-900">{track.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{track.courses} courses</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">{formatPrice(track.price)}/month</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex gap-4">
                  {/* Item Image/Icon */}
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === ITEM_TYPES.TRACK 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    <BookOpen size={32} className="text-white" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-1 ${
                          item.type === ITEM_TYPES.TRACK 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.type === ITEM_TYPES.TRACK ? 'Learning Track' : 'Individual Course'}
                        </span>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.type)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {item.duration}
                          </span>
                        )}
                        {item.coursesCount && (
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {item.coursesCount} courses
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price)}
                          <span className="text-sm font-normal text-gray-500">/month</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping Link */}
            <Link
              to="/courses"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                {promoCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      <span className="font-medium text-green-700">{promoCode}</span>
                      <span className="text-sm text-green-600">(-{promoDiscount}%)</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter code"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={isLoading || !promoInput.trim()}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {promoError}
                  </p>
                )}
                {promoSuccess && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} />
                    {promoSuccess}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoDiscount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
                    <span className="text-sm text-gray-500 block">/month</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              {!isAuthenticated && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  You'll need to{' '}
                  <Link to="/login" className="text-blue-600 font-medium hover:underline">
                    sign in
                  </Link>
                  {' '}or{' '}
                  <Link to="/register" className="text-blue-600 font-medium hover:underline">
                    create an account
                  </Link>
                  {' '}to complete your purchase.
                </p>
              )}

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-6 text-gray-400">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={16} />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={16} />
                    <span>Money-back Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Cart;
