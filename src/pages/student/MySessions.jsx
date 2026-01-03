/**
 * My Sessions Page
 * Student's tutoring sessions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, Video, Star, X,
  CheckCircle, XCircle, User, BookOpen, CreditCard, ExternalLink, Play
} from 'lucide-react';

function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [ratingSession, setRatingSession] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [checkingRecordings, setCheckingRecordings] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  // Check recording status for sessions with vimeoVideoId but no vimeoVideoUrl
  useEffect(() => {
    const checkPendingRecordings = async () => {
      const pendingRecordings = sessions.filter(
        s => s.status === 'COMPLETED' && s.vimeoVideoId && !s.vimeoVideoUrl
      );

      if (pendingRecordings.length === 0) return;

      // Mark sessions as being checked
      setCheckingRecordings(new Set(pendingRecordings.map(s => s.id)));

      // Check each one (in parallel)
      const results = await Promise.all(
        pendingRecordings.map(async (session) => {
          try {
            const result = await tutorsApi.checkRecordingStatus(session.id);
            return { sessionId: session.id, ...result };
          } catch (err) {
            console.error(`Failed to check recording for session ${session.id}:`, err);
            return { sessionId: session.id, status: 'error' };
          }
        })
      );

      // Update sessions with new vimeoVideoUrl if available
      setSessions(prev => prev.map(session => {
        const result = results.find(r => r.sessionId === session.id);
        if (result?.vimeoVideoUrl) {
          return { ...session, vimeoVideoUrl: result.vimeoVideoUrl };
        }
        return session;
      }));

      setCheckingRecordings(new Set());
    };

    checkPendingRecordings();
  }, [sessions.length]); // Only run when sessions change

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, creditsRes] = await Promise.all([
        tutorsApi.getStudentSessions(),
        tutorsApi.getStudentCredits(),
      ]);
      setSessions(sessionsRes.sessions || []);
      setCredits(creditsRes);
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (sessionId) => {
    if (!confirm('Are you sure you want to cancel this session? Your credits will be refunded.')) return;

    setCancellingId(sessionId);
    try {
      await tutorsApi.cancelSession(sessionId);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to cancel session');
    } finally {
      setCancellingId(null);
    }
  };

  const openRatingModal = (session) => {
    setRatingSession(session);
    setRatingValue(0);
    setRatingFeedback('');
  };

  const closeRatingModal = () => {
    setRatingSession(null);
    setRatingValue(0);
    setRatingFeedback('');
  };

  const handleSubmitRating = async () => {
    if (ratingValue === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      await tutorsApi.rateSession(ratingSession.id, {
        rating: ratingValue,
        feedback: ratingFeedback || null,
      });
      closeRatingModal();
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  const getStatusBadge = (status) => {
    const styles = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
      NO_SHOW: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'upcoming') {
      return ['SCHEDULED', 'IN_PROGRESS'].includes(session.status);
    } else if (activeTab === 'past') {
      return session.status === 'COMPLETED';
    } else {
      return ['CANCELLED', 'NO_SHOW'].includes(session.status);
    }
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tutoring Sessions</h1>
          <p className="text-gray-500">View and manage your booked sessions</p>
        </div>
        <Link
          to="/tutors"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
        >
          <User size={18} />
          Book a Session
        </Link>
      </div>

      {/* Credits Summary */}
      {credits?.summary && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Available Credits</p>
              <p className="text-4xl font-bold">{credits.summary.totalCreditsAvailable || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-sm">Used Credits</p>
              <p className="text-2xl font-semibold">{credits.summary.totalCreditsUsed || 0}</p>
            </div>
            <Link
              to="/tuition"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <CreditCard size={18} />
              Buy More
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'past', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map(session => {
            const { date, time } = formatDateTime(session.scheduledAt);
            const isUpcoming = ['SCHEDULED', 'IN_PROGRESS'].includes(session.status);

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Tutor Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      {session.tutor?.name?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.tutor?.name || 'Tutor'}</h3>
                      {session.course && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <BookOpen size={14} />
                          {session.course.title}
                        </p>
                      )}
                      {session.topic && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{session.topic}</p>
                      )}
                    </div>
                  </div>

                  {/* Date/Time & Duration */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">{date}</p>
                      <p className="text-lg font-semibold text-gray-900">{time}</p>
                    </div>

                    {/* Duration */}
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        {isUpcoming ? 'Planned' : 'Duration'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                        <Clock size={16} className="text-gray-400" />
                        {session.status === 'COMPLETED' && session.actualDuration
                          ? `${session.actualDuration} min`
                          : `${session.duration || 20} min`}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(session.status)}`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isUpcoming && (
                      <Link
                        to={`/session/${session.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                      >
                        <Video size={18} />
                        Join
                      </Link>
                    )}
                    {isUpcoming && (
                      <button
                        onClick={() => handleCancel(session.id)}
                        disabled={cancellingId === session.id}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                      >
                        {cancellingId === session.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <X size={18} />
                        )}
                        Cancel
                      </button>
                    )}
                    {session.status === 'COMPLETED' && !session.rating && (
                      <button
                        onClick={() => openRatingModal(session)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-medium hover:bg-yellow-200"
                      >
                        <Star size={18} />
                        Rate
                      </button>
                    )}
                    {session.status === 'COMPLETED' && session.rating && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= session.rating ? 'fill-current' : 'opacity-30'}
                          />
                        ))}
                      </div>
                    )}
                    {session.status === 'COMPLETED' && (
                      session.vimeoVideoUrl ? (
                        <Link
                          to={`/session/${session.id}/recording`}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200"
                        >
                          <Play size={18} />
                          Watch Recording
                        </Link>
                      ) : checkingRecordings.has(session.id) ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-medium cursor-not-allowed">
                          <Loader2 size={18} className="animate-spin" />
                          Checking Recording
                        </div>
                      ) : session.vimeoVideoId ? (
                        <button
                          onClick={async () => {
                            setCheckingRecordings(prev => new Set([...prev, session.id]));
                            try {
                              const result = await tutorsApi.checkRecordingStatus(session.id);
                              if (result?.vimeoVideoUrl) {
                                setSessions(prev => prev.map(s =>
                                  s.id === session.id ? { ...s, vimeoVideoUrl: result.vimeoVideoUrl } : s
                                ));
                              }
                            } catch (err) {
                              console.error('Check recording failed:', err);
                            } finally {
                              setCheckingRecordings(prev => {
                                const next = new Set(prev);
                                next.delete(session.id);
                                return next;
                              });
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-medium hover:bg-yellow-200"
                        >
                          <Loader2 size={18} className="animate-spin" />
                          Check Recording
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-not-allowed">
                          <Loader2 size={18} className="animate-spin" />
                          Processing Recording
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming sessions' : activeTab === 'past' ? 'No completed sessions' : 'No cancelled sessions'}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'upcoming' && 'Book a session with a tutor to get started.'}
          </p>
          {activeTab === 'upcoming' && (
            <Link to="/tutors" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
              Find a Tutor
            </Link>
          )}
        </div>
      )}

      {/* Rating Modal */}
      {ratingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Rate Your Session</h3>
              <button onClick={closeRatingModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Tutor Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {ratingSession.tutor?.name?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ratingSession.tutor?.name || 'Tutor'}</p>
                  {ratingSession.course && (
                    <p className="text-sm text-gray-500">{ratingSession.course.title}</p>
                  )}
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  How was your session?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={36}
                        className={`${
                          star <= ratingValue
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {ratingValue > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {ratingValue === 5 && 'Excellent!'}
                    {ratingValue === 4 && 'Very Good'}
                    {ratingValue === 3 && 'Good'}
                    {ratingValue === 2 && 'Fair'}
                    {ratingValue === 1 && 'Poor'}
                  </p>
                )}
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (optional)
                </label>
                <textarea
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Share your experience with this tutor..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeRatingModal}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submittingRating || ratingValue === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingRating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MySessions;
