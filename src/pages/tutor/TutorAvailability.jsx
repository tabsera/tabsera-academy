/**
 * Tutor Availability
 * Manage weekly availability slots and temporary unavailability
 */

import React, { useState, useEffect } from 'react';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Save, Plus, Trash2, Clock, CheckCircle,
  Calendar, X, CalendarOff
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_OPTIONS = [];
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, '0');
    const min = m.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${hour}:${min}`);
  }
}

const PRESETS = [
  { label: 'Rest of Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
];

const REASONS = [
  { label: 'Personal', value: 'personal' },
  { label: 'Sick Leave', value: 'sick' },
  { label: 'Vacation', value: 'vacation' },
  { label: 'Other', value: 'other' },
];

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function TutorAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Unavailability state
  const [currentUnavailability, setCurrentUnavailability] = useState(null);
  const [upcomingUnavailability, setUpcomingUnavailability] = useState([]);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedReason, setSelectedReason] = useState('personal');
  const [affectedSessions, setAffectedSessions] = useState([]);
  const [loadingAffected, setLoadingAffected] = useState(false);
  const [settingUnavailable, setSettingUnavailable] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    fetchAvailability();
    fetchUnavailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await tutorsApi.getAvailability();
      setSlots(res.availability || []);
    } catch (err) {
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnavailability = async () => {
    try {
      const res = await tutorsApi.getUnavailability();
      setCurrentUnavailability(res.current);
      setUpcomingUnavailability(res.upcoming || []);
    } catch (err) {
      console.error('Failed to load unavailability:', err);
    }
  };

  const getPresetDates = (preset) => {
    const now = new Date();
    let start, end;

    switch (preset) {
      case 'today':
        start = now.toISOString().split('T')[0];
        end = start;
        break;
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        start = tomorrow.toISOString().split('T')[0];
        end = start;
        break;
      case 'this_week':
        start = now.toISOString().split('T')[0];
        const saturday = new Date(now);
        saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
        end = saturday.toISOString().split('T')[0];
        break;
      case 'this_month':
        start = now.toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end = lastDay.toISOString().split('T')[0];
        break;
      default:
        return { start: '', end: '' };
    }
    return { start, end };
  };

  const handlePresetClick = async (preset) => {
    setSelectedPreset(preset);
    setShowCustomDates(false);
    const { start, end } = getPresetDates(preset);
    setCustomStartDate(start);
    setCustomEndDate(end);
    setShowUnavailableModal(true);

    // Fetch affected sessions
    setLoadingAffected(true);
    try {
      const res = await tutorsApi.getAffectedSessions(start, end);
      setAffectedSessions(res.sessions || []);
    } catch (err) {
      console.error('Failed to fetch affected sessions:', err);
    } finally {
      setLoadingAffected(false);
    }
  };

  const handleCustomDatesClick = () => {
    setSelectedPreset(null);
    setShowCustomDates(true);
    setCustomStartDate('');
    setCustomEndDate('');
    setAffectedSessions([]);
    setShowUnavailableModal(true);
  };

  const handleCustomDatesChange = async () => {
    if (customStartDate && customEndDate) {
      setLoadingAffected(true);
      try {
        const res = await tutorsApi.getAffectedSessions(customStartDate, customEndDate);
        setAffectedSessions(res.sessions || []);
      } catch (err) {
        console.error('Failed to fetch affected sessions:', err);
      } finally {
        setLoadingAffected(false);
      }
    }
  };

  useEffect(() => {
    if (showCustomDates && customStartDate && customEndDate) {
      handleCustomDatesChange();
    }
  }, [customStartDate, customEndDate]);

  const handleSetUnavailable = async () => {
    setSettingUnavailable(true);
    setError(null);
    try {
      const data = selectedPreset
        ? { preset: selectedPreset, reason: selectedReason }
        : { startDate: customStartDate, endDate: customEndDate, reason: selectedReason };

      await tutorsApi.setUnavailable(data);
      setShowUnavailableModal(false);
      setSelectedPreset(null);
      setAffectedSessions([]);
      fetchUnavailability();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to set unavailability');
    } finally {
      setSettingUnavailable(false);
    }
  };

  const handleResumeAvailability = async (id) => {
    try {
      await tutorsApi.resumeAvailability(id);
      fetchUnavailability();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resume availability');
    }
  };

  const addSlot = (dayOfWeek) => {
    setSlots([...slots, { dayOfWeek, startTime: '09:00', endTime: '17:00', isNew: true }]);
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formattedSlots = slots.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));
      await tutorsApi.setAvailability(formattedSlots);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchAvailability();
    } catch (err) {
      setError(err.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const getSlotsByDay = (dayIndex) => {
    return slots
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.dayOfWeek === dayIndex);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500">Set your weekly schedule for tutoring sessions</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500" />
          <p className="text-green-700">Changes saved successfully!</p>
        </div>
      )}

      {/* Unavailability Panel */}
      {currentUnavailability ? (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-red-800">Bookings Paused</p>
                <p className="text-sm text-red-600">
                  {formatDate(currentUnavailability.startDate)} - {formatDate(currentUnavailability.endDate)}
                  {currentUnavailability.reason && ` • ${currentUnavailability.reason.charAt(0).toUpperCase() + currentUnavailability.reason.slice(1)}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleResumeAvailability(currentUnavailability.id)}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              Resume Bookings
            </button>
          </div>

          {upcomingUnavailability.length > 0 && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-sm font-medium text-red-800 mb-2">Scheduled Time-Off</p>
              <div className="space-y-2">
                {upcomingUnavailability.map((period) => (
                  <div key={period.id} className="flex items-center justify-between bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-red-500" />
                      <span className="text-sm text-red-700">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        {period.reason && ` • ${period.reason.charAt(0).toUpperCase() + period.reason.slice(1)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleResumeAvailability(period.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <p className="font-semibold text-gray-900">Accepting Bookings</p>
          </div>
          <p className="text-gray-600 mb-4">Need to take a break? Block your calendar temporarily:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={handleCustomDatesClick}
              className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 font-medium transition-colors"
            >
              Custom Dates...
            </button>
          </div>

          {upcomingUnavailability.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Scheduled Time-Off</p>
              <div className="space-y-2">
                {upcomingUnavailability.map((period) => (
                  <div key={period.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        {period.reason && ` • ${period.reason.charAt(0).toUpperCase() + period.reason.slice(1)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleResumeAvailability(period.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Set Unavailable Modal */}
      {showUnavailableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Set Unavailable</h3>
              <button
                onClick={() => setShowUnavailableModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {showCustomDates ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Period:</p>
                  <p className="font-medium text-gray-900">
                    {customStartDate && customEndDate && (
                      customStartDate === customEndDate
                        ? formatDate(customStartDate)
                        : `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`
                    )}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                  ))}
                </select>
              </div>

              {loadingAffected ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={24} className="animate-spin text-indigo-600" />
                </div>
              ) : affectedSessions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-800 mb-2">
                    {affectedSessions.length} session{affectedSessions.length !== 1 ? 's' : ''} will be auto-cancelled:
                  </p>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    {affectedSessions.slice(0, 5).map((session) => (
                      <li key={session.id}>
                        • {session.studentName} - {new Date(session.scheduledAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                        {session.creditsConsumed > 0 && ` (${session.creditsConsumed} credit${session.creditsConsumed !== 1 ? 's' : ''} refunded)`}
                      </li>
                    ))}
                    {affectedSessions.length > 5 && (
                      <li className="text-yellow-600">...and {affectedSessions.length - 5} more</li>
                    )}
                  </ul>
                  <p className="text-xs text-yellow-600 mt-2">Students will be notified by email.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowUnavailableModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSetUnavailable}
                disabled={settingUnavailable || (showCustomDates && (!customStartDate || !customEndDate))}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {settingUnavailable ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CalendarOff size={18} />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Availability Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {DAYS.map((day, dayIndex) => {
          const daySlots = getSlotsByDay(dayIndex);
          return (
            <div key={day} className="border-b last:border-b-0">
              <div className="flex items-start gap-4 p-4">
                <div className="w-28 flex-shrink-0">
                  <p className="font-medium text-gray-900">{day}</p>
                  <p className="text-sm text-gray-500">{daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1">
                  {daySlots.length > 0 ? (
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <div key={slot.originalIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Clock size={18} className="text-gray-400" />
                          <select
                            value={slot.startTime}
                            onChange={(e) => updateSlot(slot.originalIndex, 'startTime', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-gray-500">to</span>
                          <select
                            value={slot.endTime}
                            onChange={(e) => updateSlot(slot.originalIndex, 'endTime', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeSlot(slot.originalIndex)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 py-2">No availability set</p>
                  )}
                  <button
                    onClick={() => addSlot(dayIndex)}
                    className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus size={16} /> Add time slot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
        <p className="text-sm text-indigo-700">
          <strong>Note:</strong> Times are in your local timezone. Students will see these times converted to their timezone when booking.
        </p>
      </div>
    </div>
  );
}

export default TutorAvailability;
