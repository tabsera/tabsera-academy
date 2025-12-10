import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, Clock,
  Users, FileText, Download,
  CheckCircle2, AlertTriangle, Wallet,
  Banknote, Info, Percent
} from 'lucide-react';

const RevenueDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showContractDetails, setShowContractDetails] = useState(false);

  const contract = {
    tabseraShare: 50,
    centerShare: 50,
    settlementFrequency: 'monthly',
    settlementDueDay: 15,
    currency: 'USD',
    contractStart: '2025-01-01',
    contractEnd: '2027-12-31',
    status: 'active'
  };

  const currentMonth = {
    month: 'January 2026',
    grossRevenue: 4900,
    tabseraShare: 2450,
    centerShare: 2450,
    collectedAmount: 4260,
    pendingAmount: 640,
    collectionRate: 87,
    studentsEnrolled: 60,
    studentsPaid: 52,
    studentsPending: 8
  };

  const revenueByTrack = [
    { id: 'igcse-full', name: 'Cambridge IGCSE Full Program', icon: '🎓', students: 45, feePerStudent: 80, grossRevenue: 3600, collected: 3200, pending: 400, tabseraShare: 1800, centerShare: 1800, color: 'blue' },
    { id: 'islamic-studies', name: 'ZAAD Academy Islamic Studies', icon: '🕌', students: 52, feePerStudent: 25, grossRevenue: 1300, collected: 1060, pending: 240, tabseraShare: 650, centerShare: 650, color: 'emerald' },
  ];

  const monthlyHistory = [
    { month: 'Jan 2026', gross: 4900, tabsera: 2450, center: 2450, collected: 4260, status: 'pending', settlementStatus: 'awaiting' },
    { month: 'Dec 2025', gross: 4750, tabsera: 2375, center: 2375, collected: 4750, status: 'settled', settlementStatus: 'paid', paidDate: 'Dec 18, 2025' },
    { month: 'Nov 2025', gross: 4600, tabsera: 2300, center: 2300, collected: 4600, status: 'settled', settlementStatus: 'paid', paidDate: 'Nov 17, 2025' },
    { month: 'Oct 2025', gross: 4200, tabsera: 2100, center: 2100, collected: 4200, status: 'settled', settlementStatus: 'paid', paidDate: 'Oct 16, 2025' },
  ];

  const pendingStudents = [
    { id: 1, name: 'Yusuf Ibrahim', track: 'IGCSE Full', amount: 80, dueDate: 'Jan 5, 2026', daysOverdue: 3 },
    { id: 2, name: 'Halima Ahmed', track: 'IGCSE Full', amount: 80, dueDate: 'Jan 5, 2026', daysOverdue: 3 },
    { id: 3, name: 'Omar Yusuf', track: 'IGCSE Full', amount: 80, dueDate: 'Jan 5, 2026', daysOverdue: 3 },
    { id: 4, name: 'Amina Hassan', track: 'Islamic Studies', amount: 25, dueDate: 'Jan 5, 2026', daysOverdue: 3 },
  ];

  const yearlyStats = {
    totalGross: 56550,
    totalTabsera: 28275,
    totalCenter: 28275,
    avgMonthly: 4712.50,
    growth: 12.5
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />Paid</span>;
      case 'awaiting':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} />Awaiting</span>;
      case 'overdue':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><AlertTriangle size={12} />Overdue</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-500">Track your earnings and settlements</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium border-none outline-none cursor-pointer">
            <option value="current">Current Month</option>
            <option value="last">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            <Download size={16} />Export
          </button>
        </div>
      </div>

      {/* Partnership Agreement Card */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} />
              <h2 className="font-bold text-lg">Your Partnership Agreement</h2>
            </div>
            <p className="text-blue-100 text-sm">Revenue sharing terms with TABSERA Academy</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <p className="text-3xl font-bold">{contract.tabseraShare}%</p>
              <p className="text-xs text-blue-100">TABSERA Share</p>
            </div>
            <div className="text-2xl font-light">:</div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <p className="text-3xl font-bold">{contract.centerShare}%</p>
              <p className="text-xs text-blue-100">Your Share</p>
            </div>
            <button onClick={() => setShowContractDetails(!showContractDetails)} className="ml-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>
        {showContractDetails && (
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-xs text-blue-200">Settlement</p><p className="font-semibold">{contract.settlementFrequency === 'monthly' ? 'Monthly' : 'Quarterly'}</p></div>
            <div><p className="text-xs text-blue-200">Due Day</p><p className="font-semibold">{contract.settlementDueDay}th of month</p></div>
            <div><p className="text-xs text-blue-200">Currency</p><p className="font-semibold">{contract.currency}</p></div>
            <div><p className="text-xs text-blue-200">Contract Until</p><p className="font-semibold">{new Date(contract.contractEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p></div>
          </div>
        )}
      </div>

      {/* Current Month Overview */}
      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Gross Revenue</span>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><DollarSign size={20} className="text-blue-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${currentMonth.grossRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{currentMonth.month}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Your Share ({contract.centerShare}%)</span>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Wallet size={20} className="text-green-600" /></div>
          </div>
          <p className="text-3xl font-bold text-green-600">${currentMonth.centerShare.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-green-600"><TrendingUp size={14} />+8.5% from last month</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">TABSERA Share ({contract.tabseraShare}%)</span>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Banknote size={20} className="text-purple-600" /></div>
          </div>
          <p className="text-3xl font-bold text-purple-600">${currentMonth.tabseraShare.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Due: Jan 15, 2026</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Collection Rate</span>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Percent size={20} className="text-orange-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{currentMonth.collectionRate}%</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-green-600">{currentMonth.studentsPaid} paid</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-orange-600">{currentMonth.studentsPending} pending</span>
          </div>
        </div>
      </div>

      {/* Revenue by Track */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Revenue by Track</h3>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {revenueByTrack.map(track => (
              <div key={track.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{track.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{track.name}</p>
                      <p className="text-sm text-gray-500">{track.students} students × ${track.feePerStudent}/month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${track.grossRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">gross revenue</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Collected</p>
                    <p className="font-semibold text-green-600">${track.collected.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="font-semibold text-orange-600">${track.pending.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Your Share</p>
                    <p className="font-semibold text-blue-600">${track.centerShare.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settlement History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Settlement History</h3>
            <Link to="/center/settlements" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {monthlyHistory.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.month}</p>
                  <p className="text-sm text-gray-500">Gross: ${item.gross.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${item.center.toLocaleString()}</p>
                  {getStatusBadge(item.settlementStatus)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Pending Payments</h3>
            <Link to="/center/fees" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingStudents.map(student => (
              <div key={student.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.track}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">${student.amount}</p>
                  <p className="text-xs text-red-500">{student.daysOverdue} days overdue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Year to Date Summary */}
      <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4">Year to Date Summary (2025)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-400">Total Gross</p>
            <p className="text-2xl font-bold">${yearlyStats.totalGross.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Your Earnings</p>
            <p className="text-2xl font-bold text-green-400">${yearlyStats.totalCenter.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">TABSERA Share</p>
            <p className="text-2xl font-bold text-purple-400">${yearlyStats.totalTabsera.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Monthly Avg</p>
            <p className="text-2xl font-bold">${yearlyStats.avgMonthly.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">YoY Growth</p>
            <p className="text-2xl font-bold text-cyan-400">+{yearlyStats.growth}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
