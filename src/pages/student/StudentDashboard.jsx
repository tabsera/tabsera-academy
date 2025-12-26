/**
 * Student Dashboard
 * Overview of enrolled courses, progress, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '@/api/client';
import {
  BookOpen, Clock, Award, ArrowRight,
  PlayCircle, CreditCard, ExternalLink,
  CheckCircle, Loader2
} from 'lucide-react';

// EdX base URL
const EDX_BASE_URL = 'https://cambridge.tabsera.com';

function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [learningData, setLearningData] = useState({ tracks: [], courses: [], stats: {} });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/enrollments/my-learning');
        setLearningData(response);
      } catch (err) {
        console.error('Failed to fetch learning data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUserFirstName = () => {
    return user?.first_name || user?.firstName || 'Student';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getCourseUrl = (course) => {
    if (course.externalUrl) return course.externalUrl;
    if (course.edxCourseId) return `${EDX_BASE_URL}/courses/${course.edxCourseId}/course/`;
    return `${EDX_BASE_URL}/courses`;
  };

  const { tracks, stats } = learningData;

  // Get courses that are in progress for "Continue Learning" section
  const inProgressTracks = tracks.filter(t => t.progress > 0 && t.progress < 100).slice(0, 2);

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {getUserFirstName()}!
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's your learning progress overview.
        </p>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Enrolled Tracks</span>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTracks || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Active programs</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Courses Completed</span>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completedCourses || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              of {stats.totalCourses || 0} total
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">In Progress</span>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgressCourses || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Courses active</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Overall Progress</span>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award size={20} className="text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overallProgress || 0}%</p>
            <Link to="/student/certificates" className="text-sm text-blue-600 mt-1 hover:underline">
              View certificates
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Continue Learning</h2>
            <Link to="/student/my-learning" className="text-sm text-blue-600 font-medium hover:text-blue-700">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : inProgressTracks.length > 0 ? (
            inProgressTracks.map((track) => {
              // Find the first in-progress course
              const nextCourse = track.courses.find(c => c.status === 'in_progress') ||
                                 track.courses.find(c => c.status === 'not_started');

              return (
                <div key={track.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{track.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {track.completedCourses} of {track.totalCourses} courses completed
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {track.progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${track.progress}%` }}
                      />
                    </div>

                    {/* Next Course */}
                    {nextCourse && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <PlayCircle size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {nextCourse.status === 'not_started' ? 'Up Next' : 'Continue'}: {nextCourse.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {nextCourse.progress}% complete
                            </p>
                          </div>
                        </div>
                        <a
                          href={getCourseUrl(nextCourse)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                          {nextCourse.status === 'not_started' ? 'Start' : 'Continue'}
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : tracks.length > 0 ? (
            // Show first track even if completed
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{tracks[0].title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {tracks[0].completedCourses} of {tracks[0].totalCourses} courses completed
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {tracks[0].progress}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${tracks[0].progress}%` }}
                  />
                </div>
                <Link
                  to="/student/my-learning"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200"
                >
                  View All Courses
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center">
              <BookOpen size={40} className="text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-4">Start your learning journey today</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
              >
                Browse Courses
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Explore More Courses */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Explore More Courses</h3>
                <p className="text-blue-100 mt-1">
                  Discover new tracks and expand your knowledge
                </p>
              </div>
              <Link
                to="/courses"
                className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Browse Catalog
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href={EDX_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ExternalLink size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Open EdX Platform</p>
                  <p className="text-xs text-gray-500">Continue learning</p>
                </div>
              </a>
              <Link
                to="/student/my-learning"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">My Learning</p>
                  <p className="text-xs text-gray-500">View all courses</p>
                </div>
              </Link>
              <Link
                to="/student/certificates"
                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Certificates</p>
                  <p className="text-xs text-gray-500">View earned certificates</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Learning Center Info */}
          {user?.center && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Your Learning Center</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                  <BookOpen size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.center.name}</p>
                  {user.center.city && (
                    <p className="text-sm text-gray-500">{user.center.city}, {user.center.country}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Help */}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-4">
              Our support team is available to assist you with any questions.
            </p>
            <a
              href="mailto:support@tabsera.com"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
