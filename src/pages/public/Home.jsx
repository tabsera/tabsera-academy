import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Hero } from '../../components/Hero';
import { TrackCard } from '../../components/TrackCard';
import { CourseCard } from '../../components/CourseCard';
import { tracks, courses } from '../../utils/mockData';
import { ArrowRight, Building2, Users, Globe, Award } from 'lucide-react';

function Home() {
  const featuredCourses = courses.slice(0, 3);

  return (
    <Layout>
      <Hero />

      {/* Top Tracks Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Learning Tracks</h2>
              <p className="text-gray-600">Complete programs designed for your success</p>
            </div>
            <Link to="/courses" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {tracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Courses</h2>
              <p className="text-gray-600">Highly rated courses by our students</p>
            </div>
            <Link to="/courses" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Users size={32} />
              </div>
              <p className="text-4xl font-bold mb-2">510+</p>
              <p className="text-blue-100">Active Students</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 size={32} />
              </div>
              <p className="text-4xl font-bold mb-2">8</p>
              <p className="text-blue-100">Learning Centers</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Globe size={32} />
              </div>
              <p className="text-4xl font-bold mb-2">5</p>
              <p className="text-blue-100">Countries</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Award size={32} />
              </div>
              <p className="text-4xl font-bold mb-2">6</p>
              <p className="text-blue-100">Learning Tracks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Centers Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Learning Centers</h2>
              <p className="text-gray-600">Study at a TABSERA center near you</p>
            </div>
            <Link to="/centers" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View All Centers <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Aqoonyahan School', location: 'Hargeisa, Somalia', flag: '🇸🇴', students: 60 },
              { name: 'Sunrise International', location: 'Nairobi, Kenya', flag: '🇰🇪', students: 120 },
              { name: 'Excel Academy', location: 'Addis Ababa, Ethiopia', flag: '🇪🇹', students: 85 },
            ].map((center, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{center.flag}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{center.name}</h3>
                    <p className="text-sm text-gray-500">{center.location}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{center.students} students enrolled</span>
                  <Link to="/centers" className="text-sm text-blue-600 font-medium hover:text-blue-700">
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Become a Partner */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Become a TABSERA Academy Learning Center
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Join our network of educational excellence. Offer complete TABSERA 
            tracks at your center with ready-made courses, resources, and support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/partner" 
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
            >
              Apply to Partner
            </Link>
            <Link 
              to="/centers" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              View Existing Centers <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Home;
