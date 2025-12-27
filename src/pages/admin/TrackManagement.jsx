/**
 * Track Management Page
 * Manage learning tracks and course assignments
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Search, Plus, Edit, Trash2, MoreVertical, Eye,
  BookOpen, Users, DollarSign, Clock, ChevronDown, X,
  CheckCircle, XCircle, Star, Copy, ExternalLink, Loader2, Play, Pause
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

function TrackManagement() {
  const [tracks, setTracks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirmTrack, setDeleteConfirmTrack] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [trackForm, setTrackForm] = useState({
    title: '',
    slug: '',
    description: '',
    isActive: false,
    discountPercentage: 0,
    duration: '',
    level: '',
    image: '',
    courses: [],
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tracksRes, coursesRes] = await Promise.all([
        adminApi.getTracks({ limit: 100 }),
        adminApi.getCourses({ limit: 100 }),
      ]);
      setTracks(tracksRes.tracks || []);
      setCourses(coursesRes.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load tracks');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && track.isActive) ||
      (statusFilter === 'inactive' && !track.isActive);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <CheckCircle size={12} />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
        <XCircle size={12} />
        Inactive
      </span>
    );
  };

  const openTrackModal = (track = null) => {
    if (track) {
      setEditingTrack(track);
      setTrackForm({
        title: track.title,
        slug: track.slug,
        description: track.description || '',
        isActive: track.isActive,
        discountPercentage: parseFloat(track.discountPercentage) || 0,
        duration: track.duration || '',
        level: track.level || '',
        image: track.image || '',
        courses: track.courses?.map(c => c.id) || [],
      });
    } else {
      setEditingTrack(null);
      setTrackForm({
        title: '',
        slug: '',
        description: '',
        isActive: false,
        discountPercentage: 0,
        duration: '',
        level: '',
        image: '',
        courses: [],
      });
    }
    setShowTrackModal(true);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSaveTrack = async () => {
    if (!trackForm.title.trim() || !trackForm.slug.trim()) {
      alert('Title and slug are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTrack) {
        await adminApi.updateTrack(editingTrack.id, {
          title: trackForm.title,
          slug: trackForm.slug,
          description: trackForm.description,
          isActive: trackForm.isActive,
          discountPercentage: trackForm.discountPercentage,
          duration: trackForm.duration,
          level: trackForm.level,
          image: trackForm.image,
        });
        // Update course assignments
        await adminApi.updateTrackCourses(editingTrack.id, trackForm.courses);
      } else {
        const result = await adminApi.createTrack({
          title: trackForm.title,
          slug: trackForm.slug,
          description: trackForm.description,
          isActive: trackForm.isActive,
          discountPercentage: trackForm.discountPercentage,
          duration: trackForm.duration,
          level: trackForm.level,
          image: trackForm.image,
        });
        // Assign courses if any selected
        if (trackForm.courses.length > 0 && result.track) {
          await adminApi.updateTrackCourses(result.track.id, trackForm.courses);
        }
      }
      await fetchData();
      setShowTrackModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save track');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (track) => {
    setDeleteConfirmTrack(track);
    setShowActionMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTrack) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteTrack(deleteConfirmTrack.id);
      await fetchData();
      setDeleteConfirmTrack(null);
    } catch (err) {
      alert(err.message || 'Failed to delete track');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (trackId) => {
    try {
      setActionLoading(trackId);
      await adminApi.duplicateTrack(trackId);
      await fetchData();
      setShowActionMenu(null);
    } catch (err) {
      alert(err.message || 'Failed to duplicate track');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (trackId, currentStatus) => {
    try {
      setActionLoading(trackId);
      await adminApi.updateTrack(trackId, { isActive: !currentStatus });
      await fetchData();
      setShowActionMenu(null);
    } catch (err) {
      alert(err.message || 'Failed to update track');
    } finally {
      setActionLoading(null);
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
    total: tracks.length,
    active: tracks.filter(t => t.isActive).length,
    totalCourses: tracks.reduce((sum, t) => sum + (t.coursesCount || 0), 0),
    totalEnrollments: tracks.reduce((sum, t) => sum + (t.enrollmentCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading tracks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Failed to load tracks</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Tracks</h1>
          <p className="text-gray-500">Organize courses into structured learning paths</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Loader2 size={18} className={actionLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => openTrackModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Track
          </button>
        </div>
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
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trackStats.totalCourses}</p>
              <p className="text-sm text-gray-500">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trackStats.totalEnrollments}</p>
              <p className="text-sm text-gray-500">Enrollments</p>
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
              <option value="inactive">Inactive</option>
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
                  {getStatusBadge(track.isActive)}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === track.id ? null : track.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    disabled={actionLoading === track.id}
                  >
                    {actionLoading === track.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <MoreVertical size={18} />
                    )}
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
                        <button
                          onClick={() => handleDuplicate(track.id)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Copy size={16} />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleToggleActive(track.id, track.isActive)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                            track.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {track.isActive ? <Pause size={16} /> : <Play size={16} />}
                          {track.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          onClick={() => handleDeleteClick(track)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{track.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{track.description || 'No description'}</p>
            </div>

            {/* Track Stats */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{track.coursesCount || 0} courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{track.duration || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{track.enrollmentCount || 0} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gray-400" />
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">${parseFloat(track.price || 0).toFixed(2)}</span>
                    {parseFloat(track.discountPercentage) > 0 && (
                      <span className="text-green-600 ml-1">({track.discountPercentage}% off)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Courses Preview */}
              {track.courses && track.courses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Included Courses</p>
                  <div className="space-y-1">
                    {track.courses.slice(0, 3).map((course, idx) => (
                      <div key={course.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded text-xs font-medium flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {course.title}
                      </div>
                    ))}
                    {track.courses.length > 3 && (
                      <p className="text-xs text-gray-400">+{track.courses.length - 3} more courses</p>
                    )}
                  </div>
                </div>
              )}
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
                to={`/tracks/${track.slug}`}
                target="_blank"
                className="flex-1 py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg text-center"
              >
                <ExternalLink size={16} className="inline mr-2" />
                View
              </Link>
              <button
                onClick={() => handleDeleteClick(track)}
                disabled={actionLoading === track.id}
                className="flex-1 py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                {actionLoading === track.id ? (
                  <Loader2 size={16} className="inline mr-2 animate-spin" />
                ) : (
                  <Trash2 size={16} className="inline mr-2" />
                )}
                Delete
              </button>
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
                  value={trackForm.title}
                  onChange={(e) => {
                    setTrackForm(f => ({
                      ...f,
                      title: e.target.value,
                      slug: editingTrack ? f.slug : generateSlug(e.target.value)
                    }));
                  }}
                  placeholder="e.g., Cambridge IGCSE O Level"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/tracks/</span>
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
                <RichTextEditor
                  value={trackForm.description}
                  onChange={(value) => setTrackForm(f => ({ ...f, description: value }))}
                  placeholder="Describe what students will learn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={trackForm.discountPercentage}
                      onChange={(e) => setTrackForm(f => ({ ...f, discountPercentage: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) }))}
                      className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Discount off the total price of included courses</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <input
                    type="text"
                    value={trackForm.level}
                    onChange={(e) => setTrackForm(f => ({ ...f, level: e.target.value }))}
                    placeholder="e.g., Beginner to Advanced"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackForm.isActive}
                      onChange={(e) => setTrackForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Active (Published)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Track Image</label>
                <ImageUpload
                  value={trackForm.image}
                  onChange={(url) => setTrackForm(f => ({ ...f, image: url }))}
                  folder="tracks"
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Included Courses</label>
                <div className="border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No courses available</p>
                  ) : (
                    <div className="space-y-2">
                      {courses.map(course => (
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
                          <span className="text-gray-700">{course.title}</span>
                          {course.track && course.track.id !== editingTrack?.id && (
                            <span className="text-xs text-gray-400">(in {course.track.title})</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
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
                disabled={isSaving || !trackForm.title.trim() || !trackForm.slug.trim()}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 size={18} className="animate-spin" />}
                {editingTrack ? 'Save Changes' : 'Create Track'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setDeleteConfirmTrack(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Track</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-1">{deleteConfirmTrack.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{deleteConfirmTrack.description || 'No description'}</p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                    <BookOpen size={18} />
                    <span className="text-2xl font-bold">{deleteConfirmTrack.coursesCount || 0}</span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Courses</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                    <Users size={18} />
                    <span className="text-2xl font-bold">{deleteConfirmTrack.enrollmentCount || 0}</span>
                  </div>
                  <p className="text-xs text-purple-600 font-medium">Enrollments</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                    <DollarSign size={18} />
                    <span className="text-2xl font-bold">${parseFloat(deleteConfirmTrack.price || 0).toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-green-600 font-medium">Price</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                    <Clock size={18} />
                    <span className="text-sm font-bold">{deleteConfirmTrack.duration || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-orange-600 font-medium">Duration</p>
                </div>
              </div>

              {/* Warning */}
              {(deleteConfirmTrack.coursesCount > 0 || deleteConfirmTrack.enrollmentCount > 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Warning</p>
                      <p className="text-yellow-700">
                        {deleteConfirmTrack.coursesCount > 0 && `This track contains ${deleteConfirmTrack.coursesCount} course(s). `}
                        {deleteConfirmTrack.enrollmentCount > 0 && `${deleteConfirmTrack.enrollmentCount} student(s) are enrolled. `}
                        Deleting will remove all associations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to delete <strong>{deleteConfirmTrack.title}</strong>?
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setDeleteConfirmTrack(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Track
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackManagement;
