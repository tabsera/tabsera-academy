/**
 * Tutor Signup Page
 * Multi-step registration for new tutors with learning center selection
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tutorsApi } from '../../api/tutors';
import apiClient from '../../api/client';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  ArrowRight, ArrowLeft, User, Phone, MapPin, Building2, CheckCircle,
  FileText, Upload, Trash2, Plus, BookOpen, Clock, Check, Camera, X
} from 'lucide-react';

const TIMEZONES = [
  { value: 'Africa/Mogadishu', label: 'East Africa Time (Mogadishu)' },
  { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)' },
  { value: 'Africa/Cairo', label: 'Egypt Time (Cairo)' },
  { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'Asia/Dubai', label: 'Gulf Time (Dubai)' },
  { value: 'UTC', label: 'UTC' },
];

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Learning Center', icon: Building2 },
  { id: 3, title: 'Security', icon: Lock },
  { id: 4, title: 'Profile', icon: GraduationCap },
  { id: 5, title: 'Certifications', icon: FileText },
  { id: 6, title: 'Courses', icon: BookOpen },
  { id: 7, title: 'Review', icon: Check },
];

function TutorSignup() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Data fetching
  const [centers, setCenters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    // Personal info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    // Learning center
    centerId: '',
    workRemotely: true,
    // Security
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    // Tutor profile
    headline: '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    // Courses
    selectedCourses: [],
  });

  // Avatar
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Certifications
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({ title: '', institution: '', file: null });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch centers, courses, and countries on mount
  useEffect(() => {
    fetchCenters();
    fetchCourses();
    fetchCountries();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoadingCenters(true);
      const result = await apiClient.get('/centers');
      setCenters(result.centers || []);
    } catch (err) {
      console.error('Failed to fetch centers:', err);
    } finally {
      setLoadingCenters(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const result = await apiClient.get('/courses', { limit: 100 });
      setCourses(result.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const result = await apiClient.get('/countries');
      setCountries(result.countries || []);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError(null);
  };

  const toggleCourse = (courseId) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId],
    }));
  };

  // Avatar handling
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  };

  // Certification handling
  const handleCertFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
      }
      setNewCert(prev => ({ ...prev, file }));
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

  // Validation
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';
      if (!formData.phone) errors.phone = 'Phone number is required';
      if (!formData.country) errors.country = 'Please select your country';
    }

    if (step === 2) {
      if (!formData.workRemotely && !formData.centerId) {
        errors.centerId = 'Please select a learning center or choose to work remotely';
      }
    }

    if (step === 3) {
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain uppercase, lowercase, and number';
      }
      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to the terms';
    }

    if (step === 4) {
      if (!formData.headline.trim()) errors.headline = 'Professional headline is required';
      if (!formData.bio.trim()) errors.bio = 'Bio is required';
    }

    if (step === 6) {
      if (formData.selectedCourses.length === 0) errors.courses = 'Please select at least one course';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Submit handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Register account
      const registerResult = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        centerId: formData.workRemotely ? null : formData.centerId,
        password: formData.password,
      });

      if (!registerResult.success) {
        throw new Error(registerResult.error || 'Registration failed');
      }

      // Step 2: Login to get token
      const loginResult = await login(formData.email, formData.password);
      if (!loginResult.success) {
        throw new Error('Account created but login failed. Please login manually.');
      }

      // Step 3: Upload avatar if provided
      if (avatar) {
        try {
          await tutorsApi.uploadAvatar(avatar);
        } catch (avatarErr) {
          console.error('Failed to upload avatar:', avatarErr);
        }
      }

      // Step 4: Register tutor profile
      await tutorsApi.register({
        headline: formData.headline,
        bio: formData.bio,
        timezone: formData.timezone,
        courses: formData.selectedCourses,
      });

      // Step 5: Upload certifications
      for (const cert of certifications) {
        try {
          await tutorsApi.uploadCertification(cert.file, {
            title: cert.title,
            institution: cert.institution,
          });
        } catch (certErr) {
          console.error('Failed to upload certification:', certErr);
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your tutor application has been submitted successfully. Our team will review it within 48 hours.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 mb-6">
            We've sent a verification email to <strong>{formData.email}</strong>. Please verify your email to complete your registration.
          </div>
          <button
            onClick={() => navigate('/tutor/pending')}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            View Application Status
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-6">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Become a Tutor</h1>
          <p className="text-green-200">Join TABSERA Academy and share your knowledge</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                  currentStep === step.id
                    ? 'bg-white text-green-800 font-semibold'
                    : currentStep > step.id
                    ? 'bg-green-500/30 text-white'
                    : 'bg-white/10 text-green-300'
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={16} />
                ) : (
                  <step.icon size={16} />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-4 h-0.5 ${currentStep > step.id ? 'bg-green-400' : 'bg-white/20'}`} />
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

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="Ahmed"
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                        formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Hassan"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                      formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="ahmed@example.com"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                      formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+252 61 234 5678"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                      formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  {loadingCountries ? (
                    <div className="flex items-center gap-2 pl-11 py-3 text-gray-500">
                      <Loader2 size={18} className="animate-spin" />
                      Loading countries...
                    </div>
                  ) : (
                    <select
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 appearance-none ${
                        formErrors.country ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select your country</option>
                      {countries.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                {formErrors.country && <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Learning Center */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Learning Center</h2>
              <p className="text-gray-600 mb-6">
                Are you affiliated with a TABSERA learning center, or will you be tutoring remotely?
              </p>

              <div className="space-y-4">
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.workRemotely ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    checked={formData.workRemotely}
                    onChange={() => handleChange('workRemotely', true)}
                    className="w-5 h-5 text-green-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">I will tutor remotely (online only)</p>
                    <p className="text-sm text-gray-500">You'll conduct all sessions online from any location</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    !formData.workRemotely ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    checked={!formData.workRemotely}
                    onChange={() => handleChange('workRemotely', false)}
                    className="w-5 h-5 text-green-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">I'm at a learning center</p>
                    <p className="text-sm text-gray-500">You're physically present at a TABSERA partner center</p>
                  </div>
                </label>
              </div>

              {!formData.workRemotely && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Center *</label>
                  {loadingCenters ? (
                    <div className="flex items-center gap-2 text-gray-500 py-4">
                      <Loader2 size={20} className="animate-spin" />
                      Loading centers...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {centers.map(center => (
                        <label
                          key={center.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.centerId === center.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={formData.centerId === center.id}
                            onChange={() => handleChange('centerId', center.id)}
                            className="w-4 h-4 text-green-600"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{center.name}</p>
                            <p className="text-sm text-gray-500">{center.city}, {center.country}</p>
                          </div>
                        </label>
                      ))}
                      {centers.length === 0 && (
                        <p className="text-gray-500 py-4 text-center">No learning centers available</p>
                      )}
                    </div>
                  )}
                  {formErrors.centerId && <p className="mt-2 text-sm text-red-600">{formErrors.centerId}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Your Password</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                      formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}

                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Strength: <span className="font-medium">{strengthLabels[passwordStrength - 1] || 'Very Weak'}</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                      formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Passwords match
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                    className={`w-5 h-5 text-green-600 rounded mt-0.5 ${formErrors.agreeTerms ? 'border-red-300' : ''}`}
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-green-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {formErrors.agreeTerms && <p className="mt-1 text-sm text-red-600 ml-8">{formErrors.agreeTerms}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Tutor Profile */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Tutor Profile</h2>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
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
                  <div>
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Camera size={18} className="text-gray-600" />
                        <span className="text-gray-700 font-medium">{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                      </div>
                      <input
                        type="file"
                        onChange={handleAvatarChange}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Headline *</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  placeholder="e.g., Mathematics Expert | 10+ Years Teaching Experience"
                  maxLength={100}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                    formErrors.headline ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {formErrors.headline && <p className="mt-1 text-sm text-red-600">{formErrors.headline}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About You *</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell students about your teaching experience, qualifications, and teaching style..."
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                    formErrors.bio ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {formErrors.bio && <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Timezone</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 appearance-none"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Certifications */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Certifications</h2>
              <p className="text-gray-600 mb-6">
                Upload your teaching degrees, certifications, and qualifications. (Optional but recommended)
              </p>

              {certifications.length > 0 && (
                <div className="space-y-3 mb-6">
                  {certifications.map(cert => (
                    <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-green-600" />
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

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Title</label>
                    <input
                      type="text"
                      value={newCert.title}
                      onChange={(e) => setNewCert(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Bachelor of Education"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                    <input
                      type="text"
                      value={newCert.institution}
                      onChange={(e) => setNewCert(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="e.g., University of Nairobi"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                      <Upload size={18} />
                      <span>{newCert.file ? newCert.file.name : 'Choose file...'}</span>
                    </div>
                    <input
                      type="file"
                      onChange={handleCertFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={addCertification}
                    disabled={!newCert.title || !newCert.institution || !newCert.file}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Courses */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Courses You Can Teach</h2>
              <p className="text-gray-600 mb-6">Select the courses you are proficient in and can teach.</p>

              {loadingCourses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-green-600" />
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 max-h-96 overflow-y-auto">
                  {courses.map(course => (
                    <label
                      key={course.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        formData.selectedCourses.includes(course.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedCourses.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        className="w-5 h-5 text-green-600 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        {course.level && <p className="text-sm text-gray-500">{course.level}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {formErrors.courses && <p className="mt-2 text-sm text-red-600">{formErrors.courses}</p>}
              {formData.selectedCourses.length > 0 && (
                <p className="text-sm text-green-600">{formData.selectedCourses.length} course(s) selected</p>
              )}
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Application</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Contact</p>
                  <p className="font-medium text-gray-900">{formData.email}</p>
                  <p className="text-gray-600">{formData.phone}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Learning Center</p>
                  <p className="font-medium text-gray-900">
                    {formData.workRemotely
                      ? 'Remote (Online Only)'
                      : centers.find(c => c.id === formData.centerId)?.name || 'Not selected'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Professional Headline</p>
                  <p className="font-medium text-gray-900">{formData.headline}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">About</p>
                  <p className="text-gray-900">{formData.bio}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Certifications ({certifications.length})</p>
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
                  <p className="text-sm text-gray-500 mb-2">Selected Courses ({formData.selectedCourses.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedCourses.map(courseId => {
                      const course = courses.find(c => c.id === courseId);
                      return course ? (
                        <span key={courseId} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {course.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Your application will be reviewed by our team within 48 hours.
                  Once approved, you'll receive an email notification.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {currentStep < 7 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
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

        {/* Login Link */}
        <p className="text-center text-green-200 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default TutorSignup;
