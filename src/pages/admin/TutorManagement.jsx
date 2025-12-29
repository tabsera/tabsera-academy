/**
 * Admin Tutor Management Page
 * Manage tutor applications, approve/reject, view details
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import {
  GraduationCap, Search, Filter, Eye, Check, X, Clock,
  Loader2, AlertCircle, ChevronDown, FileText, BookOpen,
  Star, Calendar, MoreVertical, UserCheck, UserX, RefreshCw
} from 'lucide-react';

const STATUS_BADGES = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  SUSPENDED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Suspended' },
};

function TutorManagement() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTutors();
    fetchStats();
  }, [statusFilter]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const result = await adminApi.getTutors(params);
      setTutors(result.tutors || []);
    } catch (err) {
      setError(err.message || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminApi.getTutorStats();
      setStats(result.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors();
  };

  const viewTutorDetails = async (tutor) => {
    try {
      const result = await adminApi.getTutor(tutor.id);
      setSelectedTutor(result.tutor);
      setShowDetails(true);
    } catch (err) {
      alert('Failed to load tutor details');
    }
  };

  const approveTutor = async (tutorId) => {
    if (!confirm('Approve this tutor? They will be enrolled as staff in their selected courses.')) return;

    setActionLoading(tutorId);
    try {
      await adminApi.approveTutor(tutorId);
      fetchTutors();
      fetchStats();
      if (showDetails) setShowDetails(false);
    } catch (err) {
      alert(err.message || 'Failed to approve tutor');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectTutor = async (tutorId) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    setActionLoading(tutorId);
    try {
      await adminApi.rejectTutor(tutorId, { reason });
      fetchTutors();
      fetchStats();
      if (showDetails) setShowDetails(false);
    } catch (err) {
      alert(err.message || 'Failed to reject tutor');
    } finally {
      setActionLoading(null);
    }
  };

  const suspendTutor = async (tutorId) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    setActionLoading(tutorId);
    try {
      await adminApi.suspendTutor(tutorId, { reason });
      fetchTutors();
      fetchStats();
      if (showDetails) setShowDetails(false);
    } catch (err) {
      alert(err.message || 'Failed to suspend tutor');
    } finally {
      setActionLoading(null);
    }
  };

  const reactivateTutor = async (tutorId) => {
    if (!confirm('Reactivate this tutor?')) return;

    setActionLoading(tutorId);
    try {
      await adminApi.reactivateTutor(tutorId);
      fetchTutors();
      fetchStats();
      if (showDetails) setShowDetails(false);
    } catch (err) {
      alert(err.message || 'Failed to reactivate tutor');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tutor Management</h1>
            <p className="text-gray-500">Review and manage tutor applications</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingTutors}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedTutors}</p>
                  <p className="text-sm text-gray-500">Approved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTutors}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                  <p className="text-sm text-gray-500">Sessions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tutors..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={fetchTutors}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tutors List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Loading tutors...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : tutors.length === 0 ? (
            <div className="p-8 text-center">
              <GraduationCap size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tutors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tutor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Certifications</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applied</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tutors.map(tutor => (
                    <tr key={tutor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {tutor.user?.firstName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {tutor.user?.firstName} {tutor.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{tutor.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_BADGES[tutor.status]?.bg || 'bg-gray-100'
                        } ${STATUS_BADGES[tutor.status]?.text || 'text-gray-700'}`}>
                          {STATUS_BADGES[tutor.status]?.label || tutor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{tutor.courses?.length || 0} courses</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{tutor.certifications?.length || 0} docs</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(tutor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => viewTutorDetails(tutor)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {tutor.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => approveTutor(tutor.id)}
                                disabled={actionLoading === tutor.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Approve"
                              >
                                {actionLoading === tutor.id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <Check size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => rejectTutor(tutor.id)}
                                disabled={actionLoading === tutor.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Reject"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          {tutor.status === 'APPROVED' && (
                            <button
                              onClick={() => suspendTutor(tutor.id)}
                              disabled={actionLoading === tutor.id}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                              title="Suspend"
                            >
                              <UserX size={18} />
                            </button>
                          )}
                          {tutor.status === 'SUSPENDED' && (
                            <button
                              onClick={() => reactivateTutor(tutor.id)}
                              disabled={actionLoading === tutor.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Reactivate"
                            >
                              <RefreshCw size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedTutor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Tutor Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <GraduationCap size={32} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedTutor.user?.firstName} {selectedTutor.user?.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedTutor.headline}</p>
                    <p className="text-sm text-gray-500">{selectedTutor.user?.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    STATUS_BADGES[selectedTutor.status]?.bg
                  } ${STATUS_BADGES[selectedTutor.status]?.text}`}>
                    {STATUS_BADGES[selectedTutor.status]?.label}
                  </span>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600">{selectedTutor.bio || 'No bio provided'}</p>
                </div>

                {/* Courses */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Selected Courses ({selectedTutor.courses?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTutor.courses?.map(tc => (
                      <span
                        key={tc.id}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {tc.course?.title}
                        {tc.edxStaffEnrolled && (
                          <Check size={14} className="inline ml-1 text-green-600" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Certifications ({selectedTutor.certifications?.length || 0})
                  </h4>
                  {selectedTutor.certifications?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTutor.certifications.map(cert => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{cert.title}</p>
                              <p className="text-sm text-gray-500">{cert.institution}</p>
                            </div>
                          </div>
                          <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No certifications uploaded</p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedTutor.totalSessions || 0}</p>
                    <p className="text-sm text-gray-500">Total Sessions</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedTutor.avgRating ? parseFloat(selectedTutor.avgRating).toFixed(1) : '-'}
                    </p>
                    <p className="text-sm text-gray-500">Avg Rating</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedTutor.timezone}</p>
                    <p className="text-sm text-gray-500">Timezone</p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedTutor.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="font-semibold text-red-800 mb-1">Rejection/Suspension Reason</h4>
                    <p className="text-red-700">{selectedTutor.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Close
                </button>
                {selectedTutor.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => rejectTutor(selectedTutor.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveTutor(selectedTutor.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                    >
                      {actionLoading ? 'Approving...' : 'Approve'}
                    </button>
                  </>
                )}
                {selectedTutor.status === 'APPROVED' && (
                  <button
                    onClick={() => suspendTutor(selectedTutor.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200"
                  >
                    Suspend
                  </button>
                )}
                {selectedTutor.status === 'SUSPENDED' && (
                  <button
                    onClick={() => reactivateTutor(selectedTutor.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default TutorManagement;
