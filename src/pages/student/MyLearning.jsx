/**
 * My Learning Page
 * Lists enrolled packs and courses with links to EdX platform
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle, PlayCircle, ExternalLink,
  Search, ChevronDown, ChevronRight, Award,
  BarChart3, Calendar, ArrowRight, Lock, Loader2, AlertCircle
} from 'lucide-react';
import { apiClient } from '@/api/client';

// EdX base URL
const EDX_BASE_URL = 'https://learn.tabsera.com';

function MyLearning() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ packs: [], courses: [], stats: {} });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPacks, setExpandedPacks] = useState([]);

  // Fetch learning data
  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/enrollments/my-learning');
        setData(response);
        // Expand all packs by default
        setExpandedPacks(response.packs?.map(p => p.id) || []);
      } catch (err) {
        console.error('Failed to fetch learning data:', err);
        setError(err.message || 'Failed to load your learning data');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  const togglePack = (packId) => {
    setExpandedPacks(prev =>
      prev.includes(packId)
        ? prev.filter(id => id !== packId)
        : [...prev, packId]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <PlayCircle size={12} />
            In Progress
          </span>
        );
      case 'not_started':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            <Clock size={12} />
            Not Started
          </span>
        );
      default:
        return null;
    }
  };

  const filterCourses = (courses) => {
    return courses.filter(course => {
      const matchesFilter = filter === 'all' || course.status === filter;
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const getCourseUrl = (course) => {
    if (course.externalUrl) return course.externalUrl;
    if (course.edxCourseId) return `${EDX_BASE_URL}/courses/${course.edxCourseId}/course/`;
    return `${EDX_BASE_URL}/courses`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading your learning data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { tracks: packs = [], courses: individualCourses = [], stats = {} } = data;
  const hasEnrollments = packs.length > 0 || individualCourses.length > 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-500">Access your enrolled packs and courses</p>
        </div>
        <a
          href={EDX_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          <ExternalLink size={18} />
          Open EdX Platform
        </a>
      </div>

      {hasEnrollments ? (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      filter === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Overall Progress Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPacks || 0}</p>
                  <p className="text-sm text-gray-500">Enrolled Packs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses || 0}</p>
                  <p className="text-sm text-gray-500">Total Courses</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCourses || 0}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.overallProgress || 0}%</p>
                  <p className="text-sm text-gray-500">Overall Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Packs */}
          {packs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Enrolled Packs</h2>
              <div className="space-y-4">
                {packs.map(pack => {
                  const isExpanded = expandedPacks.includes(pack.id);
                  const filteredCourses = filterCourses(pack.courses);

                  return (
                    <div key={pack.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Pack Header */}
                      <div
                        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => togglePack(pack.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl overflow-hidden">
                              {pack.image ? (
                                <img src={pack.image} alt={pack.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen size={28} />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{pack.title}</h3>
                              {pack.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{pack.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  Enrolled: {formatDate(pack.enrolledAt)}
                                </span>
                                <span>•</span>
                                <span>{pack.completedCourses}/{pack.totalCourses} courses completed</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                              <p className="text-2xl font-bold text-blue-600">{pack.progress}%</p>
                              <p className="text-xs text-gray-500">Complete</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pack.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pack Actions */}
                      <div className="px-5 pb-4 flex gap-3">
                        <a
                          href={`${EDX_BASE_URL}/dashboard`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Open in EdX
                        </a>
                        <Link
                          to={`/student/certificates`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                        >
                          <Award size={16} />
                          View Certificates
                        </Link>
                      </div>

                      {/* Courses List (Expandable) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          <div className="p-4 bg-gray-50">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              Courses in this pack ({filteredCourses.length})
                            </p>
                            <div className="space-y-2">
                              {filteredCourses.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4 text-center">
                                  No courses match your filter criteria
                                </p>
                              ) : (
                                filteredCourses.map(course => (
                                  <div
                                    key={course.id}
                                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                          course.status === 'completed' ? 'bg-green-100' :
                                          course.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                          {course.status === 'completed' ? (
                                            <CheckCircle size={20} className="text-green-600" />
                                          ) : course.status === 'in_progress' ? (
                                            <PlayCircle size={20} className="text-blue-600" />
                                          ) : (
                                            <Lock size={20} className="text-gray-400" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">{course.title}</p>
                                          <p className="text-xs text-gray-500">
                                            {course.status === 'completed'
                                              ? `Completed: ${formatDate(course.completedAt)}`
                                              : course.status === 'in_progress'
                                              ? `Last accessed: ${getTimeAgo(course.startDate)}`
                                              : 'Not started yet'
                                            }
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        {course.status !== 'not_started' && (
                                          <div className="text-right hidden sm:block">
                                            <p className="text-sm font-semibold text-gray-900">{course.progress}%</p>
                                            <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                                              <div
                                                className={`h-1.5 rounded-full ${
                                                  course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${course.progress}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                        <a
                                          href={getCourseUrl(course)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                            course.status === 'completed'
                                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}
                                        >
                                          {course.status === 'completed' ? 'Review' :
                                           course.status === 'in_progress' ? 'Continue' : 'Start'}
                                          <ExternalLink size={14} />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual Courses */}
          {individualCourses.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Individual Courses</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {individualCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {course.image ? (
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={24} className="text-purple-600" />
                        )}
                      </div>
                      {getStatusBadge(course.status)}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Enrolled: {formatDate(course.enrolledAt)}
                      {course.status === 'in_progress' && ` • Last accessed: ${getTimeAgo(course.startDate)}`}
                    </p>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <a
                      href={getCourseUrl(course)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors"
                    >
                      {course.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a pack or course</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Courses
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyLearning;
