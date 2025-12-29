/**
 * Tutor Sessions
 * View and manage tutoring sessions
 */

import React, { useState, useEffect } from 'react';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, Video, Star, User,
  CheckCircle, XCircle, BookOpen, MessageSquare, Save, X
} from 'lucide-react';

function TutorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

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
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-500">Manage your tutoring sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
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
            className={`px-4 py-3 font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {session.student?.firstName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {session.student?.firstName} {session.student?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{session.student?.email}</p>
                      {session.course && (
                        <p className="text-sm text-indigo-600 flex items-center gap-1 mt-1">
                          <BookOpen size={14} />
                          {session.course.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date/Time & Status */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">{date}</p>
                      <p className="text-lg font-semibold text-gray-900">{time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(session.status)}`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {session.meetingUrl && isUpcoming && (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                      >
                        <Video size={18} />
                        Join
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setNotes(session.tutorNotes || '');
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
                    >
                      <MessageSquare size={18} />
                      Notes
                    </button>
                    {session.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleComplete(session.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                      >
                        <CheckCircle size={18} />
                        Complete
                      </button>
                    )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Session Notes</h3>
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-medium">{selectedSession.student?.firstName} {selectedSession.student?.lastName}</p>
                <p className="text-sm text-gray-500 mt-2">Scheduled</p>
                <p className="font-medium">{formatDateTime(selectedSession.scheduledAt).full}</p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this session..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateSession(selectedSession.id, { tutorNotes: notes })}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
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
