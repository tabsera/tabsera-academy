/**
 * Tutor Detail Page
 * View tutor profile and book sessions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { tutorsApi } from '../../api/tutors';
import { useAuth } from '../../hooks/useAuth';
import {
  Loader2, AlertCircle, Star, Video, Clock, Calendar, MapPin,
  ChevronLeft, ChevronRight, BookOpen, CreditCard, X, CheckCircle,
  User, GraduationCap, FileText, ArrowLeft
} from 'lucide-react';

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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [credits, setCredits] = useState(null);
  const [bookingData, setBookingData] = useState({ courseId: '', topic: '' });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
        scheduledAt: selectedSlot.startTime,
        courseId: bookingData.courseId || undefined,
        topic: bookingData.topic || undefined,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setSelectedSlot(null);
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/tutors" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={18} />
            Back to Tutors
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tutor Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
                  {(tutor.user?.avatar || tutor.avatar) ? (
                    <img src={tutor.user?.avatar || tutor.avatar} alt={tutor.name || `${tutor.user?.firstName} ${tutor.user?.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    (tutor.name || tutor.user?.firstName)?.charAt(0).toUpperCase() || 'T'
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{tutor.name || `${tutor.user?.firstName || ''} ${tutor.user?.lastName || ''}`.trim()}</h1>
                  <p className="text-gray-500 mt-1">{tutor.headline || 'Expert Tutor'}</p>
                  <div className="flex items-center gap-4 mt-3">
                    {tutor.avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={18} className="text-yellow-500 fill-current" />
                        <span className="font-semibold">{tutor.avgRating?.toFixed(1)}</span>
                        <span className="text-gray-400">({tutor.totalReviews || 0} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Video size={18} />
                      <span>{tutor.sessionsCompleted || 0} sessions</span>
                    </div>
                    {tutor.timezone && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={18} />
                        <span>{tutor.timezone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {tutor.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 whitespace-pre-line">{tutor.bio}</p>
              </div>
            )}

            {/* Courses */}
            {tutor.courses && tutor.courses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Courses I Teach</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutor.courses.map(course => (
                    <div key={course.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        {course.level && <p className="text-sm text-gray-500">{course.level}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {tutor.certifications && tutor.certifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
                <div className="space-y-3">
                  {tutor.certifications.map(cert => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <FileText size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cert.title}</p>
                        {cert.institution && <p className="text-sm text-gray-500">{cert.institution}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Book a Session</h2>

              {/* Date Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeDate(-1)}
                  disabled={selectedDate <= new Date().setHours(0, 0, 0, 0)}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{formatDate(selectedDate)}</p>
                </div>
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Available Slots */}
              <div className="border-t pt-4">
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSlotClick(slot)}
                        className="px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No available slots on this day</p>
                    <p className="text-sm mt-1">Try another date</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-700 font-medium mb-2">
                  <CreditCard size={18} />
                  <span>Tuition Credits Required</span>
                </div>
                <p className="text-sm text-indigo-600">
                  Each 10-minute session uses 1 credit. Purchase credits from the Tuition Packs page.
                </p>
                <Link to="/tuition" className="inline-block mt-2 text-sm font-medium text-indigo-700 hover:underline">
                  View Tuition Packs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {bookingSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Session Booked!</h3>
                <p className="text-gray-600">Your session has been scheduled successfully.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Booking</h3>
                    <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Session Info */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
                        {(tutor.user?.avatar || tutor.avatar) ? (
                          <img src={tutor.user?.avatar || tutor.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (tutor.name || tutor.user?.firstName)?.charAt(0).toUpperCase() || 'T'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tutor.name || `${tutor.user?.firstName || ''} ${tutor.user?.lastName || ''}`.trim()}</p>
                        <p className="text-sm text-gray-500">10-minute session</p>
                      </div>
                    </div>
                    {selectedSlot && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} />
                        <span>{new Date(selectedSlot.startTime).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Credits Balance */}
                  {credits && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700 font-medium">Your Credits</span>
                        <span className="text-2xl font-bold text-blue-700">{credits.totalCreditsRemaining || 0}</span>
                      </div>
                      {(credits.totalCreditsRemaining || 0) < 1 && (
                        <p className="text-sm text-red-600 mt-2">
                          You need at least 1 credit to book. <Link to="/tuition" className="underline">Purchase credits</Link>
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
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a course</option>
                        {tutor.courses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50">
                  <button
                    onClick={handleBookSession}
                    disabled={isBooking || (credits?.totalCreditsRemaining || 0) < 1}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isBooking ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Confirm Booking (1 Credit)
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
