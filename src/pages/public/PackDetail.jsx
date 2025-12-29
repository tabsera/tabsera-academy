/**
 * Pack Detail Page
 * Shows learning pack information with its courses and tuition packs
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useCart } from '../../context/CartContext';
import apiClient from '../../api/client';
import SafeHTML from '../../components/SafeHTML';
import {
  BookOpen, Clock, Users, CheckCircle, Award,
  ShoppingCart, Loader2, AlertCircle, ArrowLeft,
  GraduationCap, Check, ExternalLink, CreditCard
} from 'lucide-react';

function PackDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart, ITEM_TYPES } = useCart();

  const [pack, setPack] = useState(null);
  const [courses, setCourses] = useState([]);
  const [tuitionPacks, setTuitionPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});

  useEffect(() => {
    fetchPackData();
  }, [slug]);

  const fetchPackData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/packs/${slug}`);
      setPack(response.pack);
      setCourses(response.courses || []);
      setTuitionPacks(response.tuitionPacks || []);
    } catch (err) {
      console.error('Error fetching pack:', err);
      setError(err.message || 'Failed to load learning pack');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourseToCart = (course) => {
    addItem({
      id: course.id,
      type: ITEM_TYPES.COURSE,
      name: course.title,
      price: parseFloat(course.price) || 0,
      description: course.description,
      duration: course.duration,
      image: course.image,
    });
    setAddedToCart(prev => ({ ...prev, [course.id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [course.id]: false }));
    }, 2000);
  };

  const handleAddPackToCart = () => {
    addItem({
      id: pack.id,
      type: ITEM_TYPES.PACK,
      name: pack.title,
      price: parseFloat(pack.price) || 0,
      originalPrice: parseFloat(pack.originalPrice) || 0,
      description: pack.description,
      image: pack.image,
      coursesCount: courses.length,
      tuitionPacksCount: tuitionPacks.length,
    });
    navigate('/cart');
  };

  // Calculate total stats
  const totalLessons = courses.reduce((sum, c) => sum + (c.lessons || 0), 0);
  const packInCart = pack ? isInCart(pack.id, ITEM_TYPES.PACK) : false;

  // Get pricing info from pack (calculated by backend)
  const packPrice = parseFloat(pack?.price || 0);
  const originalPrice = parseFloat(pack?.originalPrice || 0);
  const savings = parseFloat(pack?.savings || 0);
  const hasDiscount = savings > 0;

  // Calculate total tuition credits
  const totalCredits = tuitionPacks.reduce((sum, tp) => {
    return sum + (tp.creditsIncluded || 0) * (tp.quantity || 1);
  }, 0);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !pack) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Learning Pack Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested learning pack could not be found.'}</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Browse All Courses
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/courses" className="hover:text-blue-600">Courses</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate">{pack.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
                <GraduationCap size={16} className="mr-2" />
                Learning Pack
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{pack.title}</h1>
              <SafeHTML html={pack.description} className="text-xl text-blue-100 mb-8" />

              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} />
                  <span>{courses.length} Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{totalLessons} Total Lessons</span>
                </div>
                {totalCredits > 0 && (
                  <div className="flex items-center gap-2">
                    <CreditCard size={20} />
                    <span>{totalCredits} Tuition Credits</span>
                  </div>
                )}
                {pack.level && (
                  <div className="flex items-center gap-2">
                    <Award size={20} />
                    <span>{pack.level}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:text-right">
              {pack.image && (
                <img
                  src={pack.image}
                  alt={pack.title}
                  className="w-full max-w-md mx-auto lg:ml-auto rounded-2xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Course List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Courses in this Pack ({courses.length})
            </h2>

            {courses.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses available in this pack yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course, index) => {
                  const inCart = isInCart(course.id, ITEM_TYPES.COURSE);
                  const justAdded = addedToCart[course.id];

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Course Number */}
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                        </div>

                        {/* Course Info */}
                        <div className="flex-grow">
                          <Link
                            to={`/courses/${course.id}`}
                            className="text-lg font-bold text-gray-900 hover:text-blue-600"
                          >
                            {course.title}
                          </Link>
                          <SafeHTML
                            html={course.description}
                            className="text-gray-600 text-sm mt-1"
                            truncate
                          />
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                            {course.lessons > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen size={14} />
                                {course.lessons} lessons
                              </span>
                            )}
                            {course.duration && (
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {course.duration}
                              </span>
                            )}
                            {course.level && (
                              <span className="flex items-center gap-1">
                                <Award size={14} />
                                {course.level}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            ${parseFloat(course.price || 0).toFixed(2)}
                          </span>

                          <div className="flex items-center gap-2">
                            {course.externalUrl && (
                              <a
                                href={course.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="View on EdX"
                              >
                                <ExternalLink size={18} />
                              </a>
                            )}

                            {inCart ? (
                              <Link
                                to="/cart"
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm"
                              >
                                <Check size={16} />
                                In Cart
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleAddCourseToCart(course)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                  justAdded
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {justAdded ? (
                                  <>
                                    <Check size={16} />
                                    Added!
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart size={16} />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tuition Packs Section */}
            {tuitionPacks.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Included Tuition Packs ({tuitionPacks.length})
                </h2>
                <div className="space-y-4">
                  {tuitionPacks.map((tp) => (
                    <div
                      key={tp.id}
                      className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="text-purple-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-900">{tp.name}</h3>
                            {tp.quantity > 1 && (
                              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                                x{tp.quantity}
                              </span>
                            )}
                          </div>
                          {tp.description && (
                            <p className="text-gray-600 text-sm mb-3">{tp.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{tp.creditsIncluded * (tp.quantity || 1)} credits</span>
                            <span>Valid for {tp.validityDays} days</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-purple-600">
                            ${(parseFloat(tp.price) * (tp.quantity || 1)).toFixed(2)}
                          </span>
                          {tp.quantity > 1 && (
                            <p className="text-xs text-gray-500">${parseFloat(tp.price).toFixed(2)} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Pack Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Courses</span>
                    <span className="font-semibold">{courses.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Lessons</span>
                    <span className="font-semibold">{totalLessons}</span>
                  </div>
                  {totalCredits > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tuition Credits</span>
                      <span className="font-semibold">{totalCredits}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Level</span>
                    <span className="font-semibold">{pack.level || 'All Levels'}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    {hasDiscount && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">Original Price</span>
                        <span className="text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Pack Price</span>
                      <span className="text-2xl font-bold text-blue-600">${packPrice.toFixed(2)}</span>
                    </div>
                    {hasDiscount && (
                      <div className="mt-2 bg-green-50 text-green-700 text-center py-2 px-3 rounded-lg text-sm font-medium">
                        You save ${savings.toFixed(2)}!
                      </div>
                    )}
                  </div>
                </div>

                {(courses.length > 0 || tuitionPacks.length > 0) && (
                  <>
                    {packInCart ? (
                      <Link
                        to="/cart"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
                      >
                        <Check size={20} />
                        View Cart
                      </Link>
                    ) : (
                      <button
                        onClick={handleAddPackToCart}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                      >
                        <ShoppingCart size={20} />
                        Add Pack to Cart
                      </button>
                    )}

                    <p className="text-center text-xs text-gray-500 mt-4">
                      30-Day Money-Back Guarantee
                    </p>
                  </>
                )}

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">What's Included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Complete curriculum aligned with Cambridge standards</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Interactive video lessons with assessments</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Downloadable study materials</span>
                    </li>
                    {totalCredits > 0 && (
                      <li className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{totalCredits} tutoring credits for 1-on-1 sessions</span>
                      </li>
                    )}
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Certificate of completion</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Full lifetime access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PackDetail;
