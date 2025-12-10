/**
 * Learning Center Detail Page
 * Shows detailed information about a specific learning center
 */

import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import {
  Building2, MapPin, Users, Star, Mail, Phone, Calendar,
  BookOpen, Award, Clock, ChevronRight, ArrowLeft, Globe,
  CheckCircle, ExternalLink
} from 'lucide-react';
import { learningCenters, tracks } from '../../utils/mockData';

function LearningCenterDetail() {
  const { id } = useParams();

  // Find the center by ID
  const center = learningCenters.find(c => c.id === id);

  // If center not found, redirect to centers list
  if (!center) {
    return <Navigate to="/centers" replace />;
  }

  // Mock programs offered (based on available tracks)
  const programsOffered = tracks.slice(0, 4).map(track => ({
    ...track,
    studentsEnrolled: Math.floor(Math.random() * 30) + 10
  }));

  // Mock testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Fatima Hassan',
      role: 'IGCSE Student',
      content: 'The teachers at this center are exceptional. I improved my grades significantly after joining.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      name: 'Ahmed Mohamed',
      role: 'Parent',
      content: 'Great learning environment for my children. The Islamic Studies program is excellent.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  ];

  // Mock facilities
  const facilities = [
    'Air-conditioned classrooms',
    'Computer lab with internet',
    'Library with study materials',
    'Prayer room',
    'Cafeteria',
    'Sports facilities'
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image */}
        <div className="h-64 md:h-80 bg-gray-300 overflow-hidden">
          <img
            src={center.image}
            alt={center.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        </div>

        {/* Center Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link
              to="/centers"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft size={16} />
              Back to Learning Centers
            </Link>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{center.flag}</span>
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    Active Partner
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{center.name}</h1>
                <p className="text-white/80 flex items-center gap-2">
                  <MapPin size={18} />
                  {center.location}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-white">{center.rating}</span>
                <span className="text-white/80">rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users size={24} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{center.students}</p>
              <p className="text-sm text-gray-500">Students Enrolled</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BookOpen size={24} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{center.courses}</p>
              <p className="text-sm text-gray-500">Courses Offered</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar size={24} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{new Date(center.joinedDate).getFullYear()}</p>
              <p className="text-sm text-gray-500">Partner Since</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Award size={24} className="text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">50+</p>
              <p className="text-sm text-gray-500">Certificates Issued</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Center</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {center.name} is a TABSERA Academy partner learning center located in {center.location}.
                We provide high-quality education through the Cambridge IGCSE curriculum and comprehensive
                Islamic Studies programs. Our experienced teachers and modern facilities create an ideal
                learning environment for students of all ages.
              </p>
              <p className="text-gray-600 leading-relaxed">
                As a certified TABSERA partner, we follow the same rigorous curriculum and standards
                used across all TABSERA Academy centers, ensuring consistent quality education
                regardless of location.
              </p>
            </div>

            {/* Programs Offered */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Programs Offered</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {programsOffered.map(program => (
                  <div key={program.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-1">{program.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{program.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{program.coursesCount} courses</span>
                      <span className="font-semibold text-blue-600">${program.price}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/courses"
                className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
              >
                View all courses <ChevronRight size={16} />
              </Link>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {facilities.map((facility, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-500" />
                    <span className="text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What Students Say</h2>
              <div className="space-y-4">
                {testimonials.map(testimonial => (
                  <div key={testimonial.id} className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 italic mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{center.contact?.address || center.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{center.contact?.phone || 'Contact for details'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{center.contact?.email || 'info@tabsera.com'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/register"
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Enroll at This Center
                </Link>
                <a
                  href={`mailto:${center.contact?.email || 'info@tabsera.com'}`}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Send Inquiry
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} />
                Operating Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sunday - Thursday</span>
                  <span className="text-gray-900 font-medium">8:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Friday</span>
                  <span className="text-gray-900 font-medium">8:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Saturday</span>
                  <span className="text-gray-900 font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-blue-100 mb-6">
            Join {center.students}+ students already learning at {center.name}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Register Now
            </Link>
            <Link
              to="/courses"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default LearningCenterDetail;
