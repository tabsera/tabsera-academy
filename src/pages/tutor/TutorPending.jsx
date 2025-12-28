/**
 * Tutor Pending Approval Page
 * Shown after tutor registration while waiting for admin approval
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Clock, Mail, CheckCircle, Home } from 'lucide-react';

function TutorPending() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-yellow-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Application Submitted!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Thank you for applying to become a tutor on Tabsera Academy.
          Our team will review your application and get back to you soon.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Application Review</p>
                <p className="text-sm text-gray-600">
                  Our team will review your profile and certifications within 1-3 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Notification</p>
                <p className="text-sm text-gray-600">
                  You'll receive an email once your application is approved or if we need more information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Start Tutoring</p>
                <p className="text-sm text-gray-600">
                  Once approved, you can set your availability and start accepting tutoring sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            <Home size={18} />
            Go to Homepage
          </Link>
          <a
            href="mailto:support@tabsera.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
          >
            <Mail size={18} />
            Contact Support
          </a>
        </div>
      </div>
    </Layout>
  );
}

export default TutorPending;
