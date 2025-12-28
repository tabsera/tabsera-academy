/**
 * Country Management Page
 * Admin page to manage countries, currencies, and exchange rates
 */

import React, { useState, useEffect } from 'react';
import {
  Globe, Plus, Edit2, Trash2, Save, X, Search,
  DollarSign, Phone, Check, AlertCircle, Loader2
} from 'lucide-react';
import apiClient from '../../api/client';

function CountryManagement() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // New country modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCountry, setNewCountry] = useState({
    code: '',
    name: '',
    dialCode: '',
    currency: '',
    currencySymbol: '',
    usdExchangeRate: 1,
    isActive: true,
    sortOrder: 100,
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/countries/admin');
      setCountries(response.countries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (country) => {
    setEditingId(country.id);
    setEditForm({ ...country });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      await apiClient.put(`/countries/${editingId}`, editForm);
      setCountries(countries.map(c =>
        c.id === editingId ? { ...c, ...editForm } : c
      ));
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      alert('Failed to update country: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this country?')) return;

    try {
      await apiClient.delete(`/countries/${id}`);
      setCountries(countries.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete country: ' + err.message);
    }
  };

  const handleToggleActive = async (country) => {
    try {
      await apiClient.put(`/countries/${country.id}`, {
        isActive: !country.isActive,
      });
      setCountries(countries.map(c =>
        c.id === country.id ? { ...c, isActive: !c.isActive } : c
      ));
    } catch (err) {
      alert('Failed to update country: ' + err.message);
    }
  };

  const handleAddCountry = async () => {
    try {
      if (!newCountry.code || !newCountry.name) {
        alert('Country code and name are required');
        return;
      }

      const response = await apiClient.post('/countries', newCountry);
      setCountries([...countries, response.country]);
      setShowAddModal(false);
      setNewCountry({
        code: '',
        name: '',
        dialCode: '',
        currency: '',
        currencySymbol: '',
        usdExchangeRate: 1,
        isActive: true,
        sortOrder: 100,
      });
    } catch (err) {
      alert('Failed to add country: ' + err.message);
    }
  };

  // Filter countries
  const filteredCountries = countries.filter(country => {
    const matchesSearch = !searchTerm ||
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = showInactive || country.isActive;
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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Country Management</h1>
          <p className="text-gray-500">Manage countries, currencies, and exchange rates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Country
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
              placeholder="Search countries..."
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

      {/* Countries Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Code</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Country</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Dial Code</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Currency</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">USD Rate</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Order</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCountries.map((country) => (
                <tr key={country.id} className={`hover:bg-gray-50 ${!country.isActive ? 'opacity-50' : ''}`}>
                  {editingId === country.id ? (
                    // Edit Mode
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                          maxLength={2}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.dialCode || ''}
                          onChange={(e) => setEditForm({ ...editForm, dialCode: e.target.value })}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editForm.currency || ''}
                            onChange={(e) => setEditForm({ ...editForm, currency: e.target.value.toUpperCase() })}
                            className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                            placeholder="USD"
                            maxLength={3}
                          />
                          <input
                            type="text"
                            value={editForm.currencySymbol || ''}
                            onChange={(e) => setEditForm({ ...editForm, currencySymbol: e.target.value })}
                            className="w-10 px-2 py-1 border border-gray-200 rounded text-sm"
                            placeholder="$"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editForm.usdExchangeRate}
                          onChange={(e) => setEditForm({ ...editForm, usdExchangeRate: parseFloat(e.target.value) || 1 })}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                          step="0.0001"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editForm.sortOrder}
                          onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-gray-900">{country.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">{country.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{country.dialCode || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">
                          {country.currencySymbol} {country.currency || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{parseFloat(country.usdExchangeRate).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-500 text-sm">{country.sortOrder}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(country)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            country.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {country.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(country)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(country.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <Globe size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No countries found</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredCountries.length} of {countries.length} countries
        ({countries.filter(c => c.isActive).length} active)
      </div>

      {/* Add Country Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Country</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code (ISO) *
                  </label>
                  <input
                    type="text"
                    value={newCountry.code}
                    onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    placeholder="SO"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dial Code
                  </label>
                  <input
                    type="text"
                    value={newCountry.dialCode}
                    onChange={(e) => setNewCountry({ ...newCountry, dialCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    placeholder="+252"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Name *
                </label>
                <input
                  type="text"
                  value={newCountry.name}
                  onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  placeholder="Somalia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    value={newCountry.currency}
                    onChange={(e) => setNewCountry({ ...newCountry, currency: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    placeholder="SOS"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={newCountry.currencySymbol}
                    onChange={(e) => setNewCountry({ ...newCountry, currencySymbol: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    placeholder="S"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    USD Exchange Rate
                  </label>
                  <input
                    type="number"
                    value={newCountry.usdExchangeRate}
                    onChange={(e) => setNewCountry({ ...newCountry, usdExchangeRate: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    step="0.0001"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={newCountry.sortOrder}
                    onChange={(e) => setNewCountry({ ...newCountry, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCountry.isActive}
                  onChange={(e) => setNewCountry({ ...newCountry, isActive: e.target.checked })}
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
                onClick={handleAddCountry}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Add Country
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CountryManagement;
