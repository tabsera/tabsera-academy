/**
 * Recurring Booking Page
 * Create recurring session contracts with tutors
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, User, BookOpen,
  CreditCard, ArrowLeft, Check, ChevronLeft, ChevronRight,
  CalendarDays, Repeat, Info
} from 'lucide-react';

// Days of week
const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

// Duration options
const DURATION_OPTIONS = [
  { slots: 1, label: '10 min', duration: 10 },
  { slots: 2, label: '20 min', duration: 20 },
  { slots: 4, label: '40 min', duration: 40 },
  { slots: 6, label: '60 min', duration: 60 },
];

function RecurringBooking() {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [slotCount, setSlotCount] = useState(1);
  const [courseId, setCourseId] = useState('');
  const [topic, setTopic] = useState('');

  // Available time slots (based on tutor availability)
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchData();
  }, [tutorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutorRes, creditsRes] = await Promise.all([
        tutorsApi.getTutor(tutorId),
        tutorsApi.getStudentCredits(),
      ]);
      setTutor(tutorRes.tutor);
      setCredits(creditsRes);

      // Extract available time slots from tutor's availability
      if (tutorRes.tutor?.availability) {
        const slots = new Set();
        tutorRes.tutor.availability.forEach(slot => {
          // Parse time range and generate slot times
          const startHour = parseInt(slot.startTime.split(':')[0]);
          const endHour = parseInt(slot.endTime.split(':')[0]);
          for (let h = startHour; h < endHour; h++) {
            slots.add(`${h.toString().padStart(2, '0')}:00`);
            slots.add(`${h.toString().padStart(2, '0')}:20`);
            slots.add(`${h.toString().padStart(2, '0')}:40`);
          }
        });
        setAvailableSlots(Array.from(slots).sort());
      }
    } catch (err) {
      setError(err.message || 'Failed to load tutor');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total sessions in date range
  const calculateSessions = useMemo(() => {
    if (!startDate || !endDate || selectedDays.length === 0) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (selectedDays.includes(d.getDay())) {
        count++;
      }
    }
    return count;
  }, [startDate, endDate, selectedDays]);

  // Credits per session (tutor's creditFactor)
  const creditsPerSession = tutor?.creditFactor || 1;

  // Total credits needed
  const totalCreditsNeeded = calculateSessions * slotCount * creditsPerSession;

  // Check if user has enough credits
  const hasEnoughCredits = (credits?.summary?.totalCreditsAvailable || 0) >= totalCreditsNeeded;

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

    if (!hasEnoughCredits) {
      alert('You do not have enough credits for this contract');
      return;
    }

    setSubmitting(true);
    try {
      await tutorsApi.createContract(tutorId, {
        startDate,
        endDate,
        daysOfWeek: selectedDays,
        timeSlot,
        slotCount,
        courseId: courseId || undefined,
        topic: topic || undefined,
      });

      alert('Contract request sent! The tutor will review and respond to your request.');
      navigate('/student/contracts');
    } catch (err) {
      alert(err.message || 'Failed to create contract');
    } finally {
      setSubmitting(false);
    }
  };

  // Set default dates (start: next Monday, end: 3 months later)
  useEffect(() => {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7);

    const threeMonthsLater = new Date(nextMonday);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    setStartDate(nextMonday.toISOString().split('T')[0]);
    setEndDate(threeMonthsLater.toISOString().split('T')[0]);
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{error || 'Tutor not found'}</p>
          <Link to="/tutors" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl">
            Browse Tutors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to={`/tutors/${tutorId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4">
          <ArrowLeft size={18} />
          Back to Tutor
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Set Up Recurring Sessions</h1>
        <p className="text-gray-500">Create a recurring session schedule with {tutor.name || tutor.user?.firstName}</p>
      </div>

      {/* Tutor Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {(tutor.name || tutor.user?.firstName)?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{tutor.name || `${tutor.user?.firstName} ${tutor.user?.lastName}`}</h2>
            <p className="text-gray-500">{tutor.headline || 'Expert Tutor'}</p>
            {tutor.tutorType === 'FREELANCE' && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                {creditsPerSession} credits/session
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Range */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDays size={20} />
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
          <p className="text-sm text-gray-500 mb-4">Select the days you want to have sessions</p>
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
          {selectedDays.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              Selected: {selectedDays.map(d => DAYS_OF_WEEK[d].name).join(', ')}
            </p>
          )}
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
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))
                ) : (
                  <>
                    <option value="09:00">09:00</option>
                    <option value="09:20">09:20</option>
                    <option value="09:40">09:40</option>
                    <option value="10:00">10:00</option>
                    <option value="10:20">10:20</option>
                    <option value="10:40">10:40</option>
                    <option value="11:00">11:00</option>
                    <option value="11:20">11:20</option>
                    <option value="11:40">11:40</option>
                    <option value="14:00">14:00</option>
                    <option value="14:20">14:20</option>
                    <option value="14:40">14:40</option>
                    <option value="15:00">15:00</option>
                    <option value="15:20">15:20</option>
                    <option value="15:40">15:40</option>
                    <option value="16:00">16:00</option>
                    <option value="16:20">16:20</option>
                    <option value="16:40">16:40</option>
                  </>
                )}
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

        {/* Course & Topic */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            Session Details
          </h3>
          <div className="space-y-4">
            {tutor.courses && tutor.courses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course (optional)</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a course</option>
                  {tutor.courses.map(tc => (
                    <option key={tc.course?.id || tc.courseId} value={tc.course?.id || tc.courseId}>
                      {tc.course?.title || 'Course'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Topic (optional)</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to focus on in these sessions?"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={20} />
            Contract Summary
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{calculateSessions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration per Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {DURATION_OPTIONS.find(o => o.slots === slotCount)?.label || '20 min'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Credits per Session</p>
              <p className="text-2xl font-bold text-gray-900">{slotCount * creditsPerSession}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Credits Needed</p>
              <p className="text-2xl font-bold text-blue-600">{totalCreditsNeeded}</p>
            </div>
          </div>

          {/* Credits Check */}
          <div className={`p-4 rounded-xl ${hasEnoughCredits ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Your Available Credits</p>
                <p className="text-xl font-bold text-gray-900">{credits?.summary?.totalCreditsAvailable || 0}</p>
              </div>
              {hasEnoughCredits ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={20} />
                  <span className="text-sm font-medium">Sufficient</span>
                </div>
              ) : (
                <Link
                  to="/tuition"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
                >
                  <CreditCard size={16} />
                  Buy {totalCreditsNeeded - (credits?.summary?.totalCreditsAvailable || 0)} more
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Credits will only be reserved after the tutor accepts your request.
              You'll be notified when the tutor responds.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            to={`/tutors/${tutorId}`}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !hasEnoughCredits || calculateSessions === 0 || !timeSlot}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            Send Contract Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecurringBooking;
