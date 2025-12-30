/**
 * Admin Management Page
 * Manage admin users, permissions, and change passwords
 */

import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Key, Plus, Trash2, Edit2, Save, X,
  CheckCircle, AlertCircle, Loader2, Eye, EyeOff,
  UserPlus, Lock, Settings, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/admin';
import { authApi } from '../../api/auth';

// Available permissions for admin users
const ADMIN_PERMISSIONS = [
  { key: 'users', label: 'User Management', description: 'Manage students, tutors, and center admins' },
  { key: 'courses', label: 'Course Management', description: 'Create and edit courses and learning packs' },
  { key: 'orders', label: 'Order Management', description: 'View and manage orders and payments' },
  { key: 'tutors', label: 'Tutor Management', description: 'Approve tutors and manage tuition packs' },
  { key: 'partners', label: 'Partner Management', description: 'Manage learning centers and settlements' },
  { key: 'settings', label: 'System Settings', description: 'Configure platform settings' },
  { key: 'admins', label: 'Admin Management', description: 'Manage other admin users' },
];

function AdminManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('password');
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // New admin state
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    permissions: ['users', 'courses', 'orders'],
  });
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Edit permissions state
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);

  // Fetch admin users
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getUsers({ role: 'tabsera_admin', limit: 100 });
      setAdmins(result.users || []);
    } catch (err) {
      setError('Failed to load admin users');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newAdminForm.email || !newAdminForm.password || !newAdminForm.firstName) {
      setError('Please fill all required fields');
      return;
    }

    setIsAddingAdmin(true);
    try {
      await adminApi.createUser({
        ...newAdminForm,
        role: 'tabsera_admin',
        adminPermissions: newAdminForm.permissions,
      });
      setSuccess('Admin user created successfully!');
      setShowAddAdmin(false);
      setNewAdminForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        permissions: ['users', 'courses', 'orders'],
      });
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to create admin user');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Handle permission toggle for new admin
  const toggleNewAdminPermission = (permKey) => {
    setNewAdminForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey],
    }));
  };

  // Handle edit permissions
  const startEditPermissions = (admin) => {
    setEditingAdmin(admin);
    setEditPermissions(admin.adminPermissions || []);
  };

  const toggleEditPermission = (permKey) => {
    setEditPermissions(prev =>
      prev.includes(permKey)
        ? prev.filter(p => p !== permKey)
        : [...prev, permKey]
    );
  };

  const savePermissions = async () => {
    setError(null);
    try {
      await adminApi.updateUser(editingAdmin.id, {
        adminPermissions: editPermissions,
      });
      setSuccess('Permissions updated successfully!');
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to update permissions');
    }
  };

  // Handle reset password for another admin
  const handleResetPassword = async (adminId) => {
    if (!confirm('Send password reset email to this admin?')) return;

    try {
      await adminApi.resetUserPassword(adminId);
      setSuccess('Password reset email sent!');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (adminId === user.id) {
      setError('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this admin user?')) return;

    try {
      await adminApi.deleteUser(adminId);
      setSuccess('Admin user deleted!');
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to delete admin');
    }
  };

  const tabs = [
    { id: 'password', label: 'Change Password', icon: Key },
    { id: 'admins', label: 'Admin Users', icon: Users },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-500">Manage admin users and permissions</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-600">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Key size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Change Your Password</h2>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* Admin Users Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              {/* Add Admin Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  <UserPlus size={18} />
                  Add Admin User
                </button>
              </div>

              {/* Admin List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Admin Users ({admins.length})</h2>
                </div>

                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-500">Loading admin users...</p>
                  </div>
                ) : admins.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No admin users found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {admins.map(admin => (
                      <div key={admin.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-semibold">
                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {admin.firstName} {admin.lastName}
                                {admin.id === user.id && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditPermissions(admin)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Permissions"
                            >
                              <Shield size={18} />
                            </button>
                            <button
                              onClick={() => handleResetPassword(admin.id)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              title="Reset Password"
                            >
                              <Key size={18} />
                            </button>
                            {admin.id !== user.id && (
                              <button
                                onClick={() => handleDeleteAdmin(admin.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete Admin"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Permissions badges */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(admin.adminPermissions || ['all']).map(perm => (
                            <span
                              key={perm}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {ADMIN_PERMISSIONS.find(p => p.key === perm)?.label || perm}
                            </span>
                          ))}
                          {!admin.adminPermissions && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              Full Access
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Add Admin User</h2>
                <button
                  onClick={() => setShowAddAdmin(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newAdminForm.firstName}
                    onChange={(e) => setNewAdminForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newAdminForm.lastName}
                    onChange={(e) => setNewAdminForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {ADMIN_PERMISSIONS.map(perm => (
                    <label
                      key={perm.key}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={newAdminForm.permissions.includes(perm.key)}
                        onChange={() => toggleNewAdminPermission(perm.key)}
                        className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{perm.label}</p>
                        <p className="text-sm text-gray-500">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAdmin(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingAdmin}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isAddingAdmin ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <UserPlus size={18} />
                  )}
                  {isAddingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Permissions</h2>
                  <p className="text-sm text-gray-500">
                    {editingAdmin.firstName} {editingAdmin.lastName}
                  </p>
                </div>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {ADMIN_PERMISSIONS.map(perm => (
                  <label
                    key={perm.key}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={editPermissions.includes(perm.key)}
                      onChange={() => toggleEditPermission(perm.key)}
                      className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{perm.label}</p>
                      <p className="text-sm text-gray-500">{perm.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={savePermissions}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  <Save size={18} />
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
