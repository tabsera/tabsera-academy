/**
 * Tutor Dashboard
 * Overview of tutor stats and upcoming sessions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Video, Star, Clock, Calendar,
  TrendingUp, Users, DollarSign, ArrowRight, CheckCircle
} from 'lucide-react';

function TutorDashboard() {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, sessionsRes] = await Promise.all([
        tutorsApi.getProfile(),
        tutorsApi.getSessions({ upcoming: true, limit: 5 }),
      ]);
      setProfile(profileRes.profile);
      setSessions(sessionsRes.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Sessions', value: profile?.totalSessions || 0, icon: Video, color: 'bg-blue-500' },
    { label: 'Average Rating', value: profile?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'bg-yellow-500' },
    { label: 'Total Reviews', value: profile?.totalReviews || 0, icon: Users, color: 'bg-green-500' },
    { label: 'This Month', value: sessions.length, icon: Calendar, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {profile?.user?.firstName || 'Tutor'}!</h1>
        <p className="text-sm sm:text-base text-gray-500">Here's an overview of your tutoring activity</p>
      </div>

      {/* Status Banner */}
      {profile?.status === 'PENDING' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center gap-4">
          <Clock size={24} className="text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">Application Pending</p>
            <p className="text-sm text-yellow-700">Your tutor application is being reviewed. You'll be notified once approved.</p>
          </div>
        </div>
      )}

      {profile?.status === 'APPROVED' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4">
          <CheckCircle size={24} className="text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Approved Tutor</p>
            <p className="text-sm text-green-700">Your profile is live and students can book sessions with you.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link to="/tutor/sessions" className="text-sm text-indigo-600 hover:underline flex items-center gap-1 min-h-[44px] items-center">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {sessions.slice(0, 5).map(session => {
                const { date, time } = formatDateTime(session.scheduledAt);
                return (
                  <div key={session.id} className="flex items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                      {session.student?.firstName?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {session.student?.firstName} {session.student?.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{session.course?.title || 'General tutoring'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{time}</p>
                      <p className="text-xs text-gray-500">{date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2 sm:space-y-3">
            <Link
              to="/tutor/availability"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Manage Availability</p>
                <p className="text-xs sm:text-sm text-gray-500">Set your weekly schedule</p>
              </div>
            </Link>
            <Link
              to="/tutor/profile"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Update Profile</p>
                <p className="text-xs sm:text-sm text-gray-500">Edit bio and certifications</p>
              </div>
            </Link>
            <Link
              to="/tutor/sessions"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <Video size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">View Sessions</p>
                <p className="text-xs sm:text-sm text-gray-500">Manage your sessions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;
