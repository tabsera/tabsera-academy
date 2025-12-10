import React, { useState } from 'react';
import {
  GraduationCap, Building2, Search, Bell, Settings, X, Check, AlertCircle,
  ArrowLeft, DollarSign, TrendingUp, Clock, Users, BookMarked, FileText,
  Download, Eye, BarChart3, CheckCircle2, AlertTriangle, Wallet, Menu,
  Monitor, UserCheck, Receipt, Percent, RefreshCw, Printer, CircleDollarSign,
  FileCheck, Send, Landmark, Phone, Copy, MapPin, LayoutDashboard, Briefcase
} from 'lucide-react';

export default function CenterSettlementDetails() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-01-08');
  const [isProcessing, setIsProcessing] = useState(false);

  const center = {
    id: 'aqoonyahan',
    name: 'Aqoonyahan School',
    location: 'Hargeisa, Somalia',
    flag: '🇸🇴',
    logo: 'AS',
    joinedDate: '2025-09-01',
    contactName: 'Ahmed Hassan',
    contactEmail: 'ahmed@aqoonyahan.edu.so',
    bankName: 'Dahabshiil Bank',
    bankAccount: '****4567',
    mobileMoneyProvider: 'Zaad',
    mobileMoneyNumber: '+252 63 XXX XXXX'
  };

  const contract = { tabseraShare: 50, centerShare: 50 };

  const currentSettlement = {
    id: 'STL-2026-001',
    period: 'January 2026',
    status: 'pending',
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-01-10',
    dueDate: '2026-01-15',
    grossRevenue: 4900,
    tabseraShare: 2450,
    centerShare: 2450,
    studentsEnrolled: 60,
    collectionRate: 87,
    collectedAmount: 4263,
    pendingAmount: 637,
    tracks: [
      { id: 'igcse-full', name: 'Cambridge IGCSE Full Program', students: 45, feePerStudent: 80, grossRevenue: 3600, tabseraShare: 1800, centerShare: 1800 },
      { id: 'islamic', name: 'ZAAD Academy Islamic Studies', students: 52, feePerStudent: 25, grossRevenue: 1300, tabseraShare: 650, centerShare: 650 }
    ],
    studentPayments: [
      { id: 1, name: 'Ahmed Hassan', track: 'IGCSE Full', fee: 80, paid: 80, status: 'paid', paidDate: '2026-01-03' },
      { id: 2, name: 'Fatima Omar', track: 'IGCSE Full', fee: 80, paid: 80, status: 'paid', paidDate: '2026-01-02' },
      { id: 3, name: 'Mohamed Ali', track: 'IGCSE Full', fee: 80, paid: 80, status: 'paid', paidDate: '2026-01-04' },
      { id: 4, name: 'Ibrahim Farah', track: 'IGCSE Full', fee: 80, paid: 0, status: 'pending', daysOverdue: 3 },
      { id: 5, name: 'Yusuf Ibrahim', track: 'IGCSE Full', fee: 80, paid: 0, status: 'pending', daysOverdue: 3 },
      { id: 6, name: 'Hassan Farah', track: 'Islamic Studies', fee: 25, paid: 25, status: 'paid', paidDate: '2026-01-03' },
      { id: 7, name: 'Omar Yusuf', track: 'Islamic Studies', fee: 25, paid: 0, status: 'pending', daysOverdue: 3 },
      { id: 8, name: 'Zahra Hassan', track: 'Islamic Studies', fee: 25, paid: 0, status: 'pending', daysOverdue: 3 },
    ]
  };

  const settlementHistory = [
    { id: 'STL-2025-012', period: 'December 2025', gross: 4750, tabsera: 2375, center: 2375, students: 58, status: 'paid', paidDate: '2025-12-18', method: 'Bank Transfer', reference: 'TXN-78901234' },
    { id: 'STL-2025-011', period: 'November 2025', gross: 4600, tabsera: 2300, center: 2300, students: 56, status: 'paid', paidDate: '2025-11-17', method: 'Bank Transfer', reference: 'TXN-67890123' },
    { id: 'STL-2025-010', period: 'October 2025', gross: 4200, tabsera: 2100, center: 2100, students: 52, status: 'paid', paidDate: '2025-10-16', method: 'Zaad', reference: 'ZAAD-56789012' },
  ];

  const lifetimeStats = { totalSettlements: 5, totalGross: 22250, totalTabsera: 11125, avgMonthly: 4450 };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date('2026-01-08');
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={14} />Paid</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={14} />Pending</span>;
    return null;
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowProcessModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Settlement Details</h1>
              <p className="text-sm text-gray-500">{center.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              <Building2 size={16} />Center Profile
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              <FileText size={16} />View Contract
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Center Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {center.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{center.name}</h2>
                  <span className="text-2xl">{center.flag}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
                </div>
                <p className="text-gray-500 flex items-center gap-1"><MapPin size={14} />{center.location}</p>
                <p className="text-sm text-gray-400">Partner since {new Date(center.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center min-w-[120px]">
                <p className="text-2xl font-bold text-blue-600">{contract.tabseraShare}%:{contract.centerShare}%</p>
                <p className="text-xs text-blue-600">Revenue Share</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center min-w-[120px]">
                <p className="text-2xl font-bold text-green-600">${lifetimeStats.totalTabsera.toLocaleString()}</p>
                <p className="text-xs text-green-600">Lifetime Revenue</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center min-w-[120px]">
                <p className="text-2xl font-bold text-purple-600">{lifetimeStats.totalSettlements}</p>
                <p className="text-xs text-purple-600">Settlements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('current')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'current' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Current Settlement
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Settlement History
          </button>
          <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'students' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Student Payments
          </button>
        </div>

        {/* Current Settlement Tab */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {/* Status Alert */}
            <div className="rounded-2xl p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-100">
                    <Clock size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">{currentSettlement.period} Settlement</h3>
                      {getStatusBadge(currentSettlement.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Invoice #{currentSettlement.invoiceNumber} • Due: {new Date(currentSettlement.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />{getDaysUntilDue(currentSettlement.dueDate)} days remaining
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowInvoiceModal(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2">
                    <FileText size={16} />View Invoice
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2">
                    <Send size={16} />Send Reminder
                  </button>
                  <button onClick={() => setShowProcessModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 flex items-center gap-2">
                    <CheckCircle2 size={16} />Mark as Paid
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Revenue Breakdown</h3>
                </div>
                <div className="p-5">
                  {/* Summary Row */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-gray-900">${currentSettlement.grossRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Gross Revenue</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600">${currentSettlement.tabseraShare.toLocaleString()}</p>
                      <p className="text-xs text-green-600">TABSERA ({contract.tabseraShare}%)</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-purple-600">${currentSettlement.centerShare.toLocaleString()}</p>
                      <p className="text-xs text-purple-600">Center ({contract.centerShare}%)</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-blue-600">{currentSettlement.studentsEnrolled}</p>
                      <p className="text-xs text-blue-600">Students</p>
                    </div>
                  </div>

                  {/* Track Breakdown Table */}
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 rounded-l-lg">Program</th>
                        <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-3">Students</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">Fee</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">Gross</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">TABSERA</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3 rounded-r-lg">Center</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentSettlement.tracks.map((track) => (
                        <tr key={track.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{track.name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{track.students}</td>
                          <td className="px-4 py-3 text-right text-gray-600">${track.feePerStudent}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">${track.grossRevenue.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">${track.tabseraShare.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-medium text-purple-600">${track.centerShare.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-900 rounded-l-lg">Total</td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900">{currentSettlement.studentsEnrolled}</td>
                        <td className="px-4 py-3 text-right text-gray-400">-</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">${currentSettlement.grossRevenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">${currentSettlement.tabseraShare.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-purple-600 rounded-r-lg">${currentSettlement.centerShare.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Collection Status */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Collection Status</h3>
                  </div>
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${currentSettlement.collectionRate * 3.52} 352`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">{currentSettlement.collectionRate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm text-green-700">Collected</span>
                        <span className="font-bold text-green-700">${currentSettlement.collectedAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                        <span className="text-sm text-orange-700">Pending</span>
                        <span className="font-bold text-orange-700">${currentSettlement.pendingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Payment Information</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Bank Account</p>
                      <p className="font-medium text-gray-900">{center.bankName} • {center.bankAccount}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Mobile Money</p>
                      <p className="font-medium text-gray-900">{center.mobileMoneyProvider} • {center.mobileMoneyNumber}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="font-medium text-gray-900">{center.contactName}</p>
                      <p className="text-sm text-gray-500">{center.contactEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settlement History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Settlement History</h3>
                <p className="text-sm text-gray-500">{settlementHistory.length} past settlements</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
                <Download size={16} />Export All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Period</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Gross</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">TABSERA</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Center</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Students</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Payment</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {settlementHistory.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{settlement.period}</p>
                        <p className="text-xs text-gray-500">{settlement.id}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">${settlement.gross.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-medium text-green-600">${settlement.tabsera.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-medium text-purple-600">${settlement.center.toLocaleString()}</td>
                      <td className="px-5 py-4 text-center text-gray-600">{settlement.students}</td>
                      <td className="px-5 py-4 text-center">{getStatusBadge(settlement.status)}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-900">{settlement.method}</p>
                        <p className="text-xs text-gray-500">{new Date(settlement.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FileText size={18} /></button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Download size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Lifetime totals from {settlementHistory.length + 1} settlements</span>
                <div className="flex items-center gap-8">
                  <div><span className="text-sm text-gray-500">Total Gross:</span><span className="ml-2 font-bold text-gray-900">${lifetimeStats.totalGross.toLocaleString()}</span></div>
                  <div><span className="text-sm text-gray-500">Total TABSERA:</span><span className="ml-2 font-bold text-green-600">${lifetimeStats.totalTabsera.toLocaleString()}</span></div>
                  <div><span className="text-sm text-gray-500">Avg Monthly:</span><span className="ml-2 font-bold text-blue-600">${lifetimeStats.avgMonthly.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Payments Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Student Payments - {currentSettlement.period}</h3>
                <p className="text-sm text-gray-500">{currentSettlement.studentPayments.filter(s => s.status === 'paid').length} of {currentSettlement.studentPayments.length} students paid</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                  <Search size={16} className="text-gray-400" />
                  <input type="text" placeholder="Search student..." className="bg-transparent border-none outline-none text-sm w-40" />
                </div>
                <select className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium border-none outline-none cursor-pointer">
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Program</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Fee</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Paid</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentSettlement.studentPayments.map((student) => (
                    <tr key={student.id} className={`hover:bg-gray-50 ${student.status === 'pending' ? 'bg-orange-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${student.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${student.track === 'IGCSE Full' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {student.track}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">${student.fee}</td>
                      <td className="px-5 py-4 text-right font-medium text-green-600">${student.paid}</td>
                      <td className="px-5 py-4 text-center">
                        {student.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />Paid</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"><Clock size={12} />Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {student.paidDate || (student.daysOverdue ? <span className="text-red-500">{student.daysOverdue} days overdue</span> : '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-gray-500">{currentSettlement.studentPayments.length} students enrolled</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span><span className="text-sm text-gray-600">{currentSettlement.studentPayments.filter(s => s.status === 'paid').length} Paid</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded-full"></span><span className="text-sm text-gray-600">{currentSettlement.studentPayments.filter(s => s.status === 'pending').length} Pending</span></div>
                  <div><span className="text-sm text-gray-500">Collected:</span><span className="ml-2 font-bold text-green-600">${currentSettlement.collectedAmount.toLocaleString()}</span></div>
                  <div><span className="text-sm text-gray-500">Pending:</span><span className="ml-2 font-bold text-orange-600">${currentSettlement.pendingAmount.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Process Payment Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProcessModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Record Settlement Payment</h3>
              <p className="text-sm text-gray-500">{center.name} - {currentSettlement.period}</p>
            </div>
            <div className="p-6">
              <div className="p-4 bg-green-50 rounded-xl mb-6 text-center">
                <p className="text-sm text-green-600">Settlement Amount</p>
                <p className="text-3xl font-bold text-green-700">${currentSettlement.tabseraShare.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Invoice #{currentSettlement.invoiceNumber}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['bank', 'zaad', 'check'].map(method => (
                    <button key={method} onClick={() => setPaymentMethod(method)} className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      {method === 'bank' && <Landmark size={20} className={`mx-auto mb-1 ${paymentMethod === method ? 'text-blue-600' : 'text-gray-400'}`} />}
                      {method === 'zaad' && <Phone size={20} className={`mx-auto mb-1 ${paymentMethod === method ? 'text-blue-600' : 'text-gray-400'}`} />}
                      {method === 'check' && <FileCheck size={20} className={`mx-auto mb-1 ${paymentMethod === method ? 'text-blue-600' : 'text-gray-400'}`} />}
                      <span className="text-xs font-medium capitalize">{method === 'zaad' ? 'Zaad/EVC' : method}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Number</label>
                <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="e.g., TXN-12345678" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Date</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowProcessModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
                <button onClick={handleProcessPayment} disabled={isProcessing || !paymentReference} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
                  {isProcessing ? <><RefreshCw size={18} className="animate-spin" />Processing...</> : <><CheckCircle2 size={18} />Confirm Payment</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInvoiceModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div>
                <p className="text-blue-100 text-sm">Invoice</p>
                <h3 className="text-xl font-bold">{currentSettlement.invoiceNumber}</h3>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg"><GraduationCap size={20} className="text-white" /></div>
                        <span className="font-bold text-gray-900">TABSERA Academy</span>
                      </div>
                      <p className="text-sm text-gray-500">Educational Technology Solutions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">INVOICE</p>
                      <p className="text-sm text-gray-500 mt-1">{currentSettlement.invoiceNumber}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill To</p>
                      <p className="font-semibold text-gray-900">{center.name}</p>
                      <p className="text-sm text-gray-500">{center.location}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Period</p>
                      <p className="font-semibold text-gray-900">{currentSettlement.period}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3">Description</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase pb-3">Gross</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase pb-3">TABSERA ({contract.tabseraShare}%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentSettlement.tracks.map((track, idx) => (
                        <tr key={idx}>
                          <td className="py-3"><p className="font-medium text-gray-900">{track.name}</p><p className="text-xs text-gray-500">{track.students} students</p></td>
                          <td className="py-3 text-right text-gray-600">${track.grossRevenue.toLocaleString()}</td>
                          <td className="py-3 text-right font-medium text-gray-900">${track.tabseraShare.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Gross Revenue</span><span className="text-gray-900">${currentSettlement.grossRevenue.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Center Share ({contract.centerShare}%)</span><span className="text-purple-600">-${currentSettlement.centerShare.toLocaleString()}</span></div>
                      <div className="flex justify-between pt-2 border-t-2 border-gray-300"><span className="font-bold text-gray-900">Amount Due</span><span className="font-bold text-xl text-blue-600">${currentSettlement.tabseraShare.toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 border-t border-yellow-200 flex items-center gap-3">
                  <Clock size={20} className="text-yellow-600" />
                  <div><p className="font-medium text-yellow-800">Payment Pending</p><p className="text-sm text-yellow-600">Due: {new Date(currentSettlement.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Close</button>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"><Printer size={16} />Print</button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"><Download size={16} />Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
