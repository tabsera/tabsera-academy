import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Plus, Filter, Download, Eye, Edit2, Trash2,
  CheckCircle2, Clock, AlertCircle, ChevronRight, Building2,
  Calendar, Mail, Phone, UserPlus
} from 'lucide-react';

const StudentRegistration = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCenter, setFilterCenter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const students = [
    { id: 1, name: 'Ahmed Hassan', email: 'ahmed@student.edu', center: 'Aqoonyahan School', track: 'IGCSE Full', classroom: 'Boys A', status: 'active', joinedDate: '2025-09-01' },
    { id: 2, name: 'Fatima Omar', email: 'fatima@student.edu', center: 'Aqoonyahan School', track: 'IGCSE Full', classroom: 'Girls A', status: 'active', joinedDate: '2025-09-01' },
    { id: 3, name: 'Mohamed Ali', email: 'mohamed@student.edu', center: 'Sunrise International', track: 'Business', classroom: 'Class A', status: 'active', joinedDate: '2025-09-15' },
    { id: 4, name: 'Zahra Ahmed', email: 'zahra@student.edu', center: 'Al-Noor Academy', track: 'Islamic Studies', classroom: 'Girls B', status: 'pending', joinedDate: '2025-10-01' },
    { id: 5, name: 'Ibrahim Farah', email: 'ibrahim@student.edu', center: 'Excel Academy', track: 'Science', classroom: 'Class B', status: 'active', joinedDate: '2025-09-01' },
  ];

  const centers = ['all', 'Aqoonyahan School', 'Sunrise International', 'Al-Noor Academy', 'Excel Academy'];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCenter = filterCenter === 'all' || s.center === filterCenter;
    return matchesSearch && matchesCenter;
  });

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
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} />Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">510</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">485</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pending Enrollment</p>
          <p className="text-2xl font-bold text-yellow-600">25</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-blue-600">+45</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg flex-1">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search by name or email..." className="bg-transparent border-none outline-none text-sm w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select value={filterCenter} onChange={(e) => setFilterCenter(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none">
            <option value="all">All Centers</option>
            {centers.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
          <Download size={16} />Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Center</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Track</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Classroom</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{student.center}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">{student.track}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{student.classroom}</td>
                <td className="px-5 py-4 text-center">
                  {student.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />Active</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} />Pending</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Edit2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Add New Student</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Center</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl">
                  <option>Select center</option>
                  {centers.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Track</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl">
                  <option>Select track</option>
                  <option>IGCSE Full Program</option>
                  <option>Islamic Studies</option>
                  <option>Business Track</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancel</button>
              <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold">Add Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;
