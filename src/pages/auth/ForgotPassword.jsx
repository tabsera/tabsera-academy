/**
 * Forgot Password Page
 * Request password reset email
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, AlertCircle, Loader2, ArrowRight, ArrowLeft, CheckCircle
} from 'lucide-react';

function ForgotPassword() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (formError) setFormError('');
    if (error) clearError();
  };

  // Validate form
  const validateForm = () => {
    if (!email) {
      setFormError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await forgotPassword(email);
    if (result.success) {
      setSuccess(true);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-500 mt-2">
            We've sent password reset instructions to
          </p>
          <p className="font-medium text-gray-900 mt-1">{email}</p>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
          <p className="text-sm text-blue-800 font-medium mb-2">What to do next:</p>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              Check your email inbox (and spam folder)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              Click the password reset link in the email
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              Create a new password for your account
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Didn't receive the email?</p>
          <button
            onClick={() => { setSuccess(false); }}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Try a different email address
          </button>
        </div>

        <Link 
          to="/login"
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        to="/login" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>

      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="text-gray-500 mt-1">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Forgot Password Form */}
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
              value={email}
              onChange={handleChange}
              placeholder="Enter your registered email"
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                formError ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {formError && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {formError}
            </p>
          )}
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
              Sending...
            </>
          ) : (
            <>
              Send Reset Link
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>

      {/* Help Box */}
      <div className="p-4 bg-gray-100 rounded-xl">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Need help?</span>{' '}
          If you're having trouble accessing your account, contact our support team at{' '}
          <a href="mailto:support@tabsera.com" className="text-blue-600 hover:underline">
            support@tabsera.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
