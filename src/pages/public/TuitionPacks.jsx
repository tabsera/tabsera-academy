/**
 * Tuition Packs Page
 * Browse and purchase tuition credit packs
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import apiClient from '../../api/client';
import { useCart, ITEM_TYPES } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import {
  Loader2, AlertCircle, CreditCard, Clock, CheckCircle, ArrowRight,
  ShoppingCart, Sparkles, GraduationCap, Video, User
} from 'lucide-react';

function TuitionPacks() {
  const { addItem, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get('/tuition-packs');
      setPacks(res.packs || []);
    } catch (err) {
      console.error('Error fetching tuition packs:', err);
      setError(err.message || 'Failed to load tuition packs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (pack) => {
    if (isInCart(pack.id, ITEM_TYPES.TUITION_PACK)) {
      navigate('/cart');
      return;
    }

    setAddingToCart(pack.id);

    addItem({
      id: pack.id,
      type: ITEM_TYPES.TUITION_PACK,
      name: pack.name,
      price: parseFloat(pack.price),
      description: pack.description,
      creditsIncluded: pack.creditsIncluded,
      validityDays: pack.validityDays,
    });

    setTimeout(() => {
      setAddingToCart(null);
    }, 500);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading tuition packs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Tuition Packs</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchPacks}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium mb-4">
              1-on-1 Tutoring
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tuition Credit Packs
            </h1>
            <p className="text-lg text-indigo-200 mb-8">
              Purchase credits to book personalized tutoring sessions with our expert tutors.
              Each credit equals a 10-minute session.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How Tuition Credits Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: CreditCard,
                title: 'Purchase Credits',
                desc: 'Choose a pack that fits your needs and budget',
              },
              {
                icon: User,
                title: 'Browse Tutors',
                desc: 'Find the perfect tutor for your course',
              },
              {
                icon: Video,
                title: 'Book Sessions',
                desc: '1 credit = 10-minute session with your tutor',
              },
              {
                icon: GraduationCap,
                title: 'Learn & Succeed',
                desc: 'Get personalized help and master your courses',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                  <item.icon size={28} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Choose Your Pack</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            All packs include access to all tutors. Larger packs offer better value per credit.
          </p>

          {packs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packs.map((pack, idx) => {
                const inCart = isInCart(pack.id, ITEM_TYPES.TUITION_PACK);
                const isAdding = addingToCart === pack.id;
                const pricePerCredit = pack.creditsIncluded > 0 ? (parseFloat(pack.price) / pack.creditsIncluded).toFixed(2) : 0;
                const isPopular = idx === 1; // Mark middle pack as popular

                return (
                  <div
                    key={pack.id}
                    className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden relative ${
                      isPopular ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-100'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                        Most Popular
                      </div>
                    )}

                    <div className={`p-6 ${isPopular ? 'bg-gradient-to-br from-indigo-50 to-purple-50' : ''}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{pack.name}</h3>
                      {pack.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pack.description}</p>
                      )}

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            ${parseFloat(pack.price).toFixed(0)}
                          </span>
                          <span className="text-gray-500">USD</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          ${pricePerCredit} per credit
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={16} className="text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{pack.creditsIncluded} Credits</p>
                            <p className="text-xs text-gray-500">{pack.creditsIncluded * 10} minutes of tutoring</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Clock size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{pack.validityDays} Days Validity</p>
                            <p className="text-xs text-gray-500">From date of purchase</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={16} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">All Tutors</p>
                            <p className="text-xs text-gray-500">Access to every tutor</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(pack)}
                        disabled={isAdding}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
                          inCart
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : isPopular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {isAdding ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : inCart ? (
                          <>
                            <CheckCircle size={18} />
                            View Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={18} />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tuition Packs Available</h3>
              <p className="text-gray-500">Please check back later for available tuition packs.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: 'What is a tuition credit?',
                a: 'One tuition credit equals a 10-minute tutoring session with any of our approved tutors. You can use credits for any course you\'re enrolled in.',
              },
              {
                q: 'Do credits expire?',
                a: 'Yes, credits have a validity period from the date of purchase. The validity period varies by pack - check the pack details before purchasing.',
              },
              {
                q: 'Can I use credits for any course?',
                a: 'Yes! Credits can be used for tutoring sessions on any course. However, some advanced courses may require more credits per session (2x or 3x factor).',
              },
              {
                q: 'What happens if I cancel a session?',
                a: 'If you cancel a session before it starts, your credits will be refunded immediately. No-shows may result in credit loss.',
              },
              {
                q: 'Can I purchase multiple packs?',
                a: 'Yes, you can purchase multiple packs. Credits from different packs are tracked separately with their own expiry dates.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Browse our expert tutors and find the perfect match for your learning needs.
          </p>
          <Link
            to="/tutors"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Browse Tutors <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default TuitionPacks;
