import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { CourseCard } from '../../components/CourseCard';
import { TrackCard } from '../../components/TrackCard';
import { courses, tracks } from '../../utils/mockData';
import { Search, X } from 'lucide-react';

// Map track IDs to their primary category
const trackCategoryMap = {
  '1': 'IGCSE',        // Cambridge IGCSE Full
  '2': 'Islamic Studies', // Islamic Studies
  '3': 'Business',     // Business Track
  '4': 'ESL',          // ESL Intensive
  '5': 'Science',      // Science Track
  '6': 'Languages',    // Arabic Language
};

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTracks, setShowTracks] = useState(true);
  
  // Get track filter from URL
  const trackFilter = searchParams.get('track');
  const selectedTrack = trackFilter ? tracks.find(t => t.id === trackFilter) : null;
  
  // Set active category based on track filter or default to 'All'
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Update category when track filter changes
  useEffect(() => {
    if (trackFilter && trackCategoryMap[trackFilter]) {
      setActiveCategory(trackCategoryMap[trackFilter]);
    } else {
      setActiveCategory('All');
    }
  }, [trackFilter]);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];
  
  // Filter courses based on track, category, and search
  const filteredCourses = courses.filter(course => {
    // Filter by track if trackFilter is present
    const matchesTrack = !trackFilter || course.trackId === trackFilter;
    // Filter by category (only if not filtering by track, or if user manually changed category)
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    // Filter by search query
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesCategory && matchesSearch;
  });

  // Clear track filter
  const clearTrackFilter = () => {
    searchParams.delete('track');
    setSearchParams(searchParams);
    setActiveCategory('All');
  };

  // Handle category change
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    // If user manually selects a category, clear the track filter
    if (trackFilter) {
      searchParams.delete('track');
      setSearchParams(searchParams);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            {selectedTrack ? selectedTrack.title : 'Tracks & Courses'}
          </h1>
          <p className="text-blue-200 max-w-2xl">
            {selectedTrack 
              ? `Explore all courses in the ${selectedTrack.title} program`
              : 'Discover complete learning tracks or explore individual courses. Upgrade your skills with our expert-led curriculum.'
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Active Track Filter Banner */}
        {selectedTrack && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedTrack.color}`}>
                <span className="text-lg">📚</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Showing courses in: {selectedTrack.title}</p>
                <p className="text-sm text-gray-600">{selectedTrack.coursesCount} courses • ${selectedTrack.price}/month</p>
              </div>
            </div>
            <button 
              onClick={clearTrackFilter}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              Clear Filter
            </button>
          </div>
        )}

        {/* Learning Tracks - Hide when filtering by track */}
        {!trackFilter && showTracks && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Complete Learning Tracks</h2>
              <button 
                onClick={() => setShowTracks(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide tracks
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {tracks.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        )}

        {!trackFilter && !showTracks && (
          <button 
            onClick={() => setShowTracks(true)}
            className="mb-6 text-blue-600 font-medium hover:text-blue-700"
          >
            Show Learning Tracks
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
          {selectedTrack && <span> in <span className="font-medium text-blue-600">{selectedTrack.title}</span></span>}
          {activeCategory !== 'All' && !selectedTrack && <span> in <span className="font-medium text-blue-600">{activeCategory}</span></span>}
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
              {(trackFilter || activeCategory !== 'All') && (
                <button 
                  onClick={() => { clearTrackFilter(); setActiveCategory('All'); }}
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

        {/* Pagination */}
        {filteredCourses.length > 0 && (
          <div className="mt-16 flex justify-center">
            <nav className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Courses;
