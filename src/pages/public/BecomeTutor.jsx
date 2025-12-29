/**
 * Become a Tutor Landing Page
 * Explains benefits, process, and earnings for potential tutors
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, CheckCircle, DollarSign, Clock, Video,
  Globe, Calendar, Award, Users, ArrowRight, Star,
  BookOpen, Zap, Shield, TrendingUp
} from 'lucide-react';

function BecomeTutor() {
  const { isAuthenticated, user } = useAuth();
  const isStudent = user?.role?.toLowerCase() === 'student';

  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn on Your Schedule',
      description: 'Set your own hourly rates and earn money teaching subjects you love. Get paid for every session completed.'
    },
    {
      icon: Clock,
      title: 'Flexible Hours',
      description: 'Work when you want. Set your availability and accept sessions that fit your schedule.'
    },
    {
      icon: Globe,
      title: 'Teach Globally',
      description: 'Connect with students from East Africa and beyond. All you need is an internet connection.'
    },
    {
      icon: Video,
      title: 'Built-in Video Platform',
      description: 'No need for external tools. Our integrated video platform includes whiteboard, screen sharing, and recording.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Students pay upfront with tuition credits. You get paid reliably after each session.'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Reputation',
      description: 'Build your profile with ratings and reviews. Top tutors get featured and earn more.'
    },
  ];

  const steps = [
    {
      num: 1,
      title: 'Create Account',
      description: 'Sign up as a student first, then apply to become a tutor'
    },
    {
      num: 2,
      title: 'Submit Application',
      description: 'Tell us about your expertise, upload certifications, and select courses you can teach'
    },
    {
      num: 3,
      title: 'Get Approved',
      description: 'Our team reviews your application within 48 hours'
    },
    {
      num: 4,
      title: 'Set Availability',
      description: 'Configure your weekly schedule and hourly rate'
    },
    {
      num: 5,
      title: 'Start Teaching',
      description: 'Accept bookings and begin 1-on-1 sessions with students'
    },
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English Language', 'Arabic', 'Islamic Studies', 'Quran',
    'Business Studies', 'Economics', 'Computer Science', 'History'
  ];

  const requirements = [
    'Relevant degree or professional experience in your subject area',
    'Strong communication skills in English (Arabic is a plus)',
    'Reliable internet connection and quiet workspace',
    'Webcam and microphone for video sessions',
    'Passion for teaching and helping students succeed'
  ];

  const faqs = [
    {
      q: 'How much can I earn as a tutor?',
      a: 'You set your own hourly rate. Most tutors on our platform charge between $15-50 per hour depending on subject and experience. Top tutors earn $2,000+ monthly.'
    },
    {
      q: 'What subjects can I teach?',
      a: 'We focus on Cambridge IGCSE subjects and Islamic Studies. If you have expertise in any of these areas, you can apply to teach them.'
    },
    {
      q: 'How do I get paid?',
      a: 'Earnings are calculated after each completed session. Payouts are processed weekly via bank transfer or mobile money.'
    },
    {
      q: 'Do I need teaching experience?',
      a: 'While formal teaching experience is preferred, we also accept subject matter experts with strong knowledge and communication skills.'
    },
    {
      q: 'What equipment do I need?',
      a: 'Just a computer with webcam, microphone, and stable internet. Our platform handles video, whiteboard, and screen sharing.'
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-green-200 text-sm font-medium mb-6">
                <GraduationCap size={18} />
                Join Our Tutor Community
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Share Your Knowledge,<br />
                <span className="text-emerald-300">Earn While You Teach</span>
              </h1>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Become a TABSERA tutor and help students across East Africa achieve their academic goals.
                Teach online, set your own schedule, and earn competitive rates.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated && isStudent ? (
                  <Link
                    to="/tutor/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-colors"
                  >
                    Apply Now <ArrowRight size={20} />
                  </Link>
                ) : isAuthenticated ? (
                  <div className="px-8 py-4 bg-white/20 text-white font-medium rounded-xl">
                    You're already registered as a {user?.role?.replace('_', ' ')}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/register"
                      state={{ redirectTo: '/tutor/register' }}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-colors"
                    >
                      Get Started <ArrowRight size={20} />
                    </Link>
                    <Link
                      to="/login"
                      state={{ redirectTo: '/tutor/register' }}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Already have an account? Login
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold">100+</div>
                  <div className="text-green-200 text-sm">Active Tutors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">5,000+</div>
                  <div className="text-green-200 text-sm">Sessions Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.8</div>
                  <div className="text-green-200 text-sm flex items-center gap-1">
                    <Star size={14} className="fill-current" /> Avg Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="aspect-video bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl flex items-center justify-center mb-6">
                  <Video size={64} className="text-white/80" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                      AT
                    </div>
                    <div>
                      <div className="font-semibold">Ahmed T.</div>
                      <div className="text-green-200 text-sm">Mathematics Tutor</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-yellow-300">
                      <Star size={16} className="fill-current" />
                      <span className="font-semibold">4.9</span>
                    </div>
                  </div>
                  <p className="text-green-100 text-sm italic">
                    "Teaching on TABSERA has been amazing. I've helped over 50 students improve their math grades while earning a steady income."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Teach with TABSERA?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join a platform designed to help tutors succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon size={28} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Get Started
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From application to your first session in 5 simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-green-200 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subjects We Cover */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Subjects You Can Teach
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We focus on Cambridge IGCSE curriculum and Islamic Studies.
                If you're an expert in any of these subjects, we want to hear from you.
              </p>
              <div className="flex flex-wrap gap-3">
                {subjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">What We Look For</h3>
              <ul className="space-y-4">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-green-50">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Potential */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Earning Potential
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Set your own rates and earn based on your experience and demand
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10">
              <div className="text-gray-400 font-medium mb-2">Starting Tutor</div>
              <div className="text-4xl font-bold text-green-400 mb-2">$15-25</div>
              <div className="text-gray-400 text-sm mb-4">per hour</div>
              <div className="text-sm text-gray-300">
                5-10 hours/week = <span className="text-white font-semibold">$300-1,000/month</span>
              </div>
            </div>

            <div className="bg-green-600 rounded-2xl p-8 text-center relative transform scale-105 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-green-100 font-medium mb-2">Experienced Tutor</div>
              <div className="text-4xl font-bold text-white mb-2">$25-40</div>
              <div className="text-green-200 text-sm mb-4">per hour</div>
              <div className="text-sm text-green-100">
                10-20 hours/week = <span className="text-white font-semibold">$1,000-3,200/month</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10">
              <div className="text-gray-400 font-medium mb-2">Expert Tutor</div>
              <div className="text-4xl font-bold text-green-400 mb-2">$40-60+</div>
              <div className="text-gray-400 text-sm mb-4">per hour</div>
              <div className="text-sm text-gray-300">
                20+ hours/week = <span className="text-white font-semibold">$3,200-5,000+/month</span>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 mt-8 text-sm">
            * Earnings vary based on subject demand, ratings, and availability
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Teaching?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join our community of tutors and make a difference in students' lives
            while earning on your own terms.
          </p>
          {isAuthenticated && isStudent ? (
            <Link
              to="/tutor/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors text-lg"
            >
              Apply to Become a Tutor <ArrowRight size={24} />
            </Link>
          ) : isAuthenticated ? (
            <div className="px-10 py-5 bg-white/20 text-white font-medium rounded-xl inline-block">
              You're registered as a {user?.role?.replace('_', ' ')}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                state={{ redirectTo: '/tutor/register' }}
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors text-lg"
              >
                Create Account & Apply <ArrowRight size={24} />
              </Link>
              <Link
                to="/login"
                state={{ redirectTo: '/tutor/register' }}
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-lg"
              >
                Login to Apply
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default BecomeTutor;
