import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Hero } from '../../components/Hero';
import { TrackCard } from '../../components/TrackCard';
import { CourseCard } from '../../components/CourseCard';
import apiClient from '../../api/client';
import { tutorsApi } from '../../api/tutors';
import {
  ArrowRight, Building2, Users, Globe, Award, Loader2, BookOpen,
  Video, Clock, CreditCard, Star, CheckCircle, User, GraduationCap
} from 'lucide-react';

function Home() {
  const [tracks, setTracks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [stats, setStats] = useState({
    students: 510,
    centers: 8,
    countries: 5,
    tracks: 0,
    courses: 0,
    tutors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [coursesRes, tracksRes, tutorsRes] = await Promise.all([
        apiClient.get('/courses', { limit: 6 }),
        apiClient.get('/tracks'),
        tutorsApi.listTutors({ limit: 6 }).catch(() => ({ tutors: [] })),
      ]);

      const fetchedTracks = tracksRes.tracks || [];
      const fetchedCourses = coursesRes.courses || [];
      const fetchedTutors = tutorsRes.tutors || [];

      setTracks(fetchedTracks);
      setCourses(fetchedCourses);
      setTutors(fetchedTutors);
      setStats(prev => ({
        ...prev,
        tracks: fetchedTracks.length,
        courses: coursesRes.total || fetchedCourses.length,
        tutors: tutorsRes.pagination?.total || fetchedTutors.length,
      }));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

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

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : tracks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tracks.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No tracks available yet.</p>
            </div>
          )}
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

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No courses available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 1-on-1 Tutoring Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium mb-4">
              Personal Learning Experience
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              1-on-1 Tutoring with Tuition Credits
            </h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Get personalized help from expert tutors. Purchase Tuition Packs with credits
              and book sessions when you need them most.
            </p>
          </div>

          {/* How It Works */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { step: 1, icon: CreditCard, title: 'Buy Credits', desc: 'Purchase a Tuition Pack with credits that fit your budget' },
              { step: 2, icon: User, title: 'Choose a Tutor', desc: 'Browse verified tutors and find your perfect match' },
              { step: 3, icon: Clock, title: 'Book a Session', desc: 'Schedule 10-minute sessions at times that work for you' },
              { step: 4, icon: GraduationCap, title: 'Learn & Grow', desc: 'Get personalized help and master your courses' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/20 rounded-full flex items-center justify-center relative">
                    <item.icon size={28} className="text-cyan-400" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-indigo-200">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Tutors */}
          {tutors.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Meet Our Tutors</h3>
                  <p className="text-indigo-200">Expert educators ready to help you succeed</p>
                </div>
                <Link to="/tutors" className="text-cyan-400 font-semibold hover:text-cyan-300 flex items-center gap-1">
                  View All Tutors <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutors.slice(0, 6).map(tutor => (
                  <div key={tutor.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                        {tutor.avatar ? (
                          <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
                        ) : (
                          tutor.name?.charAt(0).toUpperCase() || 'T'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{tutor.name}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{tutor.headline || 'Expert Tutor'}</p>
                        {tutor.avgRating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-700">{tutor.avgRating?.toFixed(1)}</span>
                            <span className="text-sm text-gray-400">({tutor.totalReviews || 0} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {tutor.courses && tutor.courses.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Teaches</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.courses.slice(0, 3).map(course => (
                            <span key={course.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                              {course.title}
                            </span>
                          ))}
                          {tutor.courses.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                              +{tutor.courses.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Video size={16} />
                        <span>{tutor.sessionsCompleted || 0} sessions</span>
                      </div>
                      <Link
                        to={`/tutors/${tutor.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              to="/tuition"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-900/30"
            >
              Explore Tuition Packs <ArrowRight size={18} />
            </Link>
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
              <p className="text-4xl font-bold mb-2">{stats.students}+</p>
              <p className="text-blue-100">Active Students</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 size={32} />
              </div>
              <p className="text-4xl font-bold mb-2">{stats.centers}</p>
              <p className="text-blue-100">Learning Centers</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen size={32} />
              </div>
              <p className="text-4xl font-bold mb-2">{stats.courses}</p>
              <p className="text-blue-100">Courses</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Award size={32} />
              </div>
              <p className="text-4xl font-bold mb-2">{stats.tracks}</p>
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
