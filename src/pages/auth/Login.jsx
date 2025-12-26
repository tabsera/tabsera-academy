/**
 * Login Page
 * User authentication for students, center admins, and TABSERA admins
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  ArrowRight, CheckCircle, RefreshCw
} from 'lucide-react';

function Login() {
  const { login, googleLogin, resendVerification, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle, sending, sent

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

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setVerificationRequired(false);
    const result = await login(formData.email, formData.password, formData.rememberMe);

    if (result.requiresVerification) {
      setVerificationRequired(true);
      setVerificationEmail(result.email || formData.email);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    setResendStatus('sending');
    const result = await resendVerification(verificationEmail);
    if (result.success) {
      setResendStatus('sent');
    } else {
      setResendStatus('idle');
    }
  };

  // Handle go to verify email page
  const handleGoToVerify = () => {
    navigate('/verify-email');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-500 mt-1">Sign in to continue your learning journey</p>
      </div>

      {/* Verification Required Alert */}
      {verificationRequired && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Mail className="text-yellow-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Email Verification Required</p>
              <p className="text-yellow-700 text-sm mt-1">
                Please verify your email address before logging in. Check your inbox for the verification link.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading || resendStatus === 'sending'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {resendStatus === 'sending' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : resendStatus === 'sent' ? (
                    <>
                      <CheckCircle size={14} />
                      Email Sent!
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      Resend Email
                    </>
                  )}
                </button>
                <button
                  onClick={handleGoToVerify}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-yellow-600 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-100"
                >
                  Enter Code Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && !verificationRequired && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Login Failed</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Enter your email"
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              disabled={isLoading}
            />
          </div>
          {formErrors.email && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {formErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
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
              placeholder="Enter your password"
              className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              disabled={isLoading}
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
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {formErrors.password}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link 
            to="/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-gray-500">or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      {googleLoading ? (
        <div className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl text-gray-700 font-medium bg-gray-50">
          <Loader2 size={20} className="animate-spin" />
          Signing in with Google...
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
                console.error('Google login error:', err);
              } finally {
                setGoogleLoading(false);
              }
            }}
            onError={() => {
              console.error('Google login failed');
              setGoogleLoading(false);
            }}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
          />
        </div>
      )}

      {/* Sign Up Link */}
      <p className="text-center text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign up for free
        </Link>
      </p>

      {/* Demo Accounts Info (Remove in production) */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm font-medium text-blue-800 mb-2">Demo Accounts:</p>
        <div className="space-y-1 text-xs text-blue-700">
          <p><span className="font-medium">Student:</span> student@demo.com / demo123</p>
          <p><span className="font-medium">Center Admin:</span> center@tabsera.com / demo123</p>
          <p><span className="font-medium">TABSERA Admin:</span> admin@tabsera.com / demo123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
