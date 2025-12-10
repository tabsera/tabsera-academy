/**
 * Track Management Page
 * Manage learning tracks and course assignments
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Search, Plus, Edit, Trash2, MoreVertical, Eye,
  BookOpen, Users, DollarSign, Clock, ChevronDown, X,
  CheckCircle, AlertCircle, GripVertical, ArrowUpDown,
  Settings, Star, Archive, Copy, ExternalLink, Loader2
} from 'lucide-react';

// Mock tracks data
const mockTracks = [
  {
    id: 'TRK001',
    name: 'Cambridge IGCSE Full Program',
    slug: 'igcse-full',
    description: 'Complete Cambridge IGCSE curriculum covering all core subjects for international students.',
    status: 'active',
    featured: true,
    price: 80,
    duration: '24 months',
    courses: [
      { id: 'CRS001', name: 'IGCSE Mathematics', order: 1 },
      { id: 'CRS002', name: 'IGCSE English (ESL)', order: 2 },
      { id: 'CRS003', name: 'IGCSE Biology', order: 3 },
      { id: 'CRS004', name: 'IGCSE Chemistry', order: 4 },
      { id: 'CRS005', name: 'IGCSE Physics', order: 5 },
    ],
    students: 356,
    revenue: 28500,
    createdAt: '2025-01-15',
  },
  {
    id: 'TRK002',
    name: 'Islamic Studies Program',
    slug: 'islamic-studies',
    description: 'Comprehensive Islamic education including Quran, Hadith, Fiqh, and Islamic history.',
    status: 'active',
    featured: true,
    price: 45,
    duration: '12 months',
    courses: [
      { id: 'CRS006', name: 'Quranic Studies & Tajweed', order: 1 },
      { id: 'CRS007', name: 'Islamic Fiqh Basics', order: 2 },
      { id: 'CRS008', name: 'Hadith Studies', order: 3 },
      { id: 'CRS009', name: 'Islamic History', order: 4 },
    ],
    students: 523,
    revenue: 23535,
    createdAt: '2025-02-01',
  },
  {
    id: 'TRK003',
    name: 'ESL Intensive',
    slug: 'esl-intensive',
    description: 'Focused English language learning for non-native speakers with Cambridge certification.',
    status: 'active',
    featured: false,
    price: 35,
    duration: '6 months',
    courses: [
      { id: 'CRS010', name: 'English Foundations', order: 1 },
      { id: 'CRS011', name: 'Speaking & Listening', order: 2 },
      { id: 'CRS012', name: 'Reading & Writing', order: 3 },
      { id: 'CRS002', name: 'IGCSE English (ESL)', order: 4 },
    ],
    students: 189,
    revenue: 6615,
    createdAt: '2025-03-10',
  },
  {
    id: 'TRK004',
    name: 'Business & Entrepreneurship',
    slug: 'business-track',
    description: 'Learn business fundamentals, entrepreneurship, and practical skills for the modern economy.',
    status: 'draft',
    featured: false,
    price: 55,
    duration: '9 months',
    courses: [
      { id: 'CRS013', name: 'Business Studies', order: 1 },
      { id: 'CRS014', name: 'Economics Fundamentals', order: 2 },
    ],
    students: 0,
    revenue: 0,
    createdAt: '2025-10-20',
  },
];

// Available courses for assignment
const availableCourses = [
  { id: 'CRS001', name: 'IGCSE Mathematics' },
  { id: 'CRS002', name: 'IGCSE English (ESL)' },
  { id: 'CRS003', name: 'IGCSE Biology' },
  { id: 'CRS004', name: 'IGCSE Chemistry' },
  { id: 'CRS005', name: 'IGCSE Physics' },
  { id: 'CRS006', name: 'Quranic Studies & Tajweed' },
  { id: 'CRS007', name: 'Islamic Fiqh Basics' },
  { id: 'CRS008', name: 'Hadith Studies' },
  { id: 'CRS009', name: 'Islamic History' },
  { id: 'CRS010', name: 'English Foundations' },
  { id: 'CRS011', name: 'Speaking & Listening' },
  { id: 'CRS012', name: 'Reading & Writing' },
  { id: 'CRS013', name: 'Business Studies' },
  { id: 'CRS014', name: 'Economics Fundamentals' },
];

function TrackManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [trackForm, setTrackForm] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'draft',
    featured: false,
    price: 0,
    duration: '',
    courses: [],
  });

  const filteredTracks = mockTracks.filter(track => {
    const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || track.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={12} />
            Active
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

  const openTrackModal = (track = null) => {
    if (track) {
      setEditingTrack(track);
      setTrackForm({
        name: track.name,
        slug: track.slug,
        description: track.description,
        status: track.status,
        featured: track.featured,
        price: track.price,
        duration: track.duration,
        courses: track.courses.map(c => c.id),
      });
    } else {
      setEditingTrack(null);
      setTrackForm({
        name: '',
        slug: '',
        description: '',
        status: 'draft',
        featured: false,
        price: 0,
        duration: '',
        courses: [],
      });
    }
    setShowTrackModal(true);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSaveTrack = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowTrackModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCourseToggle = (courseId) => {
    setTrackForm(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const trackStats = {
    total: mockTracks.length,
    active: mockTracks.filter(t => t.status === 'active').length,
    totalStudents: mockTracks.reduce((sum, t) => sum + t.students, 0),
    totalRevenue: mockTracks.reduce((sum, t) => sum + t.revenue, 0),
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Tracks</h1>
          <p className="text-gray-500">Organize courses into structured learning paths</p>
        </div>
        <button
          onClick={() => openTrackModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Track
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Layers size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trackStats.total}</p>
              <p className="text-sm text-gray-500">Total Tracks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trackStats.active}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trackStats.totalStudents.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${trackStats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTracks.map(track => (
          <div key={track.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Track Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusBadge(track.status)}
                  {track.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                      <Star size={12} className="fill-yellow-500" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === track.id ? null : track.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {showActionMenu === track.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowActionMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <button
                          onClick={() => { openTrackModal(track); setShowActionMenu(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit size={16} />
                          Edit Track
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Eye size={16} />
                          Preview
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Copy size={16} />
                          Duplicate
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">{track.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{track.description}</p>
            </div>

            {/* Track Stats */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{track.courses.length} courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{track.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{track.students} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">${track.price}/mo</span>
                </div>
              </div>

              {/* Courses Preview */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Included Courses</p>
                <div className="space-y-1">
                  {track.courses.slice(0, 3).map((course, idx) => (
                    <div key={course.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded text-xs font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {course.name}
                    </div>
                  ))}
                  {track.courses.length > 3 && (
                    <p className="text-xs text-gray-400">+{track.courses.length - 3} more courses</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2 border-t border-gray-100">
              <button
                onClick={() => openTrackModal(track)}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Edit size={16} className="inline mr-2" />
                Edit
              </button>
              <Link
                to={`/admin/tracks/${track.id}/courses`}
                className="flex-1 py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg text-center"
              >
                <BookOpen size={16} className="inline mr-2" />
                Manage Courses
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No tracks found</p>
          <button
            onClick={() => openTrackModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Create Your First Track
          </button>
        </div>
      )}

      {/* Track Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTrackModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTrack ? 'Edit Track' : 'Create New Track'}
              </h3>
              <button
                onClick={() => setShowTrackModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Track Name *</label>
                <input
                  type="text"
                  value={trackForm.name}
                  onChange={(e) => {
                    setTrackForm(f => ({
                      ...f,
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    }));
                  }}
                  placeholder="e.g., Cambridge IGCSE Full Program"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">tabsera.com/tracks/</span>
                  <input
                    type="text"
                    value={trackForm.slug}
                    onChange={(e) => setTrackForm(f => ({ ...f, slug: e.target.value }))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={trackForm.description}
                  onChange={(e) => setTrackForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe what students will learn..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={trackForm.price}
                      onChange={(e) => setTrackForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={trackForm.duration}
                    onChange={(e) => setTrackForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="e.g., 12 months"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={trackForm.status}
                    onChange={(e) => setTrackForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackForm.featured}
                      onChange={(e) => setTrackForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Featured Track</span>
                  </label>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Included Courses</label>
                <div className="border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {availableCourses.map(course => (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={trackForm.courses.includes(course.id)}
                          onChange={() => handleCourseToggle(course.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{course.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {trackForm.courses.length} courses selected
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowTrackModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTrack}
                disabled={isSaving || !trackForm.name.trim()}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 size={18} className="animate-spin" />}
                {editingTrack ? 'Save Changes' : 'Create Track'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackManagement;
