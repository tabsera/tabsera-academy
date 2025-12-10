import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useCart, ITEM_TYPES } from '../../context/CartContext';
import { courses } from '../../utils/mockData';
import { 
  Star, Clock, BookOpen, Users, CheckCircle, Globe, Award, 
  PlayCircle, ChevronDown, ShoppingCart, Building2, X, Check 
} from 'lucide-react';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart, ITEM_TYPES } = useCart();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const course = courses.find(c => c.id === id) || courses[0];
  const inCart = isInCart(course.id, ITEM_TYPES.COURSE);

  const handleAddToCart = () => {
    addItem({
      id: course.id,
      type: ITEM_TYPES.COURSE,
      name: course.title,
      price: course.price,
      originalPrice: course.originalPrice,
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

  const curriculum = [
    { title: 'Introduction & Foundations', duration: '2h 15m', lessons: 12 },
    { title: 'Core Concepts', duration: '3h 45m', lessons: 18 },
    { title: 'Practical Applications', duration: '5h 30m', lessons: 24 },
    { title: 'Advanced Topics', duration: '8h 10m', lessons: 35 },
    { title: 'Exam Preparation', duration: '4h 00m', lessons: 20 },
  ];

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
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                {course.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-yellow-500">{course.rating}</span>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-blue-600 underline">({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{course.duration}</span>
                </div>
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
                <span>{curriculum.length} sections • {course.lessons} lectures • {course.duration} total</span>
              </div>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white">
                {curriculum.map((section, idx) => (
                  <div key={idx}>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left">
                      <div className="flex items-center gap-3">
                        <ChevronDown size={20} className="text-gray-500" />
                        <span className="font-bold text-gray-900">{section.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{section.lessons} lectures • {section.duration}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Instructor</h2>
              <div className="flex items-start gap-6">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-100" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{course.instructor.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{course.instructor.role}</p>
                  <p className="text-gray-600 leading-relaxed">
                    An experienced educator dedicated to helping students achieve academic excellence through innovative teaching methods.
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
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <PlayCircle size={32} className="text-blue-600 ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                    {course.originalPrice && (
                      <>
                        <span className="text-lg text-gray-500 line-through mb-1">${course.originalPrice}</span>
                        <span className="text-sm font-bold text-red-500 mb-1.5">
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
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
                    <Link to="/centers" className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Building2 size={18} />
                      Find a Learning Center
                    </Link>
                  </div>

                  <p className="text-center text-xs text-gray-500 mb-6">30-Day Money-Back Guarantee</p>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">This course includes:</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-3"><PlayCircle size={16} className="text-gray-400" />{course.duration} on-demand video</li>
                      <li className="flex items-center gap-3"><BookOpen size={16} className="text-gray-400" />{course.lessons} downloadable resources</li>
                      <li className="flex items-center gap-3"><Award size={16} className="text-gray-400" />Certificate of completion</li>
                      <li className="flex items-center gap-3"><Globe size={16} className="text-gray-400" />Full lifetime access</li>
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
                <p className="text-lg font-bold text-blue-600 mt-2">${course.price}</p>
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
