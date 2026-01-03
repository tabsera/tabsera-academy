/**
 * Tutor Profile Edit
 * Edit tutor bio, headline, tutor type, hourly rate, and manage certifications
 */

import React, { useState, useEffect } from 'react';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Save, Upload, Trash2, FileText,
  CheckCircle, User, BookOpen, Award, Camera, X, Mail, Phone, MapPin,
  Building2, Briefcase, DollarSign
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function TutorProfileEdit() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [pricingSettings, setPricingSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    headline: '',
    timezone: '',
    tutorType: 'FULLTIME',
    hourlyRate: '',
  });

  const [certForm, setCertForm] = useState({ title: '', institution: '', file: null });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, coursesRes, pricingRes] = await Promise.all([
        tutorsApi.getProfile(),
        tutorsApi.getCourses(),
        tutorsApi.getPricingSettings(),
      ]);
      const tutor = profileRes.profile;
      setProfile(tutor);
      setCourses(coursesRes.courses || []);
      setPricingSettings(pricingRes.settings || null);
      setFormData({
        bio: tutor?.bio || '',
        headline: tutor?.headline || '',
        timezone: tutor?.timezone || '',
        tutorType: tutor?.tutorType || 'FULLTIME',
        hourlyRate: tutor?.hourlyRate || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Generate valid hourly rate options (multiples of base hourly rate)
  const getValidRateOptions = () => {
    if (!pricingSettings) return [];
    const { baseHourlyRate, minHourlyRate, maxHourlyRate, commissionPercent } = pricingSettings;
    const options = [];

    for (let factor = 1; factor <= Math.floor(maxHourlyRate / baseHourlyRate); factor++) {
      const rate = factor * baseHourlyRate;
      if (rate >= minHourlyRate && rate <= maxHourlyRate) {
        const netPerHour = rate * (1 - commissionPercent / 100);
        options.push({
          rate,
          creditFactor: factor,
          netPerHour: netPerHour.toFixed(2),
        });
      }
    }
    return options;
  };

  // Calculate earnings preview
  const calculateEarnings = (hourlyRate) => {
    if (!pricingSettings || !hourlyRate) return null;
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) return null;
    if (rate % pricingSettings.baseHourlyRate !== 0) return null;

    const creditFactor = rate / pricingSettings.baseHourlyRate;
    const netPerHour = rate * (1 - pricingSettings.commissionPercent / 100);
    const netPerSession = netPerHour / pricingSettings.sessionsPerHour;

    return {
      creditFactor,
      netPerHour: netPerHour.toFixed(2),
      netPerSession: netPerSession.toFixed(2),
    };
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Prepare data - only send hourlyRate if FREELANCE
      const dataToSend = {
        bio: formData.bio,
        headline: formData.headline,
        timezone: formData.timezone,
        tutorType: formData.tutorType,
      };
      if (formData.tutorType === 'FREELANCE' && formData.hourlyRate) {
        dataToSend.hourlyRate = parseFloat(formData.hourlyRate);
      }
      await tutorsApi.updateProfile(dataToSend);
      await fetchData(); // Refresh profile data
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCert = async () => {
    if (!certForm.file || !certForm.title) {
      alert('Please provide a title and file');
      return;
    }
    setUploadingCert(true);
    try {
      await tutorsApi.uploadCertification(certForm.file, {
        title: certForm.title,
        institution: certForm.institution,
      });
      setCertForm({ title: '', institution: '', file: null });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to upload certification');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!confirm('Delete this certification?')) return;
    try {
      await tutorsApi.deleteCertification(certId);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete certification');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      await tutorsApi.uploadAvatar(avatarFile);
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      fetchData();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarUpload = () => {
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  };

  // Get full avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    // If it's a relative path, prepend the API base URL (without /api)
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${avatar}`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm sm:text-base text-gray-500">Update your tutor profile information</p>
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
          <p className="text-green-700">Profile saved successfully!</p>
        </div>
      )}

      {/* Personal Information (Read-only) */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <User size={20} /> Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User size={18} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {profile?.user?.firstName} {profile?.user?.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Mail size={18} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{profile?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Phone size={18} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{profile?.user?.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <MapPin size={18} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Country</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{profile?.user?.country || 'Not provided'}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 sm:mt-4">
          To update your personal information, please contact support.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <User size={20} /> Tutor Profile
        </h2>
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Current/Preview Avatar */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : getAvatarUrl(profile?.user?.avatar) ? (
                    <img
                      src={getAvatarUrl(profile.user.avatar)}
                      alt="Profile photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-gray-400 sm:w-10 sm:h-10" />
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={cancelAvatarUpload}
                    className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 min-w-[28px] min-h-[28px] flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Upload Actions */}
              <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                {avatarFile ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <span className="text-sm text-gray-600 truncate max-w-[200px]">{avatarFile.name}</span>
                    <button
                      onClick={handleUploadAvatar}
                      disabled={uploadingAvatar}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] w-full sm:w-auto text-sm"
                    >
                      {uploadingAvatar ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      Save Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-fit min-h-[44px]">
                      <Camera size={18} className="text-gray-600" />
                      <span className="text-gray-700 font-medium text-sm">
                        {profile?.user?.avatar ? 'Change Photo' : 'Upload Photo'}
                      </span>
                    </div>
                    <input
                      type="file"
                      onChange={handleAvatarChange}
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  JPEG, PNG, GIF, or WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g., Mathematics Expert | 10+ years experience"
              className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell students about yourself, your experience, and teaching style..."
              rows={5}
              className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-base"
            >
              <option value="">Select timezone</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="Africa/Mogadishu">Africa/Mogadishu (EAT)</option>
              <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] w-full sm:w-auto text-sm sm:text-base"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tutor Type & Pricing */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Briefcase size={20} /> Tutor Type & Pricing
        </h2>

        {/* Current Status Badge */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.tutorType === 'FREELANCE'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {profile?.tutorType === 'FREELANCE' ? 'Freelance Tutor' : 'Fulltime Tutor'}
            </div>
            {profile?.tutorType === 'FREELANCE' && profile?.hourlyRate && (
              <span className="text-gray-600">
                ${profile.hourlyRate}/hour • {profile.creditFactor} credit{profile.creditFactor > 1 ? 's' : ''}/session
              </span>
            )}
          </div>
        </div>

        {/* Tutor Type Selection */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Choose how you want to work with TABSERA:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.tutorType === 'FULLTIME'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                checked={formData.tutorType === 'FULLTIME'}
                onChange={() => setFormData({ ...formData, tutorType: 'FULLTIME', hourlyRate: '' })}
                className="w-4 h-4 text-blue-600 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={16} className="text-blue-600" />
                  <p className="font-medium text-gray-900 text-sm">Fulltime</p>
                </div>
                <p className="text-xs text-gray-500">Fixed rate set by TABSERA</p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.tutorType === 'FREELANCE'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                checked={formData.tutorType === 'FREELANCE'}
                onChange={() => setFormData({ ...formData, tutorType: 'FREELANCE' })}
                className="w-4 h-4 text-purple-600 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={16} className="text-purple-600" />
                  <p className="font-medium text-gray-900 text-sm">Freelance</p>
                </div>
                <p className="text-xs text-gray-500">Set your own hourly rate</p>
              </div>
            </label>
          </div>

          {/* Freelance Rate Selection */}
          {formData.tutorType === 'FREELANCE' && pricingSettings && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Hourly Rate (USD)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Rates are multiples of ${pricingSettings.baseHourlyRate}/hour base rate.
                Platform fee: {pricingSettings.commissionPercent}%
              </p>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                <select
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 appearance-none bg-white text-base"
                >
                  <option value="">Select your hourly rate</option>
                  {getValidRateOptions().map(option => (
                    <option key={option.rate} value={option.rate}>
                      ${option.rate}/hour — {option.creditFactor} credit{option.creditFactor > 1 ? 's' : ''}/session — You earn ${option.netPerHour}/hr
                    </option>
                  ))}
                </select>
              </div>

              {/* Earnings Preview */}
              {formData.hourlyRate && calculateEarnings(formData.hourlyRate) && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Earnings</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Credit Factor</p>
                      <p className="text-lg font-bold text-purple-600">
                        {calculateEarnings(formData.hourlyRate).creditFactor}x
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Per Session</p>
                      <p className="text-lg font-bold text-green-600">
                        ${calculateEarnings(formData.hourlyRate).netPerSession}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Per Hour</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${calculateEarnings(formData.hourlyRate).netPerHour}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || (formData.tutorType === 'FREELANCE' && !formData.hourlyRate)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] w-full sm:w-auto text-sm sm:text-base"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Tutor Type
          </button>
        </div>
      </div>

      {/* Courses */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <BookOpen size={20} /> My Courses
        </h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {courses.map(tc => (
              <div key={tc.id || tc.course?.id} className="p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 text-sm sm:text-base">{tc.course?.title || tc.title}</p>
                {(tc.course?.level || tc.level) && (
                  <p className="text-xs sm:text-sm text-gray-500">{tc.course?.level || tc.level}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-500">No courses assigned yet.</p>
        )}
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Award size={20} /> Certifications
        </h2>

        {/* Existing Certifications */}
        {profile?.certifications?.length > 0 && (
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {profile.certifications.map(cert => (
              <div key={cert.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-green-600 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{cert.title}</p>
                  {cert.institution && <p className="text-xs sm:text-sm text-gray-500 truncate">{cert.institution}</p>}
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload New */}
        <div className="border-t pt-4">
          <p className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Add Certification</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={certForm.title}
              onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
              placeholder="Certification title"
              className="px-3 sm:px-4 py-3 border border-gray-200 rounded-xl text-base"
            />
            <input
              type="text"
              value={certForm.institution}
              onChange={(e) => setCertForm({ ...certForm, institution: e.target.value })}
              placeholder="Institution (optional)"
              className="px-3 sm:px-4 py-3 border border-gray-200 rounded-xl text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="file"
              onChange={(e) => setCertForm({ ...certForm, file: e.target.files[0] })}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="flex-1 text-sm py-2"
            />
            <button
              onClick={handleUploadCert}
              disabled={uploadingCert}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
            >
              {uploadingCert ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorProfileEdit;
