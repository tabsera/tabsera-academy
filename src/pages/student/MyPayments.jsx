/**
 * My Payments Page
 * Student payment history and upcoming payments
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Clock, CheckCircle, AlertTriangle, Download,
  Calendar, Filter, Search, ChevronDown, Receipt,
  DollarSign, ArrowRight, FileText, AlertCircle as AlertIcon
} from 'lucide-react';

// Mock data - replace with API calls
const mockPayments = [
  {
    id: 'PAY-2026-001',
    date: '2026-01-05',
    amount: 80,
    track: 'Cambridge IGCSE Full Program',
    method: 'Zaad',
    status: 'paid',
    receiptUrl: '/receipts/PAY-2026-001.pdf'
  },
  {
    id: 'PAY-2025-012',
    date: '2025-12-03',
    amount: 80,
    track: 'Cambridge IGCSE Full Program',
    method: 'Bank Transfer',
    status: 'paid',
    receiptUrl: '/receipts/PAY-2025-012.pdf'
  },
  {
    id: 'PAY-2025-011',
    date: '2025-11-02',
    amount: 80,
    track: 'Cambridge IGCSE Full Program',
    method: 'Cash',
    status: 'paid',
    receiptUrl: '/receipts/PAY-2025-011.pdf'
  },
  {
    id: 'PAY-2025-010',
    date: '2025-10-05',
    amount: 25,
    track: 'Islamic Studies Program',
    method: 'EVC Plus',
    status: 'paid',
    receiptUrl: '/receipts/PAY-2025-010.pdf'
  },
  {
    id: 'PAY-2025-009',
    date: '2025-09-28',
    amount: 25,
    track: 'Islamic Studies Program',
    method: 'Zaad',
    status: 'paid',
    receiptUrl: '/receipts/PAY-2025-009.pdf'
  }
];

const mockUpcomingPayments = [
  {
    id: 'upcoming-1',
    dueDate: '2026-02-05',
    amount: 80,
    track: 'Cambridge IGCSE Full Program',
    status: 'upcoming',
    daysLeft: 26
  },
  {
    id: 'upcoming-2',
    dueDate: '2026-02-05',
    amount: 25,
    track: 'Islamic Studies Program',
    status: 'upcoming',
    daysLeft: 26
  }
];

const mockPaymentSummary = {
  totalPaid: 290,
  paymentsThisYear: 1,
  nextPaymentDate: 'February 5, 2026',
  nextPaymentAmount: 105
};

function MyPayments() {
  const [filterYear, setFilterYear] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={12} />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <AlertTriangle size={12} />
            Overdue
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <Calendar size={12} />
            Upcoming
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'zaad':
        return '📱';
      case 'evc plus':
        return '📱';
      case 'bank transfer':
        return '🏦';
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      default:
        return '💰';
    }
  };

  const filteredPayments = mockPayments.filter(payment => {
    const matchesYear = filterYear === 'all' || payment.date.startsWith(filterYear);
    const matchesTrack = filterTrack === 'all' || payment.track === filterTrack;
    const matchesSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.track.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesTrack && matchesSearch;
  });

  const uniqueTracks = [...new Set(mockPayments.map(p => p.track))];
  const uniqueYears = [...new Set(mockPayments.map(p => p.date.substring(0, 4)))];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
          <p className="text-gray-500">View your payment history and upcoming dues</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Paid (2025-26)</span>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${mockPaymentSummary.totalPaid}</p>
          <p className="text-sm text-gray-500 mt-1">{mockPayments.length} payments made</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">This Year</span>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${mockPaymentSummary.paymentsThisYear * 80}</p>
          <p className="text-sm text-gray-500 mt-1">{mockPaymentSummary.paymentsThisYear} payment in 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Next Payment</span>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${mockPaymentSummary.nextPaymentAmount}</p>
          <p className="text-sm text-orange-600 mt-1">Due: {mockPaymentSummary.nextPaymentDate}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-blue-100">Monthly Total</span>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">$105</p>
          <p className="text-sm text-blue-100 mt-1">2 active enrollments</p>
        </div>
      </div>

      {/* Upcoming Payments Alert */}
      {mockUpcomingPayments.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertIcon size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900">Upcoming Payments Due</h3>
              <p className="text-sm text-orange-700 mt-1">
                You have {mockUpcomingPayments.length} payment(s) due on {mockPaymentSummary.nextPaymentDate}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {mockUpcomingPayments.map(payment => (
                  <div key={payment.id} className="bg-white rounded-xl p-3 border border-orange-200">
                    <p className="font-semibold text-gray-900">${payment.amount}</p>
                    <p className="text-xs text-gray-500">{payment.track}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-orange-700">{mockUpcomingPayments[0].daysLeft}</p>
              <p className="text-sm text-orange-600">days left</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-blue-900 mb-3">Payment Methods</h3>
        <p className="text-sm text-blue-700 mb-4">
          Pay your monthly fees using any of the following methods at your learning center:
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
            <span className="text-xl">📱</span>
            <span className="text-sm font-medium text-gray-700">Zaad / EVC Plus</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
            <span className="text-xl">🏦</span>
            <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
            <span className="text-xl">💵</span>
            <span className="text-sm font-medium text-gray-700">Cash at Center</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID or track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <option value="all">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <option value="all">All Tracks</option>
            {uniqueTracks.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Payment History</h3>
          <span className="text-sm text-gray-500">{filteredPayments.length} payments</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Payment ID</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Track</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm text-gray-900">{payment.id}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(payment.date)}</td>
                  <td className="px-5 py-4">
                    <span className="text-gray-900">{payment.track}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2">
                      <span>{getPaymentMethodIcon(payment.method)}</span>
                      <span className="text-gray-600">{payment.method}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900">${payment.amount}</span>
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(payment.status)}</td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Download size={16} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-gray-900">{payment.id}</p>
                  <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                </div>
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-gray-900 mb-2">{payment.track}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getPaymentMethodIcon(payment.method)}</span>
                  <span className="text-sm text-gray-600">{payment.method}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">${payment.amount}</span>
              </div>
              <button className="mt-3 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-200">
                <Download size={16} />
                Download Receipt
              </button>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No payments found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-2">Need Help with Payments?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you have questions about your payments or need assistance, please contact your learning center or our support team.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:support@tabsera.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Contact Support
          </a>
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Learning Center Info
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MyPayments;
