/**
 * Tutor Sessions
 * View and manage tutoring sessions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, Video, Star, User,
  CheckCircle, XCircle, BookOpen, MessageSquare, Save, X, Play
} from 'lucide-react';

function TutorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkingRecordings, setCheckingRecordings] = useState(new Set());

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

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

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'upcoming') params.upcoming = true;
      if (activeTab !== 'all') params.status = activeTab.toUpperCase();

      const res = await tutorsApi.getSessions(params);
      setSessions(res.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (sessionId, data) => {
    setSaving(true);
    try {
      await tutorsApi.updateSession(sessionId, data);
      fetchSessions();
      setSelectedSession(null);
    } catch (err) {
      alert(err.message || 'Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (sessionId) => {
    if (!confirm('Mark this session as completed?')) return;
    await handleUpdateSession(sessionId, { status: 'COMPLETED' });
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      full: date.toLocaleString(),
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

  if (loading && sessions.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-sm sm:text-base text-gray-500">Manage your tutoring sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b overflow-x-auto pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'SCHEDULED', label: 'Scheduled' },
          { id: 'IN_PROGRESS', label: 'In Progress' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium border-b-2 -mb-px whitespace-nowrap transition-colors min-h-[44px] ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map(session => {
            const { date, time } = formatDateTime(session.scheduledAt);
            const isUpcoming = ['SCHEDULED', 'IN_PROGRESS'].includes(session.status);

            return (
              <div
                key={session.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4">
                  {/* Student Info & Status Row */}
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                        {session.student?.firstName?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {session.student?.firstName} {session.student?.lastName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{session.student?.email}</p>
                        {session.course && (
                          <p className="text-xs sm:text-sm text-indigo-600 flex items-center gap-1 mt-1 truncate">
                            <BookOpen size={14} className="flex-shrink-0" />
                            <span className="truncate">{session.course.title}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusBadge(session.status)}`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Date/Time, Duration & Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">{date}</p>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">{time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Clock size={18} className="text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {isUpcoming ? 'Planned' : 'Duration'}
                          </p>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">
                            {session.status === 'COMPLETED' && session.actualDuration
                              ? `${session.actualDuration} min`
                              : `${session.duration || 20} min`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isUpcoming && (
                        <Link
                          to={`/session/${session.id}`}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 min-h-[44px] min-w-[44px] text-sm sm:text-base"
                        >
                          <Video size={18} />
                          <span className="hidden xs:inline">Join</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setNotes(session.tutorNotes || '');
                        }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 min-h-[44px] min-w-[44px] text-sm sm:text-base"
                      >
                        <MessageSquare size={18} />
                        <span className="hidden xs:inline">Notes</span>
                      </button>
                      {session.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleComplete(session.id)}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 min-h-[44px] min-w-[44px] text-sm sm:text-base"
                        >
                          <CheckCircle size={18} />
                          <span className="hidden xs:inline">Complete</span>
                        </button>
                      )}
                      {session.status === 'COMPLETED' && (
                        session.vimeoVideoUrl ? (
                          <Link
                            to={`/session/${session.id}/recording`}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 min-h-[44px] min-w-[44px] text-sm sm:text-base"
                          >
                            <Play size={18} />
                            <span className="hidden xs:inline">Recording</span>
                          </Link>
                        ) : checkingRecordings.has(session.id) ? (
                          <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-blue-100 text-blue-600 rounded-xl font-medium min-h-[44px] min-w-[44px] text-sm sm:text-base cursor-not-allowed">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="hidden xs:inline">Checking</span>
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
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-yellow-100 text-yellow-700 rounded-xl font-medium hover:bg-yellow-200 min-h-[44px] min-w-[44px] text-sm sm:text-base"
                          >
                            <Loader2 size={18} className="animate-spin" />
                            <span className="hidden xs:inline">Check</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-medium min-h-[44px] min-w-[44px] text-sm sm:text-base cursor-not-allowed">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="hidden xs:inline">Processing</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Topic */}
                {session.topic && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Topic:</span> {session.topic}
                    </p>
                  </div>
                )}

                {/* Rating */}
                {session.rating && (
                  <div className="mt-4 pt-4 border-t flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="font-medium">{session.rating}/5</span>
                    {session.feedback && (
                      <span className="text-gray-500">- {session.feedback}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-500">Sessions will appear here once students book with you.</p>
        </div>
      )}

      {/* Notes Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b flex items-center justify-between flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Session Notes</h3>
              <button onClick={() => setSelectedSession(null)} className="p-2.5 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <p className="text-xs sm:text-sm text-gray-500">Student</p>
                <p className="font-medium text-sm sm:text-base">{selectedSession.student?.firstName} {selectedSession.student?.lastName}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Scheduled</p>
                <p className="font-medium text-sm sm:text-base">{formatDateTime(selectedSession.scheduledAt).full}</p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this session..."
                rows={5}
                className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none text-base min-h-[120px]"
              />
            </div>
            <div className="p-4 sm:p-6 border-t bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0 rounded-b-2xl">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-3 sm:py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 min-h-[44px] text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateSession(selectedSession.id, { tutorNotes: notes })}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorSessions;
