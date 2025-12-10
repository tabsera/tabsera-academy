import React, { useState } from 'react';
import { Search, KeyRound, Send, CheckCircle2, Clock, Users, Mail, RefreshCw } from 'lucide-react';

const PasswordResetCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const users = [
    { id: 1, name: 'Ahmed Hassan', email: 'ahmed@student.edu', role: 'Student', center: 'Aqoonyahan School', lastReset: '2025-11-15' },
    { id: 2, name: 'Fatima Omar', email: 'fatima@student.edu', role: 'Student', center: 'Aqoonyahan School', lastReset: null },
    { id: 3, name: 'Mohamed Teacher', email: 'mohamed@teacher.edu', role: 'Teacher', center: 'Sunrise International', lastReset: '2025-12-01' },
    { id: 4, name: 'Zahra Ahmed', email: 'zahra@student.edu', role: 'Student', center: 'Al-Noor Academy', lastReset: '2025-10-20' },
    { id: 5, name: 'Center Admin', email: 'admin@aqoonyahan.edu', role: 'Center Admin', center: 'Aqoonyahan School', lastReset: '2025-12-10' },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Password Reset Center</h1>
        <p className="text-gray-500">Send password reset links to students, teachers, and center admins</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users size={20} className="text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">510</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 size={20} className="text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-sm text-gray-500">Resets This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock size={20} className="text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg flex-1 max-w-md">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by name or email..." className="bg-transparent border-none outline-none text-sm w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {selectedUsers.length > 0 && (
          <button onClick={() => setShowConfirmModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            <Send size={16} />Send Reset Link ({selectedUsers.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3">
                <input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={selectAll} className="w-4 h-4 rounded border-gray-300" />
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Center</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Last Reset</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}>
                <td className="px-5 py-4">
                  <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelect(user.id)} className="w-4 h-4 rounded border-gray-300" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    user.role === 'Student' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'Teacher' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>{user.role}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{user.center}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{user.lastReset || 'Never'}</td>
                <td className="px-5 py-4 text-center">
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 inline-flex items-center gap-1">
                    <RefreshCw size={14} />Reset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Send Password Reset</h3>
              <p className="text-gray-500 mb-6">
                You're about to send password reset links to <span className="font-semibold">{selectedUsers.length}</span> user(s).
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancel</button>
                <button onClick={() => { setShowConfirmModal(false); setSelectedUsers([]); }} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold">Send Links</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetCenter;
