/**
 * Course List Page
 * Manage all courses in the system
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Plus, Filter, MoreVertical, Edit, Trash2,
  Eye, Copy, Archive, ChevronDown, Clock, Users, Star,
  CheckCircle, XCircle, AlertCircle, Play, Pause, Grid, List,
  Download, Upload, GraduationCap
} from 'lucide-react';

// Mock courses data
const mockCourses = [
  {
    id: 'CRS001',
    title: 'IGCSE Mathematics',
    slug: 'igcse-mathematics',
    track: 'Cambridge IGCSE Full Program',
    trackId: 'TRK001',
    category: 'Mathematics',
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    lessons: 45,
    duration: '24h 30m',
    students: 342,
    rating: 4.8,
    reviews: 89,
    price: 15,
    instructor: 'Dr. Ahmed Hassan',
    lastUpdated: '2026-01-05',
    createdAt: '2025-06-15',
    featured: true,
  },
  {
    id: 'CRS002',
    title: 'IGCSE English as a Second Language',
    slug: 'igcse-esl',
    track: 'Cambridge IGCSE Full Program',
    trackId: 'TRK001',
    category: 'Languages',
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    lessons: 52,
    duration: '28h 15m',
    students: 428,
    rating: 4.9,
    reviews: 112,
    price: 15,
    instructor: 'Sarah Williams',
    lastUpdated: '2026-01-08',
    createdAt: '2025-05-20',
    featured: true,
  },
  {
    id: 'CRS003',
    title: 'IGCSE Biology',
    slug: 'igcse-biology',
    track: 'Cambridge IGCSE Full Program',
    trackId: 'TRK001',
    category: 'Sciences',
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    lessons: 38,
    duration: '20h 45m',
    students: 287,
    rating: 4.7,
    reviews: 67,
    price: 15,
    instructor: 'Dr. Fatima Ali',
    lastUpdated: '2025-12-28',
    createdAt: '2025-07-10',
    featured: false,
  },
  {
    id: 'CRS004',
    title: 'Quranic Studies & Tajweed',
    slug: 'quranic-studies-tajweed',
    track: 'Islamic Studies Program',
    trackId: 'TRK002',
    category: 'Islamic Studies',
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    lessons: 30,
    duration: '18h 00m',
    students: 523,
    rating: 4.9,
    reviews: 156,
    price: 10,
    instructor: 'Sheikh Mohamed Nur',
    lastUpdated: '2026-01-02',
    createdAt: '2025-04-01',
    featured: true,
  },
  {
    id: 'CRS005',
    title: 'IGCSE Chemistry',
    slug: 'igcse-chemistry',
    track: 'Cambridge IGCSE Full Program',
    trackId: 'TRK001',
    category: 'Sciences',
    status: 'draft',
    thumbnail: '/api/placeholder/300/200',
    lessons: 25,
    duration: '12h 30m',
    students: 0,
    rating: 0,
    reviews: 0,
    price: 15,
    instructor: 'Dr. James Ochieng',
    lastUpdated: '2026-01-10',
    createdAt: '2025-11-15',
    featured: false,
  },
  {
    id: 'CRS006',
    title: 'Islamic Fiqh Basics',
    slug: 'islamic-fiqh-basics',
    track: 'Islamic Studies Program',
    trackId: 'TRK002',
    category: 'Islamic Studies',
    status: 'archived',
    thumbnail: '/api/placeholder/300/200',
    lessons: 20,
    duration: '10h 00m',
    students: 189,
    rating: 4.5,
    reviews: 42,
    price: 10,
    instructor: 'Sheikh Abdullahi Yusuf',
    lastUpdated: '2025-08-20',
    createdAt: '2025-03-01',
    featured: false,
  },
];

const tracks = [
  { id: 'TRK001', name: 'Cambridge IGCSE Full Program' },
  { id: 'TRK002', name: 'Islamic Studies Program' },
  { id: 'TRK003', name: 'ESL Intensive' },
  { id: 'TRK004', name: 'Business & Entrepreneurship' },
];

const categories = ['All', 'Mathematics', 'Sciences', 'Languages', 'Islamic Studies', 'Business'];

function CourseList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesTrack = trackFilter === 'all' || course.trackId === trackFilter;
    const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesTrack && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={12} />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <AlertCircle size={12} />
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            <Archive size={12} />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCourses(filteredCourses.map(c => c.id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleSelectCourse = (courseId, checked) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    }
  };

  const courseCounts = {
    total: mockCourses.length,
    published: mockCourses.filter(c => c.status === 'published').length,
    draft: mockCourses.filter(c => c.status === 'draft').length,
    archived: mockCourses.filter(c => c.status === 'archived').length,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500">Create, edit, and manage your courses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload size={18} />
            Import
          </button>
          <Link
            to="/admin/courses/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Course
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courseCounts.total}</p>
              <p className="text-sm text-gray-500">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courseCounts.published}</p>
              <p className="text-sm text-gray-500">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courseCounts.draft}</p>
              <p className="text-sm text-gray-500">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Archive size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courseCounts.archived}</p>
              <p className="text-sm text-gray-500">Archived</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Tracks</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>{track.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCourses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
            <span className="text-sm text-gray-600">{selectedCourses.length} selected</span>
            <button className="text-sm text-green-600 font-medium hover:text-green-700">Publish</button>
            <button className="text-sm text-yellow-600 font-medium hover:text-yellow-700">Unpublish</button>
            <button className="text-sm text-gray-600 font-medium hover:text-gray-700">Archive</button>
            <button className="text-sm text-red-600 font-medium hover:text-red-700">Delete</button>
          </div>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-cyan-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={48} className="text-white/50" />
                </div>
                <div className="absolute top-3 left-3">
                  {getStatusBadge(course.status)}
                </div>
                <div className="absolute top-3 right-3">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={(e) => handleSelectCourse(course.id, e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-white/50 rounded focus:ring-blue-500 bg-white/20"
                  />
                </div>
                {course.featured && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs font-bold">
                      ⭐ Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-3">
                  <span className="text-xs font-medium text-blue-600">{course.track}</span>
                  <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">{course.title}</h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {course.lessons} lessons
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{course.students} students</span>
                  </div>
                  {course.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                      <span className="text-xs text-gray-400">({course.reviews})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">${course.price}/mo</span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/courses/${course.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </Link>
                    <Link
                      to={`/admin/courses/${course.id}/curriculum`}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      <BookOpen size={18} />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === course.id ? null : course.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {showActionMenu === course.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowActionMenu(null)} />
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Eye size={16} />
                              Preview
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Copy size={16} />
                              Duplicate
                            </button>
                            {course.status === 'published' ? (
                              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
                                <Pause size={16} />
                                Unpublish
                              </button>
                            ) : (
                              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                                <Play size={16} />
                                Publish
                              </button>
                            )}
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                              <Archive size={16} />
                              Archive
                            </button>
                            <div className="border-t border-gray-100 my-2"></div>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Track</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Students</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={(e) => handleSelectCourse(course.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.lessons} lessons • {course.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.track}</td>
                    <td className="px-6 py-4">{getStatusBadge(course.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.students}</td>
                    <td className="px-6 py-4">
                      {course.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">${course.price}/mo</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={18} />
                        </Link>
                        <Link
                          to={`/admin/courses/${course.id}/curriculum`}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          <BookOpen size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No courses found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

export default CourseList;
