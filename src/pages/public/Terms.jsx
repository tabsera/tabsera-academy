import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { FileText, AlertCircle, CreditCard, BookOpen, Users, Scale, Ban, RefreshCw, Calendar } from 'lucide-react';

function Terms() {
  const lastUpdated = 'December 1, 2024';

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-xl text-blue-100">
              Please read these terms carefully before using TABSERA Academy's services.
            </p>
            <div className="flex items-center gap-2 mt-6 text-blue-200">
              <Calendar className="w-5 h-5" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Notice */}
      <section className="py-8 bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Important Notice</p>
              <p className="text-amber-700 text-sm">
                By creating an account or using our services, you agree to be bound by these terms.
                If you do not agree to these terms, please do not use our services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">

            {/* Section 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">1. Acceptance of Terms</h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>
                  Welcome to TABSERA Academy. These Terms of Service ("Terms") govern your access to
                  and use of our website, mobile applications, and educational services (collectively,
                  the "Services").
                </p>
                <p>
                  By accessing or using our Services, you agree to be bound by these Terms and our
                  Privacy Policy. If you are using the Services on behalf of an organization (such
                  as a learning center), you represent that you have the authority to bind that
                  organization to these Terms.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">2. User Accounts</h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900">2.1 Account Creation</h3>
                <p>
                  To access certain features, you must create an account. You agree to provide
                  accurate, current, and complete information during registration and to update
                  such information to keep it accurate, current, and complete.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">2.2 Account Security</h3>
                <p>
                  You are responsible for safeguarding your account credentials and for all
                  activities that occur under your account. You must immediately notify us of
                  any unauthorized use of your account.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">2.3 Account Types</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Student accounts:</strong> For individual learners accessing courses and tracks</li>
                  <li><strong>Learning Center accounts:</strong> For partner institutions managing student enrollments</li>
                  <li><strong>Administrator accounts:</strong> For TABSERA staff managing the platform</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">3. Educational Services</h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900">3.1 Course Content</h3>
                <p>
                  TABSERA Academy provides Islamic educational content including courses, learning
                  tracks, quizzes, and supplementary materials. We reserve the right to modify,
                  update, or discontinue any course content at any time.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">3.2 Certificates</h3>
                <p>
                  Upon successful completion of courses or tracks, you may receive certificates
                  of completion. These certificates represent your achievement within the TABSERA
                  Academy program and are not equivalent to academic degrees or professional
                  certifications.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">3.3 Learning Center Enrollment</h3>
                <p>
                  If you enroll through a learning center, additional terms may apply as specified
                  by your learning center. Your learning center administrator will have access to
                  your progress and performance data.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">4. Payments & Refunds</h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900">4.1 Pricing</h3>
                <p>
                  Course and track prices are displayed on our platform and may vary by region
                  or enrollment method. All prices are in US Dollars unless otherwise specified.
                  We reserve the right to change prices at any time.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">4.2 Payment Methods</h3>
                <p>
                  We accept various payment methods including credit/debit cards, bank transfers,
                  and mobile money services. Payment processing is handled by secure third-party
                  providers.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">4.3 Refund Policy</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="list-disc pl-6 space-y-2 m-0">
                    <li>Full refund within 7 days of enrollment if less than 10% of content accessed</li>
                    <li>Partial refund (50%) within 14 days of enrollment if less than 25% of content accessed</li>
                    <li>No refunds after 14 days or if more than 25% of content has been accessed</li>
                    <li>Learning center refunds are subject to the terms of your learning center agreement</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">5. Prohibited Conduct</h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Share your account credentials or allow others to access your account</li>
                  <li>Copy, distribute, or share course content without authorization</li>
                  <li>Use automated tools to access or download content</li>
                  <li>Attempt to circumvent any security measures or access restrictions</li>
                  <li>Submit false information or impersonate others</li>
                  <li>Use the Services for any unlawful purpose</li>
                  <li>Harass, abuse, or harm other users or staff</li>
                  <li>Upload malicious code or interfere with platform operations</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">6. Intellectual Property</h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>
                  All content on the TABSERA Academy platform, including but not limited to courses,
                  videos, text, graphics, logos, and software, is the property of TABSERA Academy
                  or its licensors and is protected by intellectual property laws.
                </p>
                <p>
                  Your enrollment grants you a limited, non-exclusive, non-transferable license to
                  access and view the content for personal, non-commercial educational purposes only.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">7. Termination</h2>
              </div>
              <div className="pl-13 space-y-4 text-gray-600">
                <p>
                  We may suspend or terminate your account at any time for violation of these Terms
                  or for any other reason at our discretion. You may also delete your account at
                  any time through your account settings.
                </p>
                <p>
                  Upon termination, your right to access the Services will immediately cease.
                  Provisions that by their nature should survive termination will survive,
                  including intellectual property provisions and limitations of liability.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900">8. Disclaimers & Limitations</h2>
              <div className="space-y-4 text-gray-600 mt-4">
                <p>
                  THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM
                  EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
                  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p>
                  IN NO EVENT SHALL TABSERA ACADEMY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICES.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900">9. Changes to Terms</h2>
              <div className="space-y-4 text-gray-600 mt-4">
                <p>
                  We may modify these Terms at any time. We will notify you of significant changes
                  by posting a notice on our platform or sending you an email. Your continued use
                  of the Services after such modifications constitutes your acceptance of the
                  updated Terms.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900">10. Contact Information</h2>
              <div className="space-y-4 text-gray-600 mt-4">
                <p>
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="font-medium text-gray-900 mb-2">TABSERA Academy</p>
                  <p>Email: legal@tabsera.com</p>
                  <p>Address: Hargeisa, Somalia</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-4">
            Have questions about our terms?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </Layout>
  );
}

export default Terms;
