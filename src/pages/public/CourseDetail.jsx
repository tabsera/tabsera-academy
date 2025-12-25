import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import {
  Star, Clock, BookOpen, Users, CheckCircle, Globe, Award,
  PlayCircle, ChevronDown, ShoppingCart, Building2, X, Check,
  Loader2, AlertCircle, ExternalLink, GraduationCap, Lock
} from 'lucide-react';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart, ITEM_TYPES } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Data state
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  // Check enrollment status when user or course changes
  useEffect(() => {
    if (isAuthenticated && course) {
      checkEnrollmentStatus();
    } else {
      setIsEnrolled(false);
    }
  }, [isAuthenticated, course]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/courses/${id}`);
      setCourse(response.course);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      setCheckingEnrollment(true);
      const response = await apiClient.get(`/enrollments/check/${id}`);
      setIsEnrolled(response.enrolled || false);
    } catch (err) {
      // If endpoint doesn't exist or error, assume not enrolled
      console.log('Enrollment check:', err.message);
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const inCart = course ? isInCart(course.id, ITEM_TYPES.COURSE) : false;

  const handleAddToCart = () => {
    if (!course) return;
    addItem({
      id: course.id,
      type: ITEM_TYPES.COURSE,
      name: course.title,
      price: parseFloat(course.price) || 0,
      originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : null,
      description: course.description,
      duration: course.duration,
      image: course.image,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleEnrollNow = () => {
    if (!inCart) {
      handleAddToCart();
    }
    navigate('/cart');
  };

  const features = [
    'Complete curriculum aligned with Cambridge standards',
    'Interactive video lessons with quizzes',
    'Downloadable study materials and worksheets',
    'Certificate of completion',
    'Access to student support community',
    'Progress tracking and assessments'
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested course could not be found.'}</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const price = parseFloat(course.price) || 0;
  const lessons = course.lessons || 0;
  const category = course.level || course.category || 'Course';
  const image = course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

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
            <span className="text-gray-900 font-medium truncate">{course.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {category}
                </span>
                {course.track && (
                  <Link
                    to={`/tracks/${course.track.slug || course.track.id}`}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200"
                  >
                    {course.track.title}
                  </Link>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                {course.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </div>
                )}
                {lessons > 0 && (
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    <span>{lessons} lessons</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex items-center gap-1">
                    <Award size={16} />
                    <span>{course.level}</span>
                  </div>
                )}
              </div>
            </div>

            {/* What you'll learn */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="flex-shrink-0 text-green-500 mt-1" size={18} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{lessons} lessons • {course.duration || 'Self-paced'}</span>
              </div>
              <div className="border border-gray-200 rounded-lg bg-white p-6">
                <div className="flex items-center gap-4 text-gray-600">
                  <BookOpen size={24} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Comprehensive Course Material</p>
                    <p className="text-sm">This course includes {lessons} lessons covering all essential topics.</p>
                  </div>
                </div>
                {course.externalUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={course.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink size={18} />
                      View Course on EdX Platform
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Instructor</h2>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-100">
                  <GraduationCap size={40} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tabsera Academy</h3>
                  <p className="text-blue-600 font-medium mb-4">Expert Instructors</p>
                  <p className="text-gray-600 leading-relaxed">
                    Our experienced educators are dedicated to helping students achieve academic excellence
                    through innovative teaching methods aligned with Cambridge International standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="relative h-48 bg-gray-900 group cursor-pointer">
                  <img
                    src={image}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-70"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <PlayCircle size={32} className="text-blue-600 ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900">${price.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {/* Show "Start Learning" only for enrolled students */}
                    {isAuthenticated && isEnrolled && course.externalUrl ? (
                      <a
                        href={course.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={18} />
                        Start Learning on EdX
                      </a>
                    ) : isAuthenticated && isEnrolled ? (
                      <div className="w-full py-3 px-4 bg-green-100 text-green-700 font-bold rounded-lg flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        You're Enrolled
                      </div>
                    ) : (
                      <>
                        {/* Enroll Now / Add to Cart for non-enrolled users */}
                        <button
                          onClick={handleEnrollNow}
                          className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={18} />
                          Enroll Now
                        </button>
                        {!inCart ? (
                          <button
                            onClick={handleAddToCart}
                            className={`w-full py-3 px-4 border-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                              addedToCart
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {addedToCart ? (
                              <>
                                <Check size={18} />
                                Added to Cart!
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={18} />
                                Add to Cart
                              </>
                            )}
                          </button>
                        ) : (
                          <Link
                            to="/cart"
                            className="w-full py-3 px-4 border-2 border-green-500 bg-green-50 text-green-700 font-bold rounded-lg flex items-center justify-center gap-2"
                          >
                            <Check size={18} />
                            View in Cart
                          </Link>
                        )}
                      </>
                    )}

                    {/* Show external link info for non-enrolled users if course has EdX link */}
                    {!isEnrolled && course.externalUrl && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        <Lock size={16} />
                        <span>EdX course access available after enrollment</span>
                      </div>
                    )}

                    <Link to="/centers" className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Building2 size={18} />
                      Find a Learning Center
                    </Link>
                  </div>

                  <p className="text-center text-xs text-gray-500 mb-6">30-Day Money-Back Guarantee</p>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">This course includes:</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      {course.duration && (
                        <li className="flex items-center gap-3">
                          <PlayCircle size={16} className="text-gray-400" />
                          {course.duration} of content
                        </li>
                      )}
                      {lessons > 0 && (
                        <li className="flex items-center gap-3">
                          <BookOpen size={16} className="text-gray-400" />
                          {lessons} lessons
                        </li>
                      )}
                      <li className="flex items-center gap-3">
                        <Award size={16} className="text-gray-400" />
                        Certificate of completion
                      </li>
                      <li className="flex items-center gap-3">
                        <Globe size={16} className="text-gray-400" />
                        Full lifetime access
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEnrollModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button onClick={() => setShowEnrollModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Enroll in Course</h3>
            <p className="text-gray-600 mb-6">Choose how you'd like to access <strong>{course.title}</strong>:</p>

            <div className="space-y-4 mb-6">
              <button className="w-full p-4 border-2 border-blue-500 bg-blue-50 rounded-xl text-left hover:bg-blue-100">
                <p className="font-bold text-gray-900">Self-Enrollment (Online)</p>
                <p className="text-sm text-gray-600">Study at your own pace with full online access</p>
                <p className="text-lg font-bold text-blue-600 mt-2">${price.toFixed(2)}</p>
              </button>

              <Link to="/centers" className="block w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-gray-300">
                <p className="font-bold text-gray-900">Learning Center Enrollment</p>
                <p className="text-sm text-gray-600">Join a physical classroom with live instruction</p>
                <p className="text-sm text-blue-600 mt-2">Find a center near you →</p>
              </Link>
            </div>

            <button onClick={() => setShowEnrollModal(false)} className="w-full py-2 text-gray-600 font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CourseDetail;
