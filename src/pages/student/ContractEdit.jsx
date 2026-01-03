/**
 * Recurring Session Edit Page
 * Edit a pending recurring session
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, User, BookOpen,
  ArrowLeft, Save, Repeat, Info
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

const DURATION_OPTIONS = [
  { slots: 1, label: '10 min', duration: 10 },
  { slots: 2, label: '20 min', duration: 20 },
  { slots: 4, label: '40 min', duration: 40 },
  { slots: 6, label: '60 min', duration: 60 },
];

// Generate time slots at 20-minute intervals
const TIME_SLOTS = [];
for (let h = 6; h < 22; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:20`);
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:40`);
}

function ContractEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [slotCount, setSlotCount] = useState(1);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await tutorsApi.getContract(id);
      const c = response.contract;

      if (c.status !== 'PENDING') {
        setError('Only pending contracts can be edited');
        return;
      }

      setContract(c);
      setStartDate(c.startDate?.split('T')[0] || '');
      setEndDate(c.endDate?.split('T')[0] || '');
      setSelectedDays(c.daysOfWeek || []);
      setTimeSlot(c.timeSlot || '');
      setSlotCount(c.slotCount || 1);
      setTopic(c.topic || '');
    } catch (err) {
      setError(err.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayId) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate || selectedDays.length === 0 || !timeSlot) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await tutorsApi.updateContract(id, {
        startDate,
        endDate,
        daysOfWeek: selectedDays,
        timeSlot,
        slotCount,
        topic: topic || undefined,
      });

      alert('Recurring session updated successfully!');
      navigate('/student/contracts');
    } catch (err) {
      alert(err.message || 'Failed to update contract');
    } finally {
      setSaving(false);
    }
  };

  // Calculate total sessions
  const calculateSessions = () => {
    if (!startDate || !endDate || selectedDays.length === 0) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (selectedDays.includes(d.getDay())) count++;
    }
    return count;
  };

  const totalSessions = calculateSessions();
  const creditsPerSession = contract?.tutorProfile?.creditFactor || 1;
  const totalCredits = totalSessions * slotCount * creditsPerSession;

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
          <Link to="/student/contracts" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl">
            Back to Recurring Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/student/contracts" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4">
          <ArrowLeft size={18} />
          Back to Recurring Sessions
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Recurring Session</h1>
        <p className="text-gray-500">Modify your recurring session request before the tutor accepts</p>
      </div>

      {/* Tutor Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {contract?.tutorProfile?.user?.firstName?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {contract?.tutorProfile?.user?.firstName} {contract?.tutorProfile?.user?.lastName}
            </h2>
            {contract?.course && (
              <p className="text-gray-500">{contract.course.title}</p>
            )}
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Pending Approval
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Range */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Schedule Period
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Days of Week */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Repeat size={20} />
            Session Days
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.id}
                type="button"
                onClick={() => handleDayToggle(day.id)}
                className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedDays.includes(day.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>

        {/* Time and Duration */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Time & Duration
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Time</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a time</option>
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map(option => (
                  <button
                    key={option.slots}
                    type="button"
                    onClick={() => setSlotCount(option.slots)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      slotCount === option.slots
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Topic */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            Session Topic (Optional)
          </h3>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to focus on?"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={20} />
            Updated Summary
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration per Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {DURATION_OPTIONS.find(o => o.slots === slotCount)?.label || '10 min'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-blue-600">{totalCredits}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            to="/student/contracts"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || totalSessions === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default ContractEdit;
