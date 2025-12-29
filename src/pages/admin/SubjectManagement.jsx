/**
 * Subject Management Page
 * Admin page to manage course subjects/categories
 */

import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Edit2, Trash2, Save, X, Search,
  BookOpen, AlertCircle, Loader2
} from 'lucide-react';
import apiClient from '../../api/client';

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // New subject modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 100,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/subjects/admin');
      setSubjects(response.subjects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setEditForm({ ...subject });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      await apiClient.put(`/subjects/${editingId}`, editForm);
      setSubjects(subjects.map(s =>
        s.id === editingId ? { ...s, ...editForm } : s
      ));
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      alert('Failed to update subject: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    const subject = subjects.find(s => s.id === id);
    if (subject?._count?.courses > 0) {
      alert(`Cannot delete: ${subject._count.courses} course(s) are using this subject`);
      return;
    }

    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await apiClient.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete subject: ' + err.message);
    }
  };

  const handleToggleActive = async (subject) => {
    try {
      await apiClient.put(`/subjects/${subject.id}`, {
        isActive: !subject.isActive,
      });
      setSubjects(subjects.map(s =>
        s.id === subject.id ? { ...s, isActive: !s.isActive } : s
      ));
    } catch (err) {
      alert('Failed to update subject: ' + err.message);
    }
  };

  const handleAddSubject = async () => {
    try {
      if (!newSubject.name) {
        alert('Subject name is required');
        return;
      }

      const response = await apiClient.post('/subjects', newSubject);
      setSubjects([...subjects, response.subject]);
      setShowAddModal(false);
      setNewSubject({
        name: '',
        slug: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        isActive: true,
        sortOrder: 100,
      });
    } catch (err) {
      alert('Failed to add subject: ' + err.message);
    }
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !searchTerm ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = showInactive || subject.isActive;
    return matchesSearch && matchesActive;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-gray-500">Manage course subjects and categories</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Subject
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show inactive</span>
          </label>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className={`bg-white rounded-2xl border border-gray-100 p-5 ${!subject.isActive ? 'opacity-50' : ''}`}
          >
            {editingId === subject.id ? (
              // Edit Mode
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium"
                  placeholder="Subject Name"
                />
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="slug"
                />
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Description"
                  rows={2}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editForm.icon || ''}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Icon name"
                  />
                  <input
                    type="color"
                    value={editForm.color || '#3B82F6'}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editForm.sortOrder}
                    onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Order"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${subject.color}20` }}
                  >
                    <Tag size={24} style={{ color: subject.color }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={subject._count?.courses > 0}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{subject.slug}</p>

                {subject.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{subject.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen size={14} />
                    <span>{subject._count?.courses || 0} courses</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(subject)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subject.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Tag size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No subjects found</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredSubjects.length} of {subjects.length} subjects
        ({subjects.filter(s => s.isActive).length} active)
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Subject</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({
                    ...newSubject,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={newSubject.slug}
                  onChange={(e) => setNewSubject({ ...newSubject, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  placeholder="mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  placeholder="Brief description of the subject"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    value={newSubject.icon}
                    onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    placeholder="Calculator"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newSubject.color}
                      onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                      className="w-12 h-10 border border-gray-200 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newSubject.color}
                      onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={newSubject.sortOrder}
                  onChange={(e) => setNewSubject({ ...newSubject, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newSubject.isActive}
                  onChange={(e) => setNewSubject({ ...newSubject, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-600">Active</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectManagement;
