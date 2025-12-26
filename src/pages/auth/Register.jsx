/**
 * Registration Page
 * Student self-registration with optional learning center selection
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  ArrowRight, User, Phone, MapPin, Building2, CheckCircle
} from 'lucide-react';

// Countries list for East Africa region
const COUNTRIES = [
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'OTHER', name: 'Other', flag: '🌍' },
];

// Mock learning centers (replace with API call)
const LEARNING_CENTERS = [
  { id: 'none', name: 'I want to learn online (no center)' },
  { id: 'aqoonyahan', name: 'Aqoonyahan School - Hargeisa, Somalia' },
  { id: 'sunrise', name: 'Sunrise International - Nairobi, Kenya' },
  { id: 'alnoor', name: 'Al-Noor Academy - Mogadishu, Somalia' },
  { id: 'excel', name: 'Excel Learning Center - Addis Ababa, Ethiopia' },
];

function Register() {
  const { register, googleLogin, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    centerId: 'none',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear field error on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) {
      clearError();
    }
  };

  // Validate step 1
  const validateStep1 = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.country) {
      errors.country = 'Please select your country';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate step 2
  const validateStep2 = () => {
    const errors = {};

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        centerId: formData.centerId === 'none' ? null : formData.centerId,
        password: formData.password,
      });

      if (result.success) {
        setSuccess(true);
      } else if (result.errors) {
        setFormErrors(result.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
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
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
          <p className="text-gray-500 mt-2">
            We've sent a verification email to <span className="font-medium text-gray-700">{formData.email}</span>
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <p>Please check your inbox and click the verification link to activate your account.</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Continue to Login
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-gray-500 mt-1">Start your learning journey today</p>
      </div>

      {/* Quick Sign Up with Google */}
      <div className="space-y-4">
        {googleLoading ? (
          <div className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl text-gray-700 font-medium bg-gray-50">
            <Loader2 size={20} className="animate-spin" />
            Creating account with Google...
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setGoogleLoading(true);
                clearError();
                try {
                  await googleLogin(credentialResponse.credential);
                } catch (err) {
                  console.error('Google signup error:', err);
                } finally {
                  setGoogleLoading(false);
                }
              }}
              onError={() => {
                console.error('Google signup failed');
                setGoogleLoading(false);
              }}
              theme="outline"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">or register with email</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>1</div>
          <span className="text-sm font-medium hidden sm:inline">Personal Info</span>
        </div>
        <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>2</div>
          <span className="text-sm font-medium hidden sm:inline">Security</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Registration Failed</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ahmed"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              {formErrors.firstName && (
                <p className="mt-1.5 text-sm text-red-600">{formErrors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Hassan"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {formErrors.lastName && (
                <p className="mt-1.5 text-sm text-red-600">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ahmed@example.com"
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {formErrors.email && (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+252 61 234 5678"
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {formErrors.phone && (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.phone}</p>
            )}
          </div>

          {/* Country Field */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin size={18} className="text-gray-400" />
              </div>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                  formErrors.country ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <option value="">Select your country</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>
            {formErrors.country && (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.country}</p>
            )}
          </div>

          {/* Learning Center Field */}
          <div>
            <label htmlFor="centerId" className="block text-sm font-medium text-gray-700 mb-2">
              Learning Center (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 size={18} className="text-gray-400" />
              </div>
              <select
                id="centerId"
                name="centerId"
                value={formData.centerId}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {LEARNING_CENTERS.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Select a center if you want to attend classes in person
            </p>
          </div>

          {/* Next Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </form>
      )}

      {/* Step 2: Password & Terms */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Create Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.password}</p>
            )}
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div 
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Strength: <span className="font-medium">{strengthLabels[passwordStrength - 1] || 'Very Weak'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.confirmPassword}</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle size={14} />
                Passwords match
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className={`w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 ${
                  formErrors.agreeTerms ? 'border-red-300' : ''
                }`}
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {formErrors.agreeTerms && (
              <p className="mt-1.5 text-sm text-red-600 ml-8">{formErrors.agreeTerms}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Sign In Link */}
      <p className="text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;
