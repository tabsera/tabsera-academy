/**
 * My Learning Page
 * Lists enrolled tracks and courses with links to EdX platform
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle, PlayCircle, ExternalLink,
  Filter, Search, ChevronDown, ChevronRight, Award,
  BarChart3, Calendar, ArrowRight, Lock
} from 'lucide-react';

// Mock data - replace with API calls
const mockEnrolledTracks = [
  {
    id: '1',
    name: 'Cambridge IGCSE Full Program',
    description: 'Complete IGCSE curriculum covering all core subjects',
    progress: 45,
    enrolledDate: 'January 2026',
    expiresDate: 'December 2026',
    status: 'active',
    image: '/tracks/igcse.jpg',
    edxProgramUrl: 'https://cambridge.tabsera.com/programs/igcse-full',
    courses: [
      { id: 'c1', name: 'IGCSE Mathematics', progress: 78, status: 'in_progress', edxUrl: 'https://cambridge.tabsera.com/courses/igcse-math', lastAccessed: '2 hours ago' },
      { id: 'c2', name: 'IGCSE English Language', progress: 65, status: 'in_progress', edxUrl: 'https://cambridge.tabsera.com/courses/igcse-english', lastAccessed: 'Yesterday' },
      { id: 'c3', name: 'IGCSE Physics', progress: 52, status: 'in_progress', edxUrl: 'https://cambridge.tabsera.com/courses/igcse-physics', lastAccessed: '3 days ago' },
      { id: 'c4', name: 'IGCSE Chemistry', progress: 100, status: 'completed', edxUrl: 'https://cambridge.tabsera.com/courses/igcse-chemistry', completedDate: 'Dec 15, 2025' },
      { id: 'c5', name: 'IGCSE Biology', progress: 100, status: 'completed', edxUrl: 'https://cambridge.tabsera.com/courses/igcse-biology', completedDate: 'Nov 28, 2025' },
      { id: 'c6', name: 'IGCSE History', progress: 0, status: 'not_started', edxUrl: 'https://cambridge.tabsera.com/courses/igcse-history' },
      { id: 'c7', name: 'IGCSE Geography', progress: 0, status: 'not_started', edxUrl: 'https://cambridge.tabsera.com/courses/igcse-geography' },
    ]
  },
  {
    id: '2',
    name: 'Islamic Studies Program',
    description: 'Comprehensive Islamic education including Quran, Fiqh, and Seerah',
    progress: 72,
    enrolledDate: 'September 2025',
    expiresDate: 'August 2026',
    status: 'active',
    image: '/tracks/islamic.jpg',
    edxProgramUrl: 'https://cambridge.tabsera.com/programs/islamic-studies',
    courses: [
      { id: 'i1', name: 'Quranic Studies & Tajweed', progress: 100, status: 'completed', edxUrl: 'https://cambridge.tabsera.com/courses/quran-tajweed', completedDate: 'Oct 20, 2025' },
      { id: 'i2', name: 'Islamic Fiqh Basics', progress: 85, status: 'in_progress', edxUrl: 'https://cambridge.tabsera.com/courses/fiqh-basics', lastAccessed: 'Today' },
      { id: 'i3', name: 'Seerah - Life of the Prophet', progress: 100, status: 'completed', edxUrl: 'https://cambridge.tabsera.com/courses/seerah', completedDate: 'Nov 10, 2025' },
      { id: 'i4', name: 'Islamic History', progress: 45, status: 'in_progress', edxUrl: 'https://cambridge.tabsera.com/courses/islamic-history', lastAccessed: '5 days ago' },
    ]
  }
];

const mockIndividualCourses = [
  {
    id: 'ind1',
    name: 'Arabic for Beginners',
    progress: 30,
    status: 'in_progress',
    edxUrl: 'https://cambridge.tabsera.com/courses/arabic-beginners',
    lastAccessed: '1 week ago',
    enrolledDate: 'December 2025'
  }
];

function MyLearning() {
  const [filter, setFilter] = useState('all'); // all, in_progress, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTracks, setExpandedTracks] = useState(['1', '2']);

  const toggleTrack = (trackId) => {
    setExpandedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
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
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const getTrackStats = (track) => {
    const completed = track.courses.filter(c => c.status === 'completed').length;
    const inProgress = track.courses.filter(c => c.status === 'in_progress').length;
    return { completed, inProgress, total: track.courses.length };
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-500">Access your enrolled tracks and courses</p>
        </div>
        <a
          href="https://cambridge.tabsera.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          <ExternalLink size={18} />
          Open EdX Platform
        </a>
      </div>

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
              <p className="text-2xl font-bold text-gray-900">{mockEnrolledTracks.length}</p>
              <p className="text-sm text-gray-500">Enrolled Tracks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockEnrolledTracks.reduce((acc, t) => acc + t.courses.length, 0) + mockIndividualCourses.length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {mockEnrolledTracks.reduce((acc, t) => acc + t.courses.filter(c => c.status === 'completed').length, 0)}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">Certificates Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Tracks */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Enrolled Tracks</h2>
        <div className="space-y-4">
          {mockEnrolledTracks.map(track => {
            const stats = getTrackStats(track);
            const isExpanded = expandedTracks.includes(track.id);
            const filteredCourses = filterCourses(track.courses);

            return (
              <div key={track.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Track Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleTrack(track.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl">
                        📚
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{track.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{track.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Enrolled: {track.enrolledDate}
                          </span>
                          <span>•</span>
                          <span>{stats.completed}/{stats.total} courses completed</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-2xl font-bold text-blue-600">{track.progress}%</p>
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
                        style={{ width: `${track.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Track Actions */}
                <div className="px-5 pb-4 flex gap-3">
                  <a
                    href={track.edxProgramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Open in EdX
                  </a>
                  <Link
                    to={`/student/certificates?track=${track.id}`}
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
                        Courses in this track ({filteredCourses.length})
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
                                    <p className="font-medium text-gray-900">{course.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {course.status === 'completed' 
                                        ? `Completed: ${course.completedDate}`
                                        : course.status === 'in_progress'
                                        ? `Last accessed: ${course.lastAccessed}`
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
                                    href={course.edxUrl}
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

      {/* Individual Courses */}
      {mockIndividualCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Individual Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockIndividualCourses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-xl">
                    🌍
                  </div>
                  {getStatusBadge(course.status)}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enrolled: {course.enrolledDate} • Last accessed: {course.lastAccessed}
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
                  href={course.edxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors"
                >
                  Continue Learning
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {mockEnrolledTracks.length === 0 && mockIndividualCourses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a track or course</p>
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
