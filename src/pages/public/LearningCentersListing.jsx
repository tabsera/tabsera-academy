import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Building2, Search, MapPin, Users, Star,
  ArrowLeft, Filter, Globe, ChevronRight, CheckCircle
} from 'lucide-react';

const LearningCentersListing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');

  const centers = [
    { id: 'aqoonyahan', name: 'Aqoonyahan School', location: 'Hargeisa, Somalia', country: 'Somalia', flag: '🇸🇴', students: 60, programs: ['IGCSE Full', 'Islamic Studies'], rating: 4.8, featured: true },
    { id: 'sunrise', name: 'Sunrise International', location: 'Nairobi, Kenya', country: 'Kenya', flag: '🇰🇪', students: 120, programs: ['IGCSE Full', 'Business', 'ESL'], rating: 4.9, featured: true },
    { id: 'alnoor', name: 'Al-Noor Academy', location: 'Mogadishu, Somalia', country: 'Somalia', flag: '🇸🇴', students: 45, programs: ['IGCSE Full', 'Islamic Studies'], rating: 4.6, featured: false },
    { id: 'excel', name: 'Excel Academy', location: 'Addis Ababa, Ethiopia', country: 'Ethiopia', flag: '🇪🇹', students: 85, programs: ['IGCSE Full', 'Science', 'Islamic Studies'], rating: 4.5, featured: false },
    { id: 'kampala', name: 'Kampala IGCSE Center', location: 'Kampala, Uganda', country: 'Uganda', flag: '🇺🇬', students: 70, programs: ['IGCSE Full', 'ESL'], rating: 4.6, featured: false },
    { id: 'hidaya', name: 'Hidaya Learning Center', location: 'Mombasa, Kenya', country: 'Kenya', flag: '🇰🇪', students: 35, programs: ['IGCSE Full', 'Islamic Studies', 'ESL'], rating: 4.7, featured: false },
  ];

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          center.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = filterCountry === 'all' || center.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap size={28} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold block leading-none">TABSERA</span>
                <span className="text-xs text-blue-200">ACADEMY</span>
              </div>
            </Link>
            <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-4">Our Learning Centers</h1>
          <p className="text-blue-100 max-w-2xl">
            Discover TABSERA Academy partner learning centers across East Africa, 
            offering Cambridge IGCSE programs and Islamic Studies curriculum.
          </p>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 -mt-6">
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
            <option value="Somalia">Somalia</option>
            <option value="Kenya">Kenya</option>
            <option value="Ethiopia">Ethiopia</option>
            <option value="Uganda">Uganda</option>
          </select>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
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
                  ⭐ Featured Partner
                </div>
              )}
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

                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{center.students} students enrolled</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {center.programs.map((prog, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                      {prog}
                    </span>
                  ))}
                </div>

                <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
                  Learn More <ChevronRight size={16} />
                </button>
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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Interested in becoming a partner?
          </h2>
          <p className="text-blue-100 mb-6">
            Join our network of learning centers and bring Cambridge IGCSE education to your community.
          </p>
          <Link to="/partner" className="inline-block px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50">
            Apply to Partner
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>© 2026 TABSERA Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LearningCentersListing;
