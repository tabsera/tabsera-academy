/**
 * Tutor Registration Page
 * Multi-step form for tutor registration
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { tutorsApi } from '../../api/tutors';
import { adminApi } from '../../api/admin';
import {
  GraduationCap, Upload, BookOpen, Clock, ChevronRight, ChevronLeft,
  Check, X, Loader2, AlertCircle, FileText, Trash2, Plus, Camera, User
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Profile', icon: GraduationCap },
  { id: 2, title: 'Certifications', icon: FileText },
  { id: 3, title: 'Courses', icon: BookOpen },
  { id: 4, title: 'Review', icon: Check },
];

const TIMEZONES = [
  { value: 'Africa/Mogadishu', label: 'East Africa Time (Mogadishu)' },
  { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)' },
  { value: 'Africa/Cairo', label: 'Egypt Time (Cairo)' },
  { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'Asia/Dubai', label: 'Gulf Time (Dubai)' },
  { value: 'Asia/Kolkata', label: 'India Time (Mumbai)' },
  { value: 'UTC', label: 'UTC' },
];

function TutorRegistration() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    selectedCourses: [],
  });

  // Avatar upload state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Certifications
  const [certifications, setCertifications] = useState([]);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', institution: '', file: null });

  // Fetch available courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const result = await adminApi.getCourses({ status: 'active', limit: 100 });
      setCourses(result.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCourse = (courseId) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
      }
      setNewCert(prev => ({ ...prev, file }));
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
      // Validate file size (5MB max for avatars)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setAvatar(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  };

  const addCertification = () => {
    if (!newCert.title || !newCert.institution || !newCert.file) {
      alert('Please fill in all certification fields');
      return;
    }

    setCertifications(prev => [...prev, { ...newCert, id: Date.now() }]);
    setNewCert({ title: '', institution: '', file: null });
  };

  const removeCertification = (id) => {
    setCertifications(prev => prev.filter(c => c.id !== id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.headline.trim() && formData.bio.trim();
      case 2:
        return true; // Certifications are optional initially
      case 3:
        return formData.selectedCourses.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/tutor/register');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload avatar if provided
      if (avatar) {
        try {
          await tutorsApi.uploadAvatar(avatar);
        } catch (avatarErr) {
          console.error('Failed to upload avatar:', avatarErr);
          // Continue with registration even if avatar upload fails
        }
      }

      // Step 2: Register tutor profile
      const result = await tutorsApi.register({
        headline: formData.headline,
        bio: formData.bio,
        timezone: formData.timezone,
        courses: formData.selectedCourses,
      });

      // Step 3: Upload certifications
      for (const cert of certifications) {
        try {
          await tutorsApi.uploadCertification(cert.file, {
            title: cert.title,
            institution: cert.institution,
          });
        } catch (uploadErr) {
          console.error('Failed to upload certification:', uploadErr);
        }
      }

      // Success - redirect to pending page
      navigate('/tutor/pending');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <GraduationCap size={48} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Become a Tutor</h1>
          <p className="text-gray-600 mb-8">
            Please sign in to register as a tutor on Tabsera Academy.
          </p>
          <Link
            to="/login?redirect=/tutor/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Sign In to Continue
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Tutor</h1>
          <p className="text-gray-600">
            Share your knowledge and help students succeed
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={18} />
                ) : (
                  <step.icon size={18} />
                )}
                <span className="font-medium hidden sm:inline">{step.title}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-6">
                  {/* Avatar Preview */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={40} className="text-gray-400" />
                      )}
                    </div>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-fit">
                        <Camera size={18} className="text-gray-600" />
                        <span className="text-gray-700 font-medium">
                          {avatar ? 'Change Photo' : 'Upload Photo'}
                        </span>
                      </div>
                      <input
                        type="file"
                        onChange={handleAvatarChange}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      JPEG, PNG, GIF, or WebP. Max 5MB. This photo will be shown on your tutor profile.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Headline *
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  placeholder="e.g., Mathematics Expert | 10+ Years Teaching Experience"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  A brief headline that describes your expertise
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About You *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell students about your teaching experience, qualifications, and teaching style..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Certifications */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Your Certifications
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your teaching degrees, certifications, and qualifications.
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (max 25MB each)
                </p>

                {/* Existing Certifications */}
                {certifications.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {certifications.map(cert => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{cert.title}</p>
                            <p className="text-sm text-gray-500">{cert.institution}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCertification(cert.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Certification */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Title
                      </label>
                      <input
                        type="text"
                        value={newCert.title}
                        onChange={(e) => setNewCert(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Bachelor of Education"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={newCert.institution}
                        onChange={(e) => setNewCert(prev => ({ ...prev, institution: e.target.value }))}
                        placeholder="e.g., University of Nairobi"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Document
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                          <Upload size={18} />
                          <span>{newCert.file ? newCert.file.name : 'Choose file...'}</span>
                        </div>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={addCertification}
                        disabled={!newCert.title || !newCert.institution || !newCert.file}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  You can add more certifications later from your tutor dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Courses */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Courses You Can Teach
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose the courses you are proficient in. After approval, you'll be
                  enrolled as staff and can help grade assignments.
                </p>

                {loadingCourses ? (
                  <div className="text-center py-8">
                    <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {courses.map(course => (
                      <label
                        key={course.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          formData.selectedCourses.includes(course.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedCourses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{course.title}</p>
                          {course.level && (
                            <p className="text-sm text-gray-500">{course.level}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {formData.selectedCourses.length > 0 && (
                  <p className="text-sm text-blue-600 mt-4">
                    {formData.selectedCourses.length} course(s) selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Your Application
              </h3>

              <div className="space-y-4">
                {/* Avatar Preview */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Profile Photo</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                    </div>
                    <span className="text-gray-700">
                      {avatar ? avatar.name : 'No photo uploaded'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Professional Headline</p>
                  <p className="font-medium text-gray-900">{formData.headline}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">About You</p>
                  <p className="text-gray-900">{formData.bio}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Timezone</p>
                  <p className="font-medium text-gray-900">
                    {TIMEZONES.find(tz => tz.value === formData.timezone)?.label || formData.timezone}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Certifications</p>
                  {certifications.length > 0 ? (
                    <ul className="space-y-1">
                      {certifications.map(cert => (
                        <li key={cert.id} className="font-medium text-gray-900">
                          {cert.title} - {cert.institution}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No certifications added</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Selected Courses ({formData.selectedCourses.length})</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.selectedCourses.map(courseId => {
                      const course = courses.find(c => c.id === courseId);
                      return course ? (
                        <span
                          key={courseId}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {course.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Your application will be reviewed by our team.
                  Once approved, you'll receive an email and can start accepting tutoring sessions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default TutorRegistration;
