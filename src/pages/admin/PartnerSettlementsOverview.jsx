import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Search, DollarSign, Users, Clock, CheckCircle2,
  AlertTriangle, Send, Download, Eye, Calendar, TrendingUp
} from 'lucide-react';

const PartnerSettlementsOverview = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const period = { month: 'January 2026', dueDate: 'January 15, 2026' };

  const stats = {
    activePartners: 6,
    grossRevenue: 28550,
    tabseraRevenue: 13175,
    collected: 3350,
    pending: 9825
  };

  const settlements = [
    { id: 'aqoonyahan', name: 'Aqoonyahan School', location: 'Hargeisa', flag: '🇸🇴', logo: 'AS', share: '50/50', gross: 4900, tabsera: 2450, students: 60, collection: 87, status: 'pending', daysLeft: 7 },
    { id: 'sunrise', name: 'Sunrise International', location: 'Nairobi', flag: '🇰🇪', logo: 'SI', share: '40/60', gross: 8050, tabsera: 3220, students: 120, collection: 95, status: 'paid', paidDate: 'Jan 12' },
    { id: 'alnoor', name: 'Al-Noor Academy', location: 'Mogadishu', flag: '🇸🇴', logo: 'AN', share: '50/50', gross: 3825, tabsera: 1912, students: 45, collection: 92, status: 'pending', daysLeft: 7 },
    { id: 'excel', name: 'Excel Academy', location: 'Addis Ababa', flag: '🇪🇹', logo: 'EA', share: '45/55', gross: 5525, tabsera: 2486, students: 85, collection: 88, status: 'pending', daysLeft: 7 },
    { id: 'kampala', name: 'Kampala IGCSE Center', location: 'Kampala', flag: '🇺🇬', logo: 'KC', share: '50/50', gross: 4550, tabsera: 2275, students: 70, collection: 100, status: 'paid', paidDate: 'Jan 14' },
    { id: 'hidaya', name: 'Hidaya Learning Center', location: 'Mombasa', flag: '🇰🇪', logo: 'HL', share: '55/45', gross: 2975, tabsera: 1636, students: 35, collection: 82, status: 'pending', daysLeft: 7 },
  ];

  const filteredSettlements = settlements.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status, info) => {
    if (status === 'paid') return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />Paid {info}</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} />{info} days left</span>;
    return null;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Settlement Period: {period.month}</h1>
            <p className="text-blue-100">Due Date: {period.dueDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
              <p className="text-2xl font-bold">{settlements.filter(s => s.status === 'pending').length}</p>
              <p className="text-xs text-blue-100">Pending</p>
            </div>
            <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
              <p className="text-2xl font-bold">{settlements.filter(s => s.status === 'paid').length}</p>
              <p className="text-xs text-blue-100">Paid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Partners</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activePartners}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Gross Revenue</p>
          <p className="text-2xl font-bold text-gray-900">${stats.grossRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">TABSERA Revenue</p>
          <p className="text-2xl font-bold text-blue-600">${stats.tabseraRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold text-green-600">${stats.collected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">${stats.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search center..." className="bg-transparent border-none outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
            <Download size={16} />Export
          </button>
          <Link to="/admin/settlements/process" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2">
            Process Settlements
          </Link>
        </div>
      </div>

      {/* Settlement Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredSettlements.map((s) => (
          <div key={s.id} className={`bg-white rounded-2xl border-2 p-5 transition-all hover:shadow-lg ${s.status === 'paid' ? 'border-green-100' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${s.status === 'paid' ? 'bg-green-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                  {s.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    <span>{s.flag}</span>
                  </div>
                  <p className="text-sm text-gray-500">{s.location} • {s.share}</p>
                </div>
              </div>
              {getStatusBadge(s.status, s.status === 'paid' ? s.paidDate : s.daysLeft)}
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">${s.gross.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Gross</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">${s.tabsera.toLocaleString()}</p>
                <p className="text-xs text-green-600">TABSERA</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{s.students}</p>
                <p className="text-xs text-blue-600">Students</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{s.collection}%</p>
                <p className="text-xs text-purple-600">Collected</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/admin/settlements/${s.id}`} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1">
                <Eye size={16} />View Details
              </Link>
              {s.status === 'pending' ? (
                <button className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} />Mark Paid
                </button>
              ) : (
                <button className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center justify-center gap-1">
                  <Download size={16} />Receipt
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerSettlementsOverview;
