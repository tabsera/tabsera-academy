/**
 * Student Registration Page
 * Manage all registered students
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Plus, Download, Eye, Edit2, Trash2,
  CheckCircle2, Clock, XCircle, ChevronRight, Building2,
  Calendar, Mail, Phone, UserPlus, Loader2, X, AlertCircle
} from 'lucide-react';
import { adminApi } from '@/api/admin';

const StudentRegistration = () => {
  const [students, setStudents] = useState([]);
  const [centers, setCenters] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [total, setTotal] = useState(0);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    centerId: '',
    role: 'STUDENT',
    isActive: true,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    thisMonth: 0,
  });

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [searchQuery, filterCenter, filterStatus]);

  useEffect(() => {
    fetchCentersAndTracks();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.getUsers({
        role: 'STUDENT',
        search: searchQuery || undefined,
        centerId: filterCenter || undefined,
        status: filterStatus || undefined,
        limit: 100,
      });

      setStudents(response.users || []);
      setTotal(response.total || 0);

      // Calculate stats
      const allStudents = response.users || [];
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        total: response.total || 0,
        active: allStudents.filter(s => s.isActive).length,
        inactive: allStudents.filter(s => !s.isActive).length,
        thisMonth: allStudents.filter(s => new Date(s.createdAt) >= monthAgo).length,
      });
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCentersAndTracks = async () => {
    try {
      const [centersRes, tracksRes] = await Promise.all([
        adminApi.getCenters(),
        adminApi.getTracks({ limit: 100 }),
      ]);
      setCenters(centersRes.centers || []);
      setTracks(tracksRes.tracks || []);
    } catch (err) {
      console.error('Error fetching centers/tracks:', err);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      centerId: '',
      role: 'STUDENT',
      isActive: true,
    });
    setSelectedStudent(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (student) => {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      centerId: student.centerId || '',
      role: student.role,
      isActive: student.isActive,
    });
    setSelectedStudent(student);
    setShowAddModal(true);
  };

  const handleOpenView = async (student) => {
    try {
      const response = await adminApi.getUser(student.id);
      setSelectedStudent(response.user);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (selectedStudent) {
        await adminApi.updateUser(selectedStudent.id, formData);
      } else {
        await adminApi.createUser({
          ...formData,
          sendWelcomeEmail: true,
        });
      }

      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving student:', err);
      alert(err.message || 'Failed to save student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await adminApi.deleteUser(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (student) => {
    try {
      await adminApi.updateUser(student.id, { isActive: !student.isActive });
      fetchData();
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };

  const getStatusBadge = (student) => {
    if (!student.emailVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
          <Clock size={12} />Pending
        </span>
      );
    }
    if (student.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <CheckCircle2 size={12} />Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
        <XCircle size={12} />Inactive
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Registry</h1>
          <p className="text-gray-500">Manage all registered students across learning centers</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/students/enroll" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
            <UserPlus size={18} />Bulk Enroll
          </Link>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} />Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-blue-600">+{stats.thisMonth}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent border-none outline-none text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterCenter}
            onChange={(e) => setFilterCenter(e.target.value)}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none"
          >
            <option value="">All Centers</option>
            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
          <Download size={16} />Export
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first student or use bulk enrollment.</p>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Add Student
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Center</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Enrollments</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Joined</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {student.firstName?.[0]}{student.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {student.center?.name || <span className="text-gray-400">No center</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {student.enrollmentCount || 0} courses
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {getStatusBadge(student)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenView(student)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(student)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
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
      )}

      {/* Add/Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isSaving && setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Center</label>
                <select
                  value={formData.centerId}
                  onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No center</option>
                  {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.firstName || !formData.lastName || !formData.email}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 size={18} className="animate-spin" />}
                {selectedStudent ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h4>
                  <p className="text-gray-500">{selectedStudent.email}</p>
                  {selectedStudent.phone && <p className="text-gray-500">{selectedStudent.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Center</p>
                  <p className="font-medium">{selectedStudent.center?.name || 'No center'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedStudent)}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Enrollments</p>
                  <p className="font-medium">{selectedStudent.enrollments?.length || 0} courses</p>
                </div>
              </div>

              {selectedStudent.enrollments?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Enrolled Courses</h5>
                  <div className="space-y-2">
                    {selectedStudent.enrollments.map(e => (
                      <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{e.course?.title || e.track?.title}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Student</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={18} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;
