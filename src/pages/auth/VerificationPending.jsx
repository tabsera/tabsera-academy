/**
 * Verification Pending Page
 * Shows when an unverified user logs in
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowLeft, LogOut } from 'lucide-react';

function VerificationPending() {
  const { user, logout, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleResend = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const result = await resendVerification(user.email);
      if (result.success) {
        setResendSuccess(true);
      } else if (result.alreadyVerified) {
        // Email already verified, redirect to dashboard
        navigate('/student/dashboard');
      } else {
        setError(result.error || 'Failed to send verification email');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={40} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification email to:
          </p>
          <p className="font-semibold text-gray-900 mt-1">{user?.email}</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">What to do:</h3>
          <ol className="text-sm text-blue-700 space-y-2">
            <li>1. Check your email inbox (and spam folder)</li>
            <li>2. Click the verification link in the email</li>
            <li>3. Return here and refresh the page</li>
          </ol>
        </div>

        {/* Success Message */}
        {resendSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
            <CheckCircle size={20} />
            <span>Verification email sent! Please check your inbox.</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={18} className={isResending ? 'animate-spin' : ''} />
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <CheckCircle size={18} />
            I've Verified My Email
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Having trouble?{' '}
          <a href="mailto:support@tabsera.com" className="text-blue-600 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

export default VerificationPending;
