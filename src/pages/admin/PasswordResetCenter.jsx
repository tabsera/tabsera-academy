/**
 * Password Reset Center
 * Send password reset links to users (students, teachers, center admins)
 */

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import {
  Search, KeyRound, Send, CheckCircle2, Clock, Users, Mail,
  RefreshCw, Loader2, AlertCircle, X, Filter
} from 'lucide-react';

const PasswordResetCenter = () => {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [centerFilter, setCenterFilter] = useState('');

  // Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Reset state
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [singleResetId, setSingleResetId] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({ total: 0, offset: 0, limit: 50 });

  // Fetch users and centers on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, roleFilter, centerFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, centersRes] = await Promise.all([
        adminApi.getUsers({ limit: 50 }),
        adminApi.getCenters()
      ]);
      setUsers(usersRes.users || []);
      setPagination({
        total: usersRes.total || 0,
        offset: 0,
        limit: 50
      });
      setCenters(centersRes.centers || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {
        limit: 50,
        offset: 0,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        centerId: centerFilter || undefined,
      };
      const response = await adminApi.getUsers(params);
      setUsers(response.users || []);
      setPagination({
        total: response.total || 0,
        offset: 0,
        limit: 50
      });
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Stats calculated from users
  const stats = {
    totalUsers: pagination.total,
    recentResets: users.filter(u => {
      if (!u.passwordResetAt) return false;
      const resetDate = new Date(u.passwordResetAt);
      const now = new Date();
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return resetDate > monthAgo;
    }).length,
    pendingResets: users.filter(u => u.passwordResetToken && !u.emailVerified).length,
  };

  const toggleSelect = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSingleReset = async (userId) => {
    try {
      setSingleResetId(userId);
      await adminApi.resetUserPassword(userId);
      setResetResult({
        success: true,
        message: 'Password reset link sent successfully!',
        count: 1,
      });
      // Refresh users to update lastReset
      fetchUsers();
    } catch (err) {
      console.error('Error resetting password:', err);
      setResetResult({
        success: false,
        message: err.message || 'Failed to send reset link',
      });
    } finally {
      setSingleResetId(null);
    }
  };

  const handleBulkReset = async () => {
    try {
      setResetting(true);
      const result = await adminApi.bulkResetPasswords(selectedUsers);
      setResetResult({
        success: true,
        message: `Password reset links sent to ${result.sent || selectedUsers.length} user(s)!`,
        count: result.sent || selectedUsers.length,
        failed: result.failed || 0,
      });
      setSelectedUsers([]);
      setShowConfirmModal(false);
      // Refresh users
      fetchUsers();
    } catch (err) {
      console.error('Error bulk resetting passwords:', err);
      setResetResult({
        success: false,
        message: err.message || 'Failed to send reset links',
      });
      setShowConfirmModal(false);
    } finally {
      setResetting(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-100 text-blue-700';
      case 'CENTER_ADMIN':
        return 'bg-green-100 text-green-700';
      case 'TABSERA_ADMIN':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case 'STUDENT':
        return 'Student';
      case 'CENTER_ADMIN':
        return 'Center Admin';
      case 'TABSERA_ADMIN':
        return 'Admin';
      default:
        return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Users</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Password Reset Center</h1>
        <p className="text-gray-500">Send password reset links to students, teachers, and center admins</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.recentResets}</p>
              <p className="text-sm text-gray-500">Resets This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingResets}</p>
              <p className="text-sm text-gray-500">Pending Resets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Result Toast */}
      {resetResult && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start justify-between ${
          resetResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {resetResult.success ? (
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${resetResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {resetResult.success ? 'Success!' : 'Error'}
              </p>
              <p className={`text-sm ${resetResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {resetResult.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setResetResult(null)}
            className={`p-1 rounded hover:bg-white/50 ${
              resetResult.success ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg flex-1 min-w-[200px] max-w-md">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none outline-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="CENTER_ADMIN">Center Admins</option>
            <option value="TABSERA_ADMIN">Admins</option>
          </select>

          {/* Center Filter */}
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none outline-none cursor-pointer"
          >
            <option value="">All Centers</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>

          {/* Bulk Action Button */}
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 ml-auto"
            >
              <Send size={16} />
              Send Reset Link ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Center</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                          {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                          {user.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {user.center?.name || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.passwordResetAt && (
                          <span className="text-xs text-gray-400">
                            Reset: {formatDate(user.passwordResetAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleSingleReset(user.id)}
                        disabled={singleResetId === user.id}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {singleResetId === user.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={14} />
                            Reset
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination info */}
        {users.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            Showing {users.length} of {pagination.total} users
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !resetting && setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Send Password Reset</h3>
              <p className="text-gray-500 mb-6">
                You're about to send password reset links to{' '}
                <span className="font-semibold">{selectedUsers.length}</span> user(s).
                They will receive an email with instructions to reset their password.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={resetting}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkReset}
                  disabled={resetting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Links'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetCenter;
