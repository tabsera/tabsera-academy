import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { BookOpen, Users, Globe, Award, Target, Heart, Lightbulb, ArrowRight } from 'lucide-react';

function About() {
  const team = [
    {
      name: 'Ahmed Hassan',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      bio: 'Former educator with 15+ years experience in Islamic education across East Africa.'
    },
    {
      name: 'Fatima Omar',
      role: 'Head of Curriculum',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
      bio: 'PhD in Islamic Studies, specialized in developing modern Islamic educational content.'
    },
    {
      name: 'Ibrahim Yusuf',
      role: 'Director of Operations',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      bio: 'Expert in educational technology and learning center management.'
    },
    {
      name: 'Amina Abdi',
      role: 'Head of Partnerships',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
      bio: 'Building bridges between TABSERA and learning centers across the globe.'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for the highest standards in Islamic education, combining traditional knowledge with modern pedagogy.'
    },
    {
      icon: Heart,
      title: 'Accessibility',
      description: 'Quality Islamic education should be available to everyone, regardless of location or background.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We build strong communities of learners, educators, and institutions working together.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We embrace technology and modern teaching methods to enhance the learning experience.'
    }
  ];

  const milestones = [
    { year: '2019', event: 'TABSERA Academy founded in Hargeisa, Somalia' },
    { year: '2020', event: 'Launched first online learning platform' },
    { year: '2021', event: 'Expanded to Kenya and Ethiopia' },
    { year: '2022', event: 'Reached 200+ active students' },
    { year: '2023', event: 'Launched Learning Center Partnership Program' },
    { year: '2024', event: '500+ students across 8 learning centers' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Muslim Communities Through Education
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              TABSERA Academy is on a mission to make quality Islamic education accessible
              to learners everywhere through our network of learning centers and online programs.
            </p>
            <div className="flex gap-4">
              <Link
                to="/courses"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
              >
                Explore Courses
              </Link>
              <Link
                to="/partner"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To provide comprehensive, high-quality Islamic education that combines
                traditional knowledge with modern teaching methodologies, making it accessible
                to Muslim communities worldwide through our innovative learning center model.
              </p>
            </div>
            <div className="bg-cyan-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become the leading platform for Islamic education globally, empowering
                a new generation of knowledgeable Muslims who are grounded in their faith
                while being equipped to contribute positively to their communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">510+</p>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">6</p>
              <p className="text-gray-600">Learning Tracks</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">8</p>
              <p className="text-gray-600">Learning Centers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">5</p>
              <p className="text-gray-600">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at TABSERA Academy
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a small initiative to a growing network of learning centers
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {milestone.year.slice(-2)}
                  </div>
                  {idx < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-sm text-blue-600 font-semibold mb-1">{milestone.year}</p>
                  <p className="text-gray-900 font-medium">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals committed to transforming Islamic education
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-blue-100"
                />
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Learning Community
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Whether you're a student looking to learn or an institution wanting to partner,
            we'd love to have you as part of the TABSERA family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start Learning Today
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Contact Us <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default About;
