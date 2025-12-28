/**
 * Tuition Pack Management Page
 * Manage tuition credit packs and student assignments
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet, Search, Plus, Edit, Trash2, MoreVertical,
  CheckCircle, XCircle, Loader2, Users, Clock, CreditCard,
  Gift, Calendar, X, User, ChevronDown
} from 'lucide-react';
import { adminApi } from '@/api/admin';

function TuitionPackManagement() {
  const [packs, setPacks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('packs');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('all');

  // Modal states
  const [showPackModal, setShowPackModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [assigningPack, setAssigningPack] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmPack, setDeleteConfirmPack] = useState(null);

  // Form state
  const [packForm, setPackForm] = useState({
    name: '',
    description: '',
    creditsIncluded: 10,
    validityDays: 365,
    price: 0,
    isActive: true,
  });

  const [assignForm, setAssignForm] = useState({
    userId: '',
    notes: '',
  });
  const [userSearch, setUserSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [packsRes, statsRes, usersRes] = await Promise.all([
        adminApi.getTuitionPacks(),
        adminApi.getTuitionPurchasesStats(),
        adminApi.getUsers({ role: 'STUDENT', limit: 100 }),
      ]);
      setPacks(packsRes.packs || []);
      setStats(statsRes.stats || null);
      setUsers(usersRes.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load tuition packs');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      const params = {};
      if (purchaseStatusFilter !== 'all') {
        params.status = purchaseStatusFilter;
      }
      const res = await adminApi.getTuitionPurchases(params);
      setPurchases(res.purchases || []);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchPurchases();
    }
  }, [activeTab, purchaseStatusFilter]);

  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && pack.isActive) ||
      (statusFilter === 'inactive' && !pack.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user =>
    userSearch === '' ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

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
        name: pack.name,
        description: pack.description || '',
        creditsIncluded: pack.creditsIncluded,
        validityDays: pack.validityDays,
        price: parseFloat(pack.price) || 0,
        isActive: pack.isActive,
      });
    } else {
      setEditingPack(null);
      setPackForm({
        name: '',
        description: '',
        creditsIncluded: 10,
        validityDays: 365,
        price: 0,
        isActive: true,
      });
    }
    setShowPackModal(true);
  };

  const openAssignModal = (pack) => {
    setAssigningPack(pack);
    setAssignForm({ userId: '', notes: '' });
    setUserSearch('');
    setShowAssignModal(true);
  };

  const handleSavePack = async () => {
    if (!packForm.name.trim()) {
      alert('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPack) {
        await adminApi.updateTuitionPack(editingPack.id, packForm);
      } else {
        await adminApi.createTuitionPack(packForm);
      }
      await fetchData();
      setShowPackModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save tuition pack');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignPack = async () => {
    if (!assignForm.userId) {
      alert('Please select a student');
      return;
    }

    setIsSaving(true);
    try {
      await adminApi.assignTuitionPack(assigningPack.id, assignForm.userId, assignForm.notes);
      await fetchData();
      setShowAssignModal(false);
      alert(`Successfully assigned ${assigningPack.creditsIncluded} credits to the student`);
    } catch (err) {
      alert(err.message || 'Failed to assign tuition pack');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePack = async (pack) => {
    setIsDeleting(true);
    try {
      await adminApi.deleteTuitionPack(pack.id);
      await fetchData();
      setDeleteConfirmPack(null);
    } catch (err) {
      alert(err.message || 'Failed to delete tuition pack');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (pack) => {
    try {
      await adminApi.updateTuitionPack(pack.id, { isActive: !pack.isActive });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tuition Packs</h1>
          <p className="text-gray-500">Manage tuition credit packages for tutoring sessions</p>
        </div>
        <button
          onClick={() => openPackModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Pack
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCredits}</p>
                <p className="text-sm text-gray-500">Total Credits Sold</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CreditCard size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.remainingCredits}</p>
                <p className="text-sm text-gray-500">Available Credits</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activePurchases}</p>
                <p className="text-sm text-gray-500">Active Purchases</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.usedCredits}</p>
                <p className="text-sm text-gray-500">Credits Used</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('packs')}
            className={`py-3 px-1 border-b-2 font-medium ${
              activeTab === 'packs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tuition Packs
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-3 px-1 border-b-2 font-medium ${
              activeTab === 'purchases'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchases
          </button>
        </div>
      </div>

      {activeTab === 'packs' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search packs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Wallet size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{pack.name}</h3>
                        <p className="text-sm text-gray-500">{pack.creditsIncluded} credits</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === pack.id ? null : pack.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>
                      {showActionMenu === pack.id && (
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => { openPackModal(pack); setShowActionMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                          >
                            <Edit size={16} className="text-gray-500" />
                            Edit
                          </button>
                          <button
                            onClick={() => { openAssignModal(pack); setShowActionMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                          >
                            <Gift size={16} className="text-gray-500" />
                            Assign to Student
                          </button>
                          <button
                            onClick={() => { handleToggleStatus(pack); setShowActionMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                          >
                            {pack.isActive ? (
                              <>
                                <XCircle size={16} className="text-gray-500" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} className="text-gray-500" />
                                Activate
                              </>
                            )}
                          </button>
                          <hr className="my-2" />
                          <button
                            onClick={() => { setDeleteConfirmPack(pack); setShowActionMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-left text-red-600"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {pack.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pack.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Price</span>
                      <span className="font-semibold text-gray-900">{formatPrice(pack.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Validity</span>
                      <span className="text-gray-700">{pack.validityDays} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Purchases</span>
                      <span className="text-gray-700">{pack.purchaseCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Credits Sold</span>
                      <span className="text-gray-700">{pack.totalCreditsSold || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {getStatusBadge(pack.isActive)}
                    <button
                      onClick={() => openAssignModal(pack)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Assign to Student
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPacks.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No tuition packs found</h3>
              <p className="text-gray-500 mb-4">Create your first tuition pack to get started</p>
              <button
                onClick={() => openPackModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Pack
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'purchases' && (
        <>
          {/* Purchases Filters */}
          <div className="flex gap-4">
            <select
              value={purchaseStatusFilter}
              onChange={(e) => setPurchaseStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white"
            >
              <option value="all">All Purchases</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="depleted">Depleted</option>
            </select>
          </div>

          {/* Purchases Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Pack</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Expires</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.map((purchase) => {
                    const now = new Date();
                    const isExpired = new Date(purchase.expiresAt) <= now;
                    const isDepleted = purchase.creditsRemaining === 0;

                    return (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User size={16} className="text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {purchase.user?.firstName} {purchase.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{purchase.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{purchase.tuitionPack?.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {purchase.creditsRemaining} / {purchase.creditsTotal}
                            </p>
                            <p className="text-gray-500">
                              {purchase.creditsUsed} used, {purchase.creditsReserved || 0} reserved
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(purchase.expiresAt)}
                        </td>
                        <td className="px-6 py-4">
                          {isExpired ? (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              Expired
                            </span>
                          ) : isDepleted ? (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                              Depleted
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {purchase.assignedBy ? 'Admin Assigned' : purchase.order ? 'Purchased' : 'Unknown'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {purchases.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No purchases found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Pack Modal */}
      {showPackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPack ? 'Edit Tuition Pack' : 'Create Tuition Pack'}
              </h2>
              <button onClick={() => setShowPackModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={packForm.name}
                  onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
                  placeholder="e.g., 10 Credit Pack"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={packForm.description}
                  onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credits Included</label>
                  <input
                    type="number"
                    min="1"
                    value={packForm.creditsIncluded}
                    onChange={(e) => setPackForm({ ...packForm, creditsIncluded: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Each credit = 10-minute session</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={packForm.price}
                    onChange={(e) => setPackForm({ ...packForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validity Period (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={packForm.validityDays}
                  onChange={(e) => setPackForm({ ...packForm, validityDays: parseInt(e.target.value) || 365 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Credits expire this many days after purchase</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={packForm.isActive}
                  onChange={(e) => setPackForm({ ...packForm, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (available for purchase)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPackModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePack}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {editingPack ? 'Save Changes' : 'Create Pack'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && assigningPack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Assign Credits to Student</h2>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-blue-800">
                  Assigning <strong>{assigningPack.creditsIncluded} credits</strong> from{' '}
                  <strong>{assigningPack.name}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Valid for {assigningPack.validityDays} days from assignment
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 mb-2"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                  {filteredUsers.slice(0, 10).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setAssignForm({ ...assignForm, userId: user.id })}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 ${
                        assignForm.userId === user.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      {assignForm.userId === user.id && (
                        <CheckCircle size={18} className="text-blue-600" />
                      )}
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="p-4 text-center text-gray-500">No students found</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="Reason for assignment..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPack}
                disabled={isSaving || !assignForm.userId}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Assign Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Tuition Pack?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete "{deleteConfirmPack.name}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmPack(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePack(deleteConfirmPack)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 size={16} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TuitionPackManagement;
