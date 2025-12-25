/**
 * Course List Page
 * Manage all courses in the system
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Plus, MoreVertical, Edit, Trash2,
  Eye, Copy, Archive, ChevronDown, Clock, Users, Star,
  CheckCircle, XCircle, AlertCircle, Play, Pause, Grid, List,
  Upload, Loader2, ExternalLink
} from 'lucide-react';
import { adminApi } from '@/api/admin';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch courses and tracks on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesRes, tracksRes] = await Promise.all([
        adminApi.getCourses({ limit: 100 }),
        adminApi.getTracks({ limit: 100 }),
      ]);
      setCourses(coursesRes.courses || []);
      setTracks(tracksRes.tracks || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && course.isActive) ||
      (statusFilter === 'inactive' && !course.isActive);
    const matchesTrack = trackFilter === 'all' || course.trackId === trackFilter;
    return matchesSearch && matchesStatus && matchesTrack;
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

  const handleDuplicate = async (courseId) => {
    try {
      setActionLoading(courseId);
      await adminApi.duplicateCourse(courseId);
      await fetchData();
      setShowActionMenu(null);
    } catch (err) {
      alert(err.message || 'Failed to duplicate course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (courseId, currentStatus) => {
    try {
      setActionLoading(courseId);
      await adminApi.updateCourse(courseId, { isActive: !currentStatus });
      await fetchData();
      setShowActionMenu(null);
    } catch (err) {
      alert(err.message || 'Failed to update course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(courseId);
      await adminApi.deleteCourse(courseId);
      await fetchData();
      setShowActionMenu(null);
    } catch (err) {
      alert(err.message || 'Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCourses.length === 0) return;

    try {
      setActionLoading('bulk');
      await adminApi.bulkActionCourses(action, selectedCourses);
      await fetchData();
      setSelectedCourses([]);
    } catch (err) {
      alert(err.message || 'Failed to perform bulk action');
    } finally {
      setActionLoading(null);
    }
  };

  const courseCounts = {
    total: courses.length,
    active: courses.filter(c => c.isActive).length,
    inactive: courses.filter(c => !c.isActive).length,
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Failed to load courses</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500">Create, edit, and manage your courses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Loader2 size={18} className={actionLoading ? 'animate-spin' : ''} />
            Refresh
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              <p className="text-2xl font-bold text-gray-900">{courseCounts.active}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <XCircle size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courseCounts.inactive}</p>
              <p className="text-sm text-gray-500">Inactive</p>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                  <option key={track.id} value={track.id}>{track.title}</option>
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
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={actionLoading === 'bulk'}
              className="text-sm text-green-600 font-medium hover:text-green-700 disabled:opacity-50"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={actionLoading === 'bulk'}
              className="text-sm text-yellow-600 font-medium hover:text-yellow-700 disabled:opacity-50"
            >
              Deactivate
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedCourses.length} courses?`)) {
                  handleBulkAction('delete');
                }
              }}
              disabled={actionLoading === 'bulk'}
              className="text-sm text-red-600 font-medium hover:text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
            {actionLoading === 'bulk' && <Loader2 size={16} className="animate-spin text-gray-400" />}
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
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={48} className="text-white/50" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(course.isActive)}
                </div>
                <div className="absolute top-3 right-3">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={(e) => handleSelectCourse(course.id, e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-white/50 rounded focus:ring-blue-500 bg-white/20"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-3">
                  {course.track && (
                    <span className="text-xs font-medium text-blue-600">{course.track.title}</span>
                  )}
                  <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">{course.title}</h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  {course.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {course.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {course.lessons} lessons
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{course.enrollmentCount || 0} enrolled</span>
                  </div>
                  <span className="font-bold text-gray-900">${parseFloat(course.price).toFixed(2)}</span>
                </div>

                {course.externalUrl && (
                  <div className="mb-4">
                    <a
                      href={course.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      EdX Platform
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{course.level || 'All Levels'}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/courses/${course.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === course.id ? null : course.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <MoreVertical size={18} />
                        )}
                      </button>
                      {showActionMenu === course.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowActionMenu(null)} />
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                            <button
                              onClick={() => handleDuplicate(course.id)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Copy size={16} />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleToggleActive(course.id, course.isActive)}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                                course.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {course.isActive ? <Pause size={16} /> : <Play size={16} />}
                              {course.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {course.externalUrl && (
                              <a
                                href={course.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ExternalLink size={16} />
                                Open in EdX
                              </a>
                            )}
                            <div className="border-t border-gray-100 my-2"></div>
                            <button
                              onClick={() => handleDelete(course.id)}
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
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Enrolled</th>
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
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center overflow-hidden">
                          {course.image ? (
                            <img src={course.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen size={20} className="text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.lessons} lessons {course.duration && `• ${course.duration}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {course.track?.title || '—'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(course.isActive)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.enrollmentCount || 0}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${parseFloat(course.price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleToggleActive(course.id, course.isActive)}
                          className={`p-2 rounded-lg ${
                            course.isActive
                              ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          disabled={actionLoading === course.id}
                        >
                          {course.isActive ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          disabled={actionLoading === course.id}
                        >
                          <Trash2 size={18} />
                        </button>
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
          <p className="text-gray-500 mb-4">No courses found matching your criteria</p>
          <Link
            to="/admin/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Course
          </Link>
        </div>
      )}
    </div>
  );
}

export default CourseList;
