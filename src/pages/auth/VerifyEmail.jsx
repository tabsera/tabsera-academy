/**
 * Email Verification Page
 * Handles email verification via token from email link
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, CheckCircle, XCircle, Loader2, ArrowRight,
  RefreshCw, AlertCircle
} from 'lucide-react';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, isLoading, isAuthenticated, user } = useAuth();

  const [status, setStatus] = useState('idle'); // idle, verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle, sending, sent, error

  const token = searchParams.get('token');
  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');
  const emailParam = searchParams.get('email');

  // Handle verification on mount
  useEffect(() => {
    // Check if this is a redirect from GET verification endpoint
    if (successParam === 'true') {
      setStatus('success');
      setMessage('Your email has been verified successfully!');
      if (emailParam) setEmail(emailParam);
      return;
    }

    if (errorParam === 'invalid') {
      setStatus('expired');
      setMessage('This verification link is invalid or has expired.');
      return;
    }

    // If token is present, verify via POST
    if (token) {
      handleVerification();
    }
  }, [token, successParam, errorParam]);

  const handleVerification = async () => {
    setStatus('verifying');

    const result = await verifyEmail(token);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Your email has been verified successfully!');

      // If user is now logged in, redirect to dashboard after delay
      if (result.user) {
        setTimeout(() => {
          const role = result.user.role;
          const redirectPath = role === 'student' ? '/student/dashboard' :
                              role === 'center_admin' ? '/center/dashboard' :
                              role === 'tabsera_admin' ? '/admin/dashboard' : '/';
          navigate(redirectPath);
        }, 2000);
      }
    } else {
      if (result.expired) {
        setStatus('expired');
        setMessage(result.error || 'This verification link has expired. Please request a new one.');
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to verify email. Please try again.');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setResendStatus('sending');

    const result = await resendVerification(email);

    if (result.success) {
      setResendStatus('sent');
    } else if (result.alreadyVerified) {
      setResendStatus('error');
      setMessage('This email is already verified. You can log in.');
    } else {
      setResendStatus('error');
      setMessage(result.error || 'Failed to send verification email.');
    }
  };

  // If already authenticated, show redirect message
  if (isAuthenticated && user) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">You're already logged in!</h2>
          <p className="text-gray-500 mt-2">
            Welcome back, {user.firstName || user.first_name}!
          </p>
        </div>
        <Link
          to={user.role === 'student' ? '/student/dashboard' :
              user.role === 'center_admin' ? '/center/dashboard' : '/admin/dashboard'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
        >
          Go to Dashboard
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
          <p className="text-gray-500 mt-2">Please wait while we confirm your email address.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
          <p className="text-gray-500 mt-2">{message}</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <p>Your account is now active. You can log in and start learning!</p>
        </div>
        <Link
          to="/login"
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          Continue to Login
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // Expired/Error state with resend option
  if (status === 'expired' || status === 'error') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
          </h2>
          <p className="text-gray-500 mt-2">{message}</p>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800 mb-4">
            Enter your email to receive a new verification link:
          </p>
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleResendVerification}
              disabled={isLoading || resendStatus === 'sending'}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resendStatus === 'sending' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>
        </div>

        {resendStatus === 'sent' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-medium">Email Sent!</p>
              <p className="text-green-600 text-sm">Check your inbox for the new verification link.</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Idle state - no token, show instructions
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={40} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-500 mt-2">
          We've sent a verification link to your email address. Click the link to activate your account.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Didn't receive the email?</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>The link expires in 24 hours</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          Need a new verification link? Enter your email below:
        </p>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail size={18} className="text-gray-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleResendVerification}
          disabled={isLoading || resendStatus === 'sending'}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {resendStatus === 'sending' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Resend Verification Email
            </>
          )}
        </button>
      </div>

      {resendStatus === 'sent' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-green-800 font-medium">Email Sent!</p>
            <p className="text-green-600 text-sm">Check your inbox for the verification link.</p>
          </div>
        </div>
      )}

      <p className="text-center text-gray-600">
        Already verified?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default VerifyEmail;
