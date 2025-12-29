import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { CourseCard } from '../../components/CourseCard';
import { PackCard } from '../../components/PackCard';
import apiClient from '../../api/client';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPacks, setShowPacks] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Data state
  const [courses, setCourses] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get pack filter from URL
  const packFilter = searchParams.get('pack');
  const selectedPack = packFilter ? packs.find(p => p.id === packFilter || p.slug === packFilter) : null;

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [coursesRes, packsRes] = await Promise.all([
        apiClient.get('/courses', { limit: 100 }),
        apiClient.get('/packs'),
      ]);

      setCourses(coursesRes.courses || []);
      setPacks(packsRes.packs || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from courses
  const categories = ['All', ...Array.from(new Set(courses.map(c => c.level).filter(Boolean)))];

  // Filter courses based on pack, category, and search
  const filteredCourses = courses.filter(course => {
    // Filter by pack if packFilter is present
    const matchesPack = !packFilter || course.learningPackId === packFilter || course.learningPack?.slug === packFilter;
    // Filter by category/level
    const matchesCategory = activeCategory === 'All' || course.level === activeCategory;
    // Filter by search query
    const matchesSearch = !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPack && matchesCategory && matchesSearch;
  });

  // Clear pack filter
  const clearPackFilter = () => {
    searchParams.delete('pack');
    setSearchParams(searchParams);
    setActiveCategory('All');
  };

  // Handle category change
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    // If user manually selects a category, clear the pack filter
    if (packFilter) {
      searchParams.delete('pack');
      setSearchParams(searchParams);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Courses</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            {selectedPack ? selectedPack.title : 'Packs & Courses'}
          </h1>
          <p className="text-blue-200 max-w-2xl">
            {selectedPack
              ? `Explore all courses in the ${selectedPack.title} program`
              : 'Discover complete learning packs or explore individual courses. Upgrade your skills with our expert-led curriculum.'
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Active Pack Filter Banner */}
        {selectedPack && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <span className="text-lg">📚</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Showing courses in: {selectedPack.title}</p>
                <p className="text-sm text-gray-600">{selectedPack.coursesCount || 0} courses • ${parseFloat(selectedPack.price || 0).toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={clearPackFilter}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              Clear Filter
            </button>
          </div>
        )}

        {/* Learning Packs - Hide when filtering by pack */}
        {!packFilter && showPacks && packs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Complete Learning Packs</h2>
              <button
                onClick={() => setShowPacks(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide packs
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {packs.map(pack => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          </div>
        )}

        {!packFilter && !showPacks && packs.length > 0 && (
          <button
            onClick={() => setShowPacks(true)}
            className="mb-6 text-blue-600 font-medium hover:text-blue-700"
          >
            Show Learning Packs
          </button>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 text-gray-500 text-sm">
          Showing <span className="font-bold text-gray-900">{filteredCourses.length}</span> courses
          {selectedPack && <span> in <span className="font-medium text-blue-600">{selectedPack.title}</span></span>}
          {activeCategory !== 'All' && !selectedPack && <span> in <span className="font-medium text-blue-600">{activeCategory}</span></span>}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No courses found matching your criteria.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {(packFilter || activeCategory !== 'All') && (
                <button
                  onClick={() => { clearPackFilter(); setActiveCategory('All'); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View All Courses
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Courses;
