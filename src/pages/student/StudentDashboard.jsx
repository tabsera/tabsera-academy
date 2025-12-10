/**
 * Student Dashboard
 * Overview of enrolled courses, progress, and quick actions
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Clock, Award, TrendingUp, ArrowRight,
  PlayCircle, Calendar, CreditCard, Bell, ExternalLink,
  CheckCircle, AlertCircle
} from 'lucide-react';

// Mock data - replace with API calls
const mockEnrolledTracks = [
  {
    id: '1',
    name: 'Cambridge IGCSE Full Program',
    progress: 45,
    coursesCompleted: 4,
    totalCourses: 12,
    nextLesson: 'Mathematics - Algebra Chapter 5',
    edxUrl: 'https://cambridge.tabsera.com/courses/igcse-full',
    lastAccessed: '2 hours ago',
    image: '/courses/igcse.jpg'
  },
  {
    id: '2',
    name: 'Islamic Studies',
    progress: 72,
    coursesCompleted: 6,
    totalCourses: 8,
    nextLesson: 'Fiqh - Prayer Rulings',
    edxUrl: 'https://cambridge.tabsera.com/courses/islamic-studies',
    lastAccessed: 'Yesterday',
    image: '/courses/islamic.jpg'
  }
];

const mockRecentActivity = [
  { type: 'lesson', title: 'Completed: IGCSE Physics - Forces', time: '2 hours ago', icon: CheckCircle, color: 'green' },
  { type: 'payment', title: 'Payment received - January 2026', time: 'Yesterday', icon: CreditCard, color: 'blue' },
  { type: 'certificate', title: 'Certificate earned: Quranic Arabic Basics', time: '3 days ago', icon: Award, color: 'yellow' },
];

const mockUpcomingPayment = {
  amount: 80,
  dueDate: 'February 5, 2026',
  daysLeft: 26,
  track: 'Cambridge IGCSE Full Program'
};

function StudentDashboard() {
  const { user } = useAuth();

  const getUserFirstName = () => {
    return user?.first_name || user?.firstName || 'Student';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {getUserFirstName()}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's your learning progress overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Enrolled Tracks</span>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">2</p>
          <p className="text-sm text-gray-500 mt-1">Active programs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Courses Completed</span>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">10</p>
          <p className="text-sm text-green-600 mt-1">+2 this month</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Study Hours</span>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">48</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Certificates</span>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Award size={20} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">3</p>
          <Link to="/student/certificates" className="text-sm text-blue-600 mt-1 hover:underline">
            View all →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Continue Learning</h2>
            <Link to="/student/my-learning" className="text-sm text-blue-600 font-medium hover:text-blue-700">
              View All →
            </Link>
          </div>

          {mockEnrolledTracks.map((track) => (
            <div key={track.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{track.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {track.coursesCompleted} of {track.totalCourses} courses completed
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

                {/* Next Lesson */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PlayCircle size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Next: {track.nextLesson}</p>
                      <p className="text-xs text-gray-500">Last accessed {track.lastAccessed}</p>
                    </div>
                  </div>
                  <a
                    href={track.edxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    Continue
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}

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
          {/* Upcoming Payment */}
          {mockUpcomingPayment && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Upcoming Payment</h3>
                  <p className="text-xs text-gray-500">{mockUpcomingPayment.track}</p>
                </div>
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">${mockUpcomingPayment.amount}</p>
                  <p className="text-sm text-gray-500">Due: {mockUpcomingPayment.dueDate}</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  {mockUpcomingPayment.daysLeft} days left
                </span>
              </div>
              <Link
                to="/student/payments"
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                View Payment Details
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {mockRecentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.color === 'green' ? 'bg-green-100' :
                    activity.color === 'blue' ? 'bg-blue-100' :
                    'bg-yellow-100'
                  }`}>
                    <activity.icon size={16} className={
                      activity.color === 'green' ? 'text-green-600' :
                      activity.color === 'blue' ? 'text-blue-600' :
                      'text-yellow-600'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Center Info */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Your Learning Center</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                🏫
              </div>
              <div>
                <p className="font-medium text-gray-900">Aqoonyahan School</p>
                <p className="text-sm text-gray-500">Hargeisa, Somalia</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Contact:</span> +252 63 123 4567
              </p>
            </div>
          </div>

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
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
