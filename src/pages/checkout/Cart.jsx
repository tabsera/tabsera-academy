/**
 * Cart Page
 * View and manage items before checkout
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import apiClient from '../../api/client';
import {
  ShoppingCart, Trash2, Tag, ArrowRight, ArrowLeft,
  BookOpen, Clock, Users, X, CheckCircle, AlertCircle,
  Loader2, ShoppingBag, GraduationCap
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
  const [suggestedTracks, setSuggestedTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Fetch suggested tracks when cart is empty
  useEffect(() => {
    if (items.length === 0) {
      fetchSuggestedTracks();
    }
  }, [items.length]);

  const fetchSuggestedTracks = async () => {
    try {
      setLoadingTracks(true);
      const response = await apiClient.get('/tracks');
      setSuggestedTracks(response.tracks || []);
    } catch (err) {
      console.error('Error fetching tracks:', err);
    } finally {
      setLoadingTracks(false);
    }
  };

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

  // Color classes for track cards
  const trackColors = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-orange-100', text: 'text-orange-600' },
    { bg: 'bg-pink-100', text: 'text-pink-600' },
    { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  ];

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
            {loadingTracks ? (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : suggestedTracks.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {suggestedTracks.slice(0, 3).map((track, index) => {
                  const colors = trackColors[index % trackColors.length];
                  return (
                    <Link
                      key={track.id}
                      to={`/tracks/${track.slug || track.id}`}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all"
                    >
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                        <GraduationCap size={24} className={colors.text} />
                      </div>
                      <h3 className="font-bold text-gray-900">{track.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{track.coursesCount || 0} courses</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {formatPrice(parseFloat(track.price) || 0)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Link to="/courses" className="text-blue-600 hover:underline">
                  Browse all courses →
                </Link>
              </div>
            )}
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
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add(
                            item.type === ITEM_TYPES.TRACK
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500'
                          );
                          e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        item.type === ITEM_TYPES.TRACK
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        <BookOpen size={32} className="text-white" />
                      </div>
                    )}
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
                          {item.type === ITEM_TYPES.TRACK ? 'Learning Track' : 'Course'}
                        </span>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
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
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price)}
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
