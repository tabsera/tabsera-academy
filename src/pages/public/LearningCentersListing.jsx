import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import {
  Building2, Search, MapPin, Users, Star,
  Globe, ChevronRight, Mail, Phone, Calendar
} from 'lucide-react';
import { learningCenters } from '../../utils/mockData';

const LearningCentersListing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');

  // Use mock data and enhance it
  const centers = learningCenters.map((center, idx) => ({
    ...center,
    programs: idx % 2 === 0
      ? ['IGCSE Full', 'Islamic Studies']
      : ['IGCSE Full', 'Business', 'ESL'],
    featured: idx < 2
  }));

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          center.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = filterCountry === 'all' || center.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  // Get unique countries for filter
  const countries = [...new Set(learningCenters.map(c => c.country))];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={32} />
            <h1 className="text-3xl md:text-4xl font-bold">Our Learning Centers</h1>
          </div>
          <p className="text-blue-100 max-w-2xl text-lg">
            Discover TABSERA Academy partner learning centers across East Africa,
            offering Cambridge IGCSE programs and Islamic Studies curriculum.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Building2 size={18} />
              <span>{learningCenters.length} Centers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Globe size={18} />
              <span>{countries.length} Countries</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Users size={18} />
              <span>{learningCenters.reduce((sum, c) => sum + c.students, 0)}+ Students</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              className="bg-transparent border-none outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-4 py-2 bg-gray-100 rounded-lg border-none outline-none cursor-pointer"
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-lg ${
                center.featured ? 'border-blue-200' : 'border-gray-100'
              }`}
            >
              {center.featured && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-1 text-xs font-semibold">
                  Featured Partner
                </div>
              )}
              {/* Center Image */}
              <div className="h-40 bg-gray-200 overflow-hidden">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{center.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="text-lg">{center.flag}</span>
                      <MapPin size={14} />
                      {center.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-700">{center.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users size={16} className="text-gray-400" />
                    <span>{center.students} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Since {new Date(center.joinedDate).getFullYear()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {center.programs.map((prog, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                      {prog}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/centers/${center.id}`}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                >
                  Learn More <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <div className="text-center py-12">
            <Globe size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No centers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Interested in becoming a partner?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join our network of learning centers and bring Cambridge IGCSE education to your community.
          </p>
          <Link
            to="/partner"
            className="inline-block px-8 py-4 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-400 transition-colors"
          >
            Apply to Partner
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default LearningCentersListing;
