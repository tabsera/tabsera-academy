/**
 * Tutors Listing Page
 * Browse available tutors and their courses
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { tutorsApi } from '../../api/tutors';
import apiClient from '../../api/client';
import {
  Search, Loader2, AlertCircle, Star, Video, GraduationCap,
  MapPin, Clock, Filter, X, ChevronDown, ArrowRight, User
} from 'lucide-react';

function Tutors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState(searchParams.get('course') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [courseFilter, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (courseFilter) params.courseId = courseFilter;
      if (searchQuery) params.search = searchQuery;

      const [tutorsRes, coursesRes] = await Promise.all([
        tutorsApi.listTutors(params),
        apiClient.get('/courses', { limit: 100 }),
      ]);

      setTutors(tutorsRes.tutors || []);
      setPagination(prev => ({
        ...prev,
        total: tutorsRes.pagination?.total || 0,
      }));
      setCourses(coursesRes.courses || []);
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError(err.message || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  // Handle course filter change
  const handleCourseChange = (courseId) => {
    setCourseFilter(courseId);
    setPagination(prev => ({ ...prev, page: 1 }));
    if (courseId) {
      searchParams.set('course', courseId);
    } else {
      searchParams.delete('course');
    }
    setSearchParams(searchParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCourseFilter('');
    searchParams.delete('course');
    setSearchParams(searchParams);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const selectedCourse = courses.find(c => c.id === courseFilter);

  if (loading && tutors.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading tutors...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && tutors.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Tutors</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchData}
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
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Tutor</h1>
          <p className="text-indigo-200 max-w-2xl mb-8">
            Connect with expert tutors for personalized 1-on-1 sessions.
            Get help with your courses and accelerate your learning journey.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tutors by name or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-4 text-indigo-300" size={20} />
              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            {/* Course Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter size={18} />
                <span>{selectedCourse ? selectedCourse.title : 'Filter by Course'}</span>
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => { handleCourseChange(''); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!courseFilter ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      All Courses
                    </button>
                    {courses.map(course => (
                      <button
                        key={course.id}
                        onClick={() => { handleCourseChange(course.id); setShowFilters(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${courseFilter === course.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {course.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters */}
            {(courseFilter || searchQuery) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{tutors.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{pagination.total}</span> tutors
          </p>
        </div>

        {/* Selected Course Banner */}
        {selectedCourse && (
          <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100">
                <GraduationCap size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Tutors for: {selectedCourse.title}</p>
                <p className="text-sm text-gray-600">{selectedCourse.level || 'All levels'}</p>
              </div>
            </div>
            <button
              onClick={() => handleCourseChange('')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        )}

        {/* Tutors Grid */}
        {tutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery || courseFilter
                ? 'Try adjusting your filters or search terms.'
                : 'No tutors are available at the moment. Please check back later.'}
            </p>
            {(searchQuery || courseFilter) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
            Purchase a Tuition Pack to get credits for booking sessions with any of our tutors.
          </p>
          <Link
            to="/tuition"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            View Tuition Packs <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </Layout>
  );
}

// Tutor Card Component
function TutorCard({ tutor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header with Avatar */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-6 pb-14">
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {tutor.avatar ? (
                <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
              ) : (
                tutor.name?.charAt(0).toUpperCase() || 'T'
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-12">
        {/* Name and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{tutor.name}</h3>
          {tutor.avgRating > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-yellow-700">{tutor.avgRating?.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Headline */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {tutor.headline || 'Expert Tutor'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Video size={16} />
            <span>{tutor.sessionsCompleted || 0} sessions</span>
          </div>
          {tutor.totalReviews > 0 && (
            <div className="flex items-center gap-1">
              <Star size={16} />
              <span>{tutor.totalReviews} reviews</span>
            </div>
          )}
        </div>

        {/* Courses */}
        {tutor.courses && tutor.courses.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Teaches</p>
            <div className="flex flex-wrap gap-1.5">
              {tutor.courses.slice(0, 3).map(course => (
                <span
                  key={course.id}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg"
                >
                  {course.title}
                </span>
              ))}
              {tutor.courses.length > 3 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  +{tutor.courses.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timezone */}
        {tutor.timezone && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Clock size={16} />
            <span>{tutor.timezone}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            to={`/tutors/${tutor.id}`}
            className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Tutors;
