/**
 * Tutor Profile Edit
 * Edit tutor bio, headline, and manage certifications
 */

import React, { useState, useEffect } from 'react';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Save, Upload, Trash2, FileText,
  CheckCircle, User, BookOpen, Award, Camera, X, Mail, Phone, MapPin
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function TutorProfileEdit() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    headline: '',
    timezone: '',
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
      const [profileRes, coursesRes] = await Promise.all([
        tutorsApi.getProfile(),
        tutorsApi.getCourses(),
      ]);
      const tutor = profileRes.profile;
      setProfile(tutor);
      setCourses(coursesRes.courses || []);
      setFormData({
        bio: tutor?.bio || '',
        headline: tutor?.headline || '',
        timezone: tutor?.timezone || '',
        hourlyRate: tutor?.hourlyRate || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await tutorsApi.updateProfile(formData);
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
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Update your tutor profile information</p>
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} /> Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">
                {profile?.user?.firstName} {profile?.user?.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{profile?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Phone size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{profile?.user?.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <MapPin size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Country</p>
              <p className="font-medium text-gray-900">{profile?.user?.country || 'Not provided'}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          To update your personal information, please contact support.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} /> Tutor Profile
        </h2>
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <div className="flex items-center gap-6">
              {/* Current/Preview Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
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
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={cancelAvatarUpload}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Upload Actions */}
              <div className="flex-1">
                {avatarFile ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{avatarFile.name}</span>
                    <button
                      onClick={handleUploadAvatar}
                      disabled={uploadingAvatar}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-fit">
                      <Camera size={18} className="text-gray-600" />
                      <span className="text-gray-700 font-medium">
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
                <p className="text-sm text-gray-500 mt-2">
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
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell students about yourself, your experience, and teaching style..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
      </div>

      {/* Courses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={20} /> My Courses
        </h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {courses.map(course => (
              <div key={course.id} className="p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900">{course.title}</p>
                {course.level && <p className="text-sm text-gray-500">{course.level}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No courses assigned yet.</p>
        )}
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={20} /> Certifications
        </h2>

        {/* Existing Certifications */}
        {profile?.certifications?.length > 0 && (
          <div className="space-y-3 mb-6">
            {profile.certifications.map(cert => (
              <div key={cert.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{cert.title}</p>
                  {cert.institution && <p className="text-sm text-gray-500">{cert.institution}</p>}
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload New */}
        <div className="border-t pt-4">
          <p className="font-medium text-gray-900 mb-3">Add Certification</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={certForm.title}
              onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
              placeholder="Certification title"
              className="px-4 py-2 border border-gray-200 rounded-xl"
            />
            <input
              type="text"
              value={certForm.institution}
              onChange={(e) => setCertForm({ ...certForm, institution: e.target.value })}
              placeholder="Institution (optional)"
              className="px-4 py-2 border border-gray-200 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              onChange={(e) => setCertForm({ ...certForm, file: e.target.files[0] })}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="flex-1"
            />
            <button
              onClick={handleUploadCert}
              disabled={uploadingCert}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
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
