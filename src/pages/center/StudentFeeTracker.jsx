import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Download, Clock, CheckCircle2, AlertTriangle,
  Users, X, DollarSign, Calendar, Send, Filter
} from 'lucide-react';

const StudentFeeTracker = () => {
  const [selectedMonth, setSelectedMonth] = useState('jan-2026');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const monthlySummary = {
    totalExpected: 4900,
    totalCollected: 4260,
    totalPending: 640,
    collectionRate: 87,
    paidStudents: 52,
    pendingStudents: 8,
    dueDate: 'Jan 5, 2026'
  };

  const students = [
    { id: 1, name: 'Ahmed Hassan', track: 'IGCSE Full', classroom: 'Boys A', fee: 80, status: 'paid', paidDate: 'Jan 2, 2026', paymentMethod: 'Zaad' },
    { id: 2, name: 'Fatima Omar', track: 'IGCSE Full', classroom: 'Girls A', fee: 80, status: 'paid', paidDate: 'Jan 3, 2026', paymentMethod: 'Cash' },
    { id: 3, name: 'Mohamed Ali', track: 'Islamic Studies', classroom: 'Boys B', fee: 25, status: 'paid', paidDate: 'Jan 1, 2026', paymentMethod: 'EVC' },
    { id: 4, name: 'Halima Yusuf', track: 'IGCSE Full', classroom: 'Girls A', fee: 80, status: 'paid', paidDate: 'Jan 4, 2026', paymentMethod: 'Bank' },
    { id: 5, name: 'Ibrahim Farah', track: 'IGCSE Full', classroom: 'Boys A', fee: 80, status: 'pending', dueDate: 'Jan 5, 2026', daysOverdue: 3 },
    { id: 6, name: 'Amina Hassan', track: 'Islamic Studies', classroom: 'Girls B', fee: 25, status: 'pending', dueDate: 'Jan 5, 2026', daysOverdue: 3 },
    { id: 7, name: 'Yusuf Ibrahim', track: 'IGCSE Full', classroom: 'Boys A', fee: 80, status: 'pending', dueDate: 'Jan 5, 2026', daysOverdue: 3 },
    { id: 8, name: 'Khadija Ali', track: 'IGCSE Full', classroom: 'Girls A', fee: 80, status: 'pending', dueDate: 'Jan 5, 2026', daysOverdue: 3 },
  ];

  const filteredStudents = students.filter(student => {
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesTrack = filterTrack === 'all' || student.track === filterTrack;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesTrack && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />Paid</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} />Pending</span>;
      case 'overdue':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><AlertTriangle size={12} />Overdue</span>;
      default:
        return null;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-cyan-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Fee Tracker</h1>
          <p className="text-gray-500">Track and record student fee payments</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium border-none outline-none cursor-pointer">
            <option value="jan-2026">January 2026</option>
            <option value="dec-2025">December 2025</option>
            <option value="nov-2025">November 2025</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            <Download size={16} />Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Send size={16} />Send Reminders
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Expected</span>
            <DollarSign size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${monthlySummary.totalExpected.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Due: {monthlySummary.dueDate}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Collected</span>
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">${monthlySummary.totalCollected.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">{monthlySummary.paidStudents} students paid</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending</span>
            <Clock size={18} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">${monthlySummary.totalPending.toLocaleString()}</p>
          <p className="text-xs text-yellow-600 mt-1">{monthlySummary.pendingStudents} students pending</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Collection Rate</span>
            <Users size={18} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{monthlySummary.collectionRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${monthlySummary.collectionRate}%` }}></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white">
          <p className="text-sm text-blue-100 mb-1">Your Share (50%)</p>
          <p className="text-2xl font-bold">${(monthlySummary.totalCollected * 0.5).toLocaleString()}</p>
          <p className="text-xs text-blue-100 mt-1">of collected fees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
            <option value="all">All Tracks</option>
            <option value="IGCSE Full">IGCSE Full</option>
            <option value="Islamic Studies">Islamic Studies</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Students ({filteredStudents.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Track</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Classroom</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Fee</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(student.name)}`}>
                        {getInitials(student.name)}
                      </div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{student.track}</td>
                  <td className="px-5 py-4 text-gray-600">{student.classroom}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">${student.fee}</td>
                  <td className="px-5 py-4">
                    {getStatusBadge(student.status)}
                    {student.paidDate && <p className="text-xs text-gray-500 mt-1">{student.paidDate}</p>}
                    {student.daysOverdue && <p className="text-xs text-red-500 mt-1">{student.daysOverdue} days overdue</p>}
                  </td>
                  <td className="px-5 py-4">
                    {student.status === 'pending' ? (
                      <button 
                        onClick={() => { setSelectedStudent(student); setShowPaymentModal(true); }}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700"
                      >
                        Record Payment
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">{student.paymentMethod}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(selectedStudent.name)}`}>
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-500">{selectedStudent.track} • {selectedStudent.classroom}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input type="text" value={`$${selectedStudent.fee}`} readOnly className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-lg font-bold" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Cash', 'Zaad', 'EVC', 'Bank'].map(method => (
                    <button key={method} className="px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>

              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeTracker;
