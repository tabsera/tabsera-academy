/**
 * Tutor Detail Page
 * View tutor profile and book sessions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { tutorsApi } from '../../api/tutors';
import { useAuth } from '../../hooks/useAuth';
import {
  Loader2, AlertCircle, Star, Video, Clock, Calendar, MapPin,
  ChevronLeft, ChevronRight, BookOpen, CreditCard, X, CheckCircle,
  User, GraduationCap, FileText, ArrowLeft, DollarSign
} from 'lucide-react';

// Duration options for multi-slot booking
const DURATION_OPTIONS = [
  { slots: 1, label: '20 min', duration: 20 },
  { slots: 2, label: '50 min', duration: 50 },
  { slots: 3, label: '80 min', duration: 80 },
  { slots: 4, label: '110 min', duration: 110 },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get full avatar URL from relative path
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  // If it's a relative path, prepend the API base URL (without /api)
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${avatar}`;
};

function TutorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotCount, setSelectedSlotCount] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [credits, setCredits] = useState(null);
  const [bookingData, setBookingData] = useState({ courseId: '', topic: '' });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Calculate credits needed based on tutor's creditFactor and selected slots
  const creditsPerSession = useMemo(() => {
    return tutor?.creditFactor || 1;
  }, [tutor]);

  const totalCreditsNeeded = useMemo(() => {
    return selectedSlotCount * creditsPerSession;
  }, [selectedSlotCount, creditsPerSession]);

  // Filter slots that have enough consecutive slots available
  const availableSlots = useMemo(() => {
    if (!slots || slots.length === 0) return [];
    if (selectedSlotCount === 1) return slots;

    // For multi-slot booking, filter to show only slots that have enough consecutive slots
    return slots.filter((slot, index) => {
      // Check if we have enough consecutive slots from this position
      for (let i = 1; i < selectedSlotCount; i++) {
        const nextSlot = slots[index + i];
        if (!nextSlot) return false;

        // Check if the next slot is exactly 30 minutes after (slot interval)
        const currentTime = new Date(slot.time).getTime();
        const nextTime = new Date(nextSlot.time).getTime();
        const diff = (nextTime - currentTime) / (1000 * 60);
        if (diff !== 30) return false;
      }
      return true;
    });
  }, [slots, selectedSlotCount]);

  useEffect(() => {
    fetchTutor();
  }, [id]);

  useEffect(() => {
    if (tutor) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, tutor]);

  const fetchTutor = async () => {
    try {
      setLoading(true);
      const res = await tutorsApi.getTutor(id);
      setTutor(res.tutor);
    } catch (err) {
      setError(err.message || 'Failed to load tutor');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    try {
      setLoadingSlots(true);
      const dateStr = date.toISOString().split('T')[0];
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await tutorsApi.getAvailableSlots(id, dateStr, timezone);
      setSlots(res.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await tutorsApi.getStudentCredits();
      setCredits(res);
    } catch (err) {
      console.error('Error fetching credits:', err);
    }
  };

  const handleSlotClick = (slot) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/tutors/${id}` } });
      return;
    }
    setSelectedSlot(slot);
    fetchCredits();
    setShowBookingModal(true);
  };

  const handleBookSession = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      await tutorsApi.bookSession(id, {
        scheduledAt: selectedSlot.time,
        courseId: bookingData.courseId || undefined,
        topic: bookingData.topic || undefined,
        slotCount: selectedSlotCount,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setSelectedSlot(null);
        setSelectedSlotCount(1);
        setBookingData({ courseId: '', topic: '' });
        fetchSlots(selectedDate);
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate >= new Date().setHours(0, 0, 0, 0)) {
      setSelectedDate(newDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={48} className="animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (error || !tutor) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tutor Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'This tutor profile does not exist.'}</p>
            <Link to="/tutors" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
              Browse Tutors
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Back Link */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <Link to="/tutors" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 min-h-[44px]">
            <ArrowLeft size={18} />
            Back to Tutors
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left: Tutor Profile */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0 overflow-hidden">
                  {getAvatarUrl(tutor.user?.avatar || tutor.avatar) ? (
                    <img src={getAvatarUrl(tutor.user?.avatar || tutor.avatar)} alt={tutor.name || `${tutor.user?.firstName} ${tutor.user?.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    (tutor.name || tutor.user?.firstName)?.charAt(0).toUpperCase() || 'T'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{tutor.name || `${tutor.user?.firstName || ''} ${tutor.user?.lastName || ''}`.trim()}</h1>
                    {tutor.tutorType === 'FREELANCE' && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Freelance</span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 mt-1">{tutor.headline || 'Expert Tutor'}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-3">
                    {tutor.avgRating > 0 && (
                      <div className="flex items-center gap-1 text-sm sm:text-base">
                        <Star size={16} className="text-yellow-500 fill-current sm:w-[18px] sm:h-[18px]" />
                        <span className="font-semibold">{tutor.avgRating?.toFixed(1)}</span>
                        <span className="text-gray-400">({tutor.totalReviews || 0})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 text-sm sm:text-base">
                      <Video size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span>{tutor._count?.sessions || tutor.sessionsCompleted || 0} sessions</span>
                    </div>
                    {tutor.timezone && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm sm:text-base">
                        <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{tutor.timezone}</span>
                      </div>
                    )}
                    {(tutor.creditFactor || 1) > 1 && (
                      <div className="flex items-center gap-1 text-purple-600 text-sm sm:text-base">
                        <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>{tutor.creditFactor} credits/session</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {tutor.bio && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">About</h2>
                <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">{tutor.bio}</p>
              </div>
            )}

            {/* Courses */}
            {tutor.courses && tutor.courses.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Courses I Teach</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {tutor.courses.map(tc => (
                    <Link
                      key={tc.course?.id || tc.courseId}
                      to={`/courses/${tc.course?.slug || tc.courseId}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors min-h-[56px]"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={18} className="text-blue-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 hover:text-blue-600 text-sm sm:text-base truncate">{tc.course?.title || 'Course'}</p>
                        {tc.course?.level && <p className="text-xs sm:text-sm text-gray-500">{tc.course.level}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {tutor.certifications && tutor.certifications.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Certifications</h2>
                <div className="space-y-2 sm:space-y-3">
                  {tutor.certifications.map(cert => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-green-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{cert.title}</p>
                        {cert.institution && <p className="text-xs sm:text-sm text-gray-500 truncate">{cert.institution}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Book a Session</h2>
              <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                Times shown in your timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </p>

              {/* Duration Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.slots}
                      onClick={() => setSelectedSlotCount(option.slots)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        selectedSlotCount === option.slots
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                      <span className={`block text-xs ${selectedSlotCount === option.slots ? 'text-blue-200' : 'text-gray-500'}`}>
                        {option.slots * creditsPerSession} {option.slots * creditsPerSession === 1 ? 'credit' : 'credits'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <button
                  onClick={() => changeDate(-1)}
                  disabled={selectedDate <= new Date().setHours(0, 0, 0, 0)}
                  className="p-2.5 hover:bg-gray-100 rounded-lg disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center flex-1 px-2">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(selectedDate)}</p>
                </div>
                <button onClick={() => changeDate(1)} className="p-2.5 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Available Slots */}
              <div className="border-t pt-3 sm:pt-4">
                {loadingSlots ? (
                  <div className="flex justify-center py-6 sm:py-8">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSlotClick(slot)}
                        className="px-2 sm:px-3 py-2.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors min-h-[44px]"
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Calendar size={28} className="mx-auto mb-2 text-gray-300 sm:w-8 sm:h-8" />
                    <p className="text-sm sm:text-base">No available slots on this day</p>
                    <p className="text-xs sm:text-sm mt-1">
                      {selectedSlotCount > 1 ? `Try a shorter duration or another date` : `Try another date`}
                    </p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Tuition Credits Required</span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-600">
                  {creditsPerSession === 1 ? (
                    <>Each 20-minute session uses 1 credit.</>
                  ) : (
                    <>This tutor charges {creditsPerSession} credits per 20-minute session.</>
                  )}
                  {' '}Purchase credits from the Tuition Packs page.
                </p>
                <Link to="/tuition" className="inline-block mt-2 text-xs sm:text-sm font-medium text-indigo-700 hover:underline min-h-[44px] flex items-center">
                  View Tuition Packs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            {bookingSuccess ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={28} className="text-green-600 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Session Booked!</h3>
                <p className="text-sm sm:text-base text-gray-600">Your session has been scheduled successfully.</p>
              </div>
            ) : (
              <>
                <div className="p-4 sm:p-6 border-b flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Confirm Booking</h3>
                    <button onClick={() => setShowBookingModal(false)} className="p-2.5 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                  {/* Session Info */}
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2 sm:mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                        {getAvatarUrl(tutor.user?.avatar || tutor.avatar) ? (
                          <img src={getAvatarUrl(tutor.user?.avatar || tutor.avatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (tutor.name || tutor.user?.firstName)?.charAt(0).toUpperCase() || 'T'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{tutor.name || `${tutor.user?.firstName || ''} ${tutor.user?.lastName || ''}`.trim()}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {DURATION_OPTIONS.find(opt => opt.slots === selectedSlotCount)?.label || '20 min'} session
                        </p>
                      </div>
                    </div>
                    {selectedSlot && (
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span className="truncate">{new Date(selectedSlot.time).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Credits Balance */}
                  {credits && (
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-700 font-medium text-sm sm:text-base">Your Credits</span>
                        <span className="text-xl sm:text-2xl font-bold text-blue-700">{credits.summary?.totalCreditsAvailable || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-600">Credits needed</span>
                        <span className="font-semibold text-blue-700">{totalCreditsNeeded}</span>
                      </div>
                      {(credits.summary?.totalCreditsAvailable || 0) >= totalCreditsNeeded ? (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Sufficient credits
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-red-600 mt-2">
                          You need {totalCreditsNeeded - (credits.summary?.totalCreditsAvailable || 0)} more credits. <Link to="/tuition" className="underline">Purchase credits</Link>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Course Selection */}
                  {tutor.courses && tutor.courses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course (optional)</label>
                      <select
                        value={bookingData.courseId}
                        onChange={(e) => setBookingData({ ...bookingData, courseId: e.target.value })}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-base"
                      >
                        <option value="">Select a course</option>
                        {tutor.courses.map(tc => (
                          <option key={tc.course?.id || tc.courseId} value={tc.course?.id || tc.courseId}>{tc.course?.title || 'Course'}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Topic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What would you like to discuss?</label>
                    <textarea
                      value={bookingData.topic}
                      onChange={(e) => setBookingData({ ...bookingData, topic: e.target.value })}
                      placeholder="Briefly describe what you need help with..."
                      rows={3}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none text-base"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0 rounded-b-2xl">
                  <button
                    onClick={handleBookSession}
                    disabled={isBooking || (credits?.summary?.totalCreditsAvailable || 0) < totalCreditsNeeded}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base"
                  >
                    {isBooking ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Confirm Booking ({totalCreditsNeeded} {totalCreditsNeeded === 1 ? 'Credit' : 'Credits'})
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default TutorDetail;
