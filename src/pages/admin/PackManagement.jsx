/**
 * Learning Pack Management Page
 * Manage learning packs - bundles of courses and tuition packs
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Search, Plus, Edit, Trash2, MoreVertical, Eye,
  BookOpen, Users, DollarSign, Clock, ChevronDown, X,
  CheckCircle, XCircle, Star, Copy, ExternalLink, Loader2, Play, Pause, CreditCard
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

function PackManagement() {
  const [packs, setPacks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tuitionPacks, setTuitionPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPackModal, setShowPackModal] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirmPack, setDeleteConfirmPack] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [packForm, setPackForm] = useState({
    title: '',
    slug: '',
    description: '',
    isActive: false,
    discountPercentage: 0,
    duration: '',
    level: '',
    image: '',
    courses: [],
    tuitionPacks: [], // Array of { id, quantity }
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [packsRes, coursesRes, tuitionPacksRes] = await Promise.all([
        adminApi.getPacks({ limit: 100 }),
        adminApi.getCourses({ limit: 100 }),
        adminApi.getTuitionPacks({ limit: 100 }),
      ]);
      setPacks(packsRes.packs || []);
      setCourses(coursesRes.courses || []);
      setTuitionPacks(tuitionPacksRes.packs || []);
    } catch (err) {
      setError(err.message || 'Failed to load learning packs');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && pack.isActive) ||
      (statusFilter === 'inactive' && !pack.isActive);
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

  const openPackModal = (pack = null) => {
    if (pack) {
      setEditingPack(pack);
      setPackForm({
        title: pack.title,
        slug: pack.slug,
        description: pack.description || '',
        isActive: pack.isActive,
        discountPercentage: parseFloat(pack.discountPercentage) || 0,
        duration: pack.duration || '',
        level: pack.level || '',
        image: pack.image || '',
        courses: pack.courses?.map(c => c.id) || [],
        tuitionPacks: pack.tuitionPacks?.map(tp => ({ id: tp.id, quantity: tp.quantity || 1 })) || [],
      });
    } else {
      setEditingPack(null);
      setPackForm({
        title: '',
        slug: '',
        description: '',
        isActive: false,
        discountPercentage: 0,
        duration: '',
        level: '',
        image: '',
        courses: [],
        tuitionPacks: [],
      });
    }
    setShowPackModal(true);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSavePack = async () => {
    if (!packForm.title.trim() || !packForm.slug.trim()) {
      alert('Title and slug are required');
      return;
    }

    setIsSaving(true);
    try {
      const tuitionPackIds = packForm.tuitionPacks.map(tp => ({
        tuitionPackId: tp.id,
        quantity: tp.quantity || 1,
      }));

      if (editingPack) {
        await adminApi.updatePack(editingPack.id, {
          title: packForm.title,
          slug: packForm.slug,
          description: packForm.description,
          isActive: packForm.isActive,
          discountPercentage: packForm.discountPercentage,
          duration: packForm.duration,
          level: packForm.level,
          image: packForm.image,
          tuitionPackIds,
        });
        // Update course assignments
        await adminApi.updatePackCourses(editingPack.id, packForm.courses);
      } else {
        const result = await adminApi.createPack({
          title: packForm.title,
          slug: packForm.slug,
          description: packForm.description,
          isActive: packForm.isActive,
          discountPercentage: packForm.discountPercentage,
          duration: packForm.duration,
          level: packForm.level,
          image: packForm.image,
          tuitionPackIds,
        });
        // Assign courses if any selected
        if (packForm.courses.length > 0 && result.pack) {
          await adminApi.updatePackCourses(result.pack.id, packForm.courses);
        }
      }
      await fetchData();
      setShowPackModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save learning pack');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (pack) => {
    setDeleteConfirmPack(pack);
    setShowActionMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPack) return;
    try {
      setIsDeleting(true);
      await adminApi.deletePack(deleteConfirmPack.id);
      await fetchData();
      setDeleteConfirmPack(null);
    } catch (err) {
      alert(err.message || 'Failed to delete learning pack');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (packId) => {
    try {
      setActionLoading(packId);
      await adminApi.duplicatePack(packId);
      await fetchData();
      setShowActionMenu(null);
    } catch (err) {
      alert(err.message || 'Failed to duplicate learning pack');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (packId, currentStatus) => {
    try {
      setActionLoading(packId);
      await adminApi.updatePack(packId, { isActive: !currentStatus });
      await fetchData();
      setShowActionMenu(null);
    } catch (err) {
      alert(err.message || 'Failed to update learning pack');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCourseToggle = (courseId) => {
    setPackForm(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const handleTuitionPackToggle = (tuitionPackId) => {
    setPackForm(prev => {
      const exists = prev.tuitionPacks.find(tp => tp.id === tuitionPackId);
      if (exists) {
        return {
          ...prev,
          tuitionPacks: prev.tuitionPacks.filter(tp => tp.id !== tuitionPackId)
        };
      }
      return {
        ...prev,
        tuitionPacks: [...prev.tuitionPacks, { id: tuitionPackId, quantity: 1 }]
      };
    });
  };

  const handleTuitionPackQuantity = (tuitionPackId, quantity) => {
    setPackForm(prev => ({
      ...prev,
      tuitionPacks: prev.tuitionPacks.map(tp =>
        tp.id === tuitionPackId ? { ...tp, quantity: Math.max(1, parseInt(quantity) || 1) } : tp
      )
    }));
  };

  const packStats = {
    total: packs.length,
    active: packs.filter(p => p.isActive).length,
    totalCourses: packs.reduce((sum, p) => sum + (p.coursesCount || 0), 0),
    totalEnrollments: packs.reduce((sum, p) => sum + (p.enrollmentCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading learning packs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Failed to load learning packs</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Learning Packs</h1>
          <p className="text-gray-500">Bundle courses and tuition credits together</p>
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
            onClick={() => openPackModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Pack
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
              <p className="text-2xl font-bold text-gray-900">{packStats.total}</p>
              <p className="text-sm text-gray-500">Total Packs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{packStats.active}</p>
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
              <p className="text-2xl font-bold text-gray-900">{packStats.totalCourses}</p>
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
              <p className="text-2xl font-bold text-gray-900">{packStats.totalEnrollments}</p>
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
              placeholder="Search learning packs..."
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

      {/* Packs Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredPacks.map(pack => (
          <div key={pack.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Pack Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusBadge(pack.isActive)}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === pack.id ? null : pack.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    disabled={actionLoading === pack.id}
                  >
                    {actionLoading === pack.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <MoreVertical size={18} />
                    )}
                  </button>
                  {showActionMenu === pack.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowActionMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <button
                          onClick={() => { openPackModal(pack); setShowActionMenu(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit size={16} />
                          Edit Pack
                        </button>
                        <button
                          onClick={() => handleDuplicate(pack.id)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Copy size={16} />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleToggleActive(pack.id, pack.isActive)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                            pack.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {pack.isActive ? <Pause size={16} /> : <Play size={16} />}
                          {pack.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          onClick={() => handleDeleteClick(pack)}
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pack.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{pack.description || 'No description'}</p>
            </div>

            {/* Pack Stats */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{pack.coursesCount || 0} courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{pack.tuitionPacksCount || 0} tuition packs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{pack.enrollmentCount || 0} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gray-400" />
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">${parseFloat(pack.price || 0).toFixed(2)}</span>
                    {parseFloat(pack.discountPercentage) > 0 && (
                      <span className="text-green-600 ml-1">({pack.discountPercentage}% off)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Courses Preview */}
              {pack.courses && pack.courses.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Included Courses</p>
                  <div className="space-y-1">
                    {pack.courses.slice(0, 3).map((course, idx) => (
                      <div key={course.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded text-xs font-medium flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {course.title}
                      </div>
                    ))}
                    {pack.courses.length > 3 && (
                      <p className="text-xs text-gray-400">+{pack.courses.length - 3} more courses</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tuition Packs Preview */}
              {pack.tuitionPacks && pack.tuitionPacks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Included Tuition Credits</p>
                  <div className="flex flex-wrap gap-2">
                    {pack.tuitionPacks.map((tp) => (
                      <span key={tp.id} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                        {tp.quantity > 1 ? `${tp.quantity}x ` : ''}{tp.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2 border-t border-gray-100">
              <button
                onClick={() => openPackModal(pack)}
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Edit size={16} className="inline mr-2" />
                Edit
              </button>
              <Link
                to={`/packs/${pack.slug}`}
                target="_blank"
                className="flex-1 py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg text-center"
              >
                <ExternalLink size={16} className="inline mr-2" />
                View
              </Link>
              <button
                onClick={() => handleDeleteClick(pack)}
                disabled={actionLoading === pack.id}
                className="flex-1 py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                {actionLoading === pack.id ? (
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

      {filteredPacks.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No learning packs found</p>
          <button
            onClick={() => openPackModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Create Your First Learning Pack
          </button>
        </div>
      )}

      {/* Pack Modal */}
      {showPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPackModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingPack ? 'Edit Learning Pack' : 'Create Learning Pack'}
              </h3>
              <button
                onClick={() => setShowPackModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pack Name *</label>
                <input
                  type="text"
                  value={packForm.title}
                  onChange={(e) => {
                    setPackForm(f => ({
                      ...f,
                      title: e.target.value,
                      slug: editingPack ? f.slug : generateSlug(e.target.value)
                    }));
                  }}
                  placeholder="e.g., IGCSE Complete Bundle"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/packs/</span>
                  <input
                    type="text"
                    value={packForm.slug}
                    onChange={(e) => setPackForm(f => ({ ...f, slug: e.target.value }))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <RichTextEditor
                  value={packForm.description}
                  onChange={(value) => setPackForm(f => ({ ...f, description: value }))}
                  placeholder="Describe what students will get..."
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
                      value={packForm.discountPercentage}
                      onChange={(e) => setPackForm(f => ({ ...f, discountPercentage: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) }))}
                      className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Discount off the total bundle price</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={packForm.duration}
                    onChange={(e) => setPackForm(f => ({ ...f, duration: e.target.value }))}
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
                    value={packForm.level}
                    onChange={(e) => setPackForm(f => ({ ...f, level: e.target.value }))}
                    placeholder="e.g., Beginner to Advanced"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={packForm.isActive}
                      onChange={(e) => setPackForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Active (Published)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pack Image</label>
                <ImageUpload
                  value={packForm.image}
                  onChange={(url) => setPackForm(f => ({ ...f, image: url }))}
                  folder="packs"
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Included Courses</label>
                <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
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
                            checked={packForm.courses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{course.title}</span>
                          <span className="text-gray-400 text-sm">${parseFloat(course.price || 0).toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {packForm.courses.length} courses selected
                </p>
              </div>

              {/* Tuition Pack Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Included Tuition Packs</label>
                <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                  {tuitionPacks.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No tuition packs available</p>
                  ) : (
                    <div className="space-y-2">
                      {tuitionPacks.map(tp => {
                        const selected = packForm.tuitionPacks.find(p => p.id === tp.id);
                        return (
                          <div
                            key={tp.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => handleTuitionPackToggle(tp.id)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-gray-700 flex-1">{tp.name}</span>
                            <span className="text-gray-400 text-sm">{tp.creditsIncluded} credits</span>
                            {selected && (
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={selected.quantity}
                                onChange={(e) => handleTuitionPackQuantity(tp.id, e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {packForm.tuitionPacks.length} tuition pack(s) selected
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowPackModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePack}
                disabled={isSaving || !packForm.title.trim() || !packForm.slug.trim()}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 size={18} className="animate-spin" />}
                {editingPack ? 'Save Changes' : 'Create Pack'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setDeleteConfirmPack(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Learning Pack</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-1">{deleteConfirmPack.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{deleteConfirmPack.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                    <BookOpen size={18} />
                    <span className="text-2xl font-bold">{deleteConfirmPack.coursesCount || 0}</span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Courses</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                    <Users size={18} />
                    <span className="text-2xl font-bold">{deleteConfirmPack.enrollmentCount || 0}</span>
                  </div>
                  <p className="text-xs text-purple-600 font-medium">Enrollments</p>
                </div>
              </div>

              {(deleteConfirmPack.coursesCount > 0 || deleteConfirmPack.enrollmentCount > 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Warning</p>
                      <p className="text-yellow-700">
                        {deleteConfirmPack.coursesCount > 0 && `This pack contains ${deleteConfirmPack.coursesCount} course(s). `}
                        {deleteConfirmPack.enrollmentCount > 0 && `${deleteConfirmPack.enrollmentCount} student(s) are enrolled. `}
                        Deleting will remove all associations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to delete <strong>{deleteConfirmPack.title}</strong>?
              </p>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setDeleteConfirmPack(null)}
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
                    Delete Pack
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

export default PackManagement;
