import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Clock, CheckCircle2, AlertTriangle,
  Calendar, Eye, Printer, X, FileText, Percent
} from 'lucide-react';

const SettlementHistory = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const contract = {
    tabseraShare: 50,
    centerShare: 50,
    settlementFrequency: 'monthly',
    settlementDueDay: 15,
    currency: 'USD'
  };

  const summaryStats = {
    totalSettled: 9075,
    totalPending: 2450,
    settlementsCompleted: 3,
    currentMonth: 'January 2026'
  };

  const settlements = [
    {
      id: 'STL-2026-001',
      period: 'January 2026',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
      grossRevenue: 4900,
      tabseraShare: 2450,
      centerShare: 2450,
      collected: 4260,
      pending: 640,
      status: 'pending',
      dueDate: '2026-01-15',
      paidDate: null,
      invoiceNumber: 'INV-2026-001',
      students: 60
    },
    {
      id: 'STL-2025-012',
      period: 'December 2025',
      periodStart: '2025-12-01',
      periodEnd: '2025-12-31',
      grossRevenue: 4750,
      tabseraShare: 2375,
      centerShare: 2375,
      collected: 4750,
      pending: 0,
      status: 'paid',
      dueDate: '2025-12-15',
      paidDate: '2025-12-18',
      invoiceNumber: 'INV-2025-012',
      paymentMethod: 'Bank Transfer',
      paymentRef: 'TRF-2025-1218-001',
      students: 58
    },
    {
      id: 'STL-2025-011',
      period: 'November 2025',
      periodStart: '2025-11-01',
      periodEnd: '2025-11-30',
      grossRevenue: 4600,
      tabseraShare: 2300,
      centerShare: 2300,
      collected: 4600,
      pending: 0,
      status: 'paid',
      dueDate: '2025-11-15',
      paidDate: '2025-11-17',
      invoiceNumber: 'INV-2025-011',
      paymentMethod: 'Zaad',
      paymentRef: 'ZAAD-2025-1117-042',
      students: 55
    },
    {
      id: 'STL-2025-010',
      period: 'October 2025',
      periodStart: '2025-10-01',
      periodEnd: '2025-10-31',
      grossRevenue: 4200,
      tabseraShare: 2100,
      centerShare: 2100,
      collected: 4200,
      pending: 0,
      status: 'paid',
      dueDate: '2025-10-15',
      paidDate: '2025-10-16',
      invoiceNumber: 'INV-2025-010',
      paymentMethod: 'Bank Transfer',
      paymentRef: 'TRF-2025-1016-003',
      students: 52
    }
  ];

  const filteredSettlements = settlements.filter(s => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settlement History</h1>
          <p className="text-gray-500">View all settlements with TABSERA Academy</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium border-none outline-none cursor-pointer">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium border-none outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            <Download size={16} />Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Settled</span>
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">${summaryStats.totalSettled.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{summaryStats.settlementsCompleted} settlements completed</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending Settlement</span>
            <Clock size={18} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">${summaryStats.totalPending.toLocaleString()}</p>
          <p className="text-xs text-yellow-600 mt-1">{summaryStats.currentMonth}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Revenue Share</span>
            <Percent size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{contract.tabseraShare}% : {contract.centerShare}%</p>
          <p className="text-xs text-gray-500 mt-1">TABSERA : Your Share</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Settlement Due</span>
            <Calendar size={18} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{contract.settlementDueDay}th</p>
          <p className="text-xs text-gray-500 mt-1">of each month</p>
        </div>
      </div>

      {/* Upcoming Settlement Alert */}
      {settlements.find(s => s.status === 'pending') && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-5 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg">Upcoming Settlement Due</p>
              <p className="text-blue-100">January 2026 settlement is due on January 15th</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold">$2,450</p>
                <p className="text-sm text-blue-100">Amount Due</p>
              </div>
              <button className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settlements Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">All Settlements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Period</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Gross Revenue</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Your Share</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Payment Date</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSettlements.map(settlement => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{settlement.period}</p>
                    <p className="text-sm text-gray-500">{settlement.invoiceNumber}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">${settlement.grossRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{settlement.students} students</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-green-600">${settlement.centerShare.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{contract.centerShare}% share</p>
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(settlement.status)}</td>
                  <td className="px-5 py-4">
                    {settlement.paidDate ? (
                      <p className="text-sm text-gray-900">{new Date(settlement.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    ) : (
                      <p className="text-sm text-yellow-600">Due: {new Date(settlement.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setSelectedSettlement(settlement); setShowSettlementModal(true); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Printer size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Details Modal */}
      {showSettlementModal && selectedSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettlementModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Settlement Details</h3>
              <button onClick={() => setShowSettlementModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{selectedSettlement.period}</p>
                  <p className="text-gray-500">{selectedSettlement.invoiceNumber}</p>
                </div>
                {getStatusBadge(selectedSettlement.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Gross Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${selectedSettlement.grossRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Your Share ({contract.centerShare}%)</p>
                  <p className="text-2xl font-bold text-green-600">${selectedSettlement.centerShare.toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Settlement Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Period:</span> <span className="font-medium">{selectedSettlement.period}</span></div>
                  <div><span className="text-gray-500">Students:</span> <span className="font-medium">{selectedSettlement.students}</span></div>
                  <div><span className="text-gray-500">TABSERA Share:</span> <span className="font-medium">${selectedSettlement.tabseraShare.toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Due Date:</span> <span className="font-medium">{new Date(selectedSettlement.dueDate).toLocaleDateString()}</span></div>
                  {selectedSettlement.paidDate && (
                    <>
                      <div><span className="text-gray-500">Paid Date:</span> <span className="font-medium text-green-600">{new Date(selectedSettlement.paidDate).toLocaleDateString()}</span></div>
                      <div><span className="text-gray-500">Payment Method:</span> <span className="font-medium">{selectedSettlement.paymentMethod}</span></div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                  <FileText size={18} />
                  View Invoice
                </button>
                <button className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center gap-2">
                  <Printer size={18} />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementHistory;
