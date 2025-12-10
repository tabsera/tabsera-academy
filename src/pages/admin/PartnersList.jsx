import React, { useState } from 'react';
import {
  GraduationCap, Building2, Search, Bell, Settings, X, Check, AlertCircle,
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Clock, Users, FileText,
  Download, Eye, BarChart3, CheckCircle2, AlertTriangle, Menu, Receipt,
  Percent, RefreshCw, Printer, CircleDollarSign, FileCheck, Send, Landmark,
  Phone, Copy, MapPin, LayoutDashboard, Briefcase, ChevronRight, Calendar,
  Mail, CreditCard, Plus, Filter, MoreVertical, Edit2, Trash2, ExternalLink,
  Globe, Star, PauseCircle, PlayCircle, ChevronDown, ArrowUpRight, UserPlus
} from 'lucide-react';

export default function PartnersList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Summary Stats
  const stats = {
    totalPartners: 8,
    activePartners: 6,
    pendingPartners: 1,
    suspendedPartners: 1,
    totalStudents: 510,
    totalRevenue: 28550,
    avgRevenueShare: 48.5,
    countries: 5
  };

  // Partners Data
  const partners = [
    {
      id: 'aqoonyahan',
      name: 'Aqoonyahan School',
      location: 'Hargeisa, Somalia',
      country: 'Somalia',
      flag: '🇸🇴',
      logo: 'AS',
      status: 'active',
      featured: true,
      joinedDate: '2025-09-01',
      contractEnd: '2027-08-31',
      tabseraShare: 50,
      centerShare: 50,
      students: 60,
      monthlyRevenue: 4900,
      lifetimeRevenue: 22250,
      programs: ['IGCSE Full', 'Islamic Studies'],
      rating: 4.8,
      contactName: 'Ahmed Hassan',
      contactEmail: 'ahmed@aqoonyahan.edu.so',
      contactPhone: '+252 61 123 4567',
      settlementStatus: 'pending',
      lastSettlement: '2025-12-18'
    },
    {
      id: 'sunrise',
      name: 'Sunrise International School',
      location: 'Nairobi, Kenya',
      country: 'Kenya',
      flag: '🇰🇪',
      logo: 'SI',
      status: 'active',
      featured: true,
      joinedDate: '2025-06-01',
      contractEnd: '2027-05-31',
      tabseraShare: 40,
      centerShare: 60,
      students: 120,
      monthlyRevenue: 8050,
      lifetimeRevenue: 56350,
      programs: ['IGCSE Full', 'Business Track', 'ESL Intensive'],
      rating: 4.9,
      contactName: 'Jane Wanjiku',
      contactEmail: 'jane@sunrise.ac.ke',
      contactPhone: '+254 72 123 4567',
      settlementStatus: 'paid',
      lastSettlement: '2026-01-12'
    },
    {
      id: 'alnoor',
      name: 'Al-Noor Academy',
      location: 'Mogadishu, Somalia',
      country: 'Somalia',
      flag: '🇸🇴',
      logo: 'AN',
      status: 'active',
      featured: false,
      joinedDate: '2025-08-01',
      contractEnd: '2027-07-31',
      tabseraShare: 50,
      centerShare: 50,
      students: 45,
      monthlyRevenue: 3825,
      lifetimeRevenue: 19125,
      programs: ['IGCSE Full', 'Islamic Studies'],
      rating: 4.6,
      contactName: 'Mohamed Ali',
      contactEmail: 'mohamed@alnoor.edu.so',
      contactPhone: '+252 61 234 5678',
      settlementStatus: 'pending',
      lastSettlement: '2025-12-17'
    },
    {
      id: 'excel',
      name: 'Excel Academy',
      location: 'Addis Ababa, Ethiopia',
      country: 'Ethiopia',
      flag: '🇪🇹',
      logo: 'EA',
      status: 'active',
      featured: false,
      joinedDate: '2025-07-01',
      contractEnd: '2027-06-30',
      tabseraShare: 45,
      centerShare: 55,
      students: 85,
      monthlyRevenue: 5525,
      lifetimeRevenue: 33150,
      programs: ['IGCSE Full', 'Science Track', 'Islamic Studies'],
      rating: 4.5,
      contactName: 'Alemayehu Bekele',
      contactEmail: 'alemayehu@excel.edu.et',
      contactPhone: '+251 91 234 5678',
      settlementStatus: 'pending',
      lastSettlement: '2025-12-16'
    },
    {
      id: 'kampala',
      name: 'Kampala IGCSE Center',
      location: 'Kampala, Uganda',
      country: 'Uganda',
      flag: '🇺🇬',
      logo: 'KC',
      status: 'active',
      featured: false,
      joinedDate: '2025-05-01',
      contractEnd: '2027-04-30',
      tabseraShare: 50,
      centerShare: 50,
      students: 70,
      monthlyRevenue: 4550,
      lifetimeRevenue: 36400,
      programs: ['IGCSE Full', 'ESL Intensive'],
      rating: 4.6,
      contactName: 'Sarah Namubiru',
      contactEmail: 'sarah@kampalaic.ug',
      contactPhone: '+256 70 123 4567',
      settlementStatus: 'paid',
      lastSettlement: '2026-01-14'
    },
    {
      id: 'hidaya',
      name: 'Hidaya Learning Center',
      location: 'Mombasa, Kenya',
      country: 'Kenya',
      flag: '🇰🇪',
      logo: 'HL',
      status: 'active',
      featured: false,
      joinedDate: '2025-10-01',
      contractEnd: '2027-09-30',
      tabseraShare: 55,
      centerShare: 45,
      students: 35,
      monthlyRevenue: 2975,
      lifetimeRevenue: 8925,
      programs: ['IGCSE Full', 'Islamic Studies', 'ESL Intensive'],
      rating: 4.7,
      contactName: 'Fatima Hassan',
      contactEmail: 'fatima@hidaya.ke',
      contactPhone: '+254 72 345 6789',
      settlementStatus: 'pending',
      lastSettlement: '2025-12-15'
    },
    {
      id: 'bosaso',
      name: 'Bosaso Academy',
      location: 'Bosaso, Somalia',
      country: 'Somalia',
      flag: '🇸🇴',
      logo: 'BA',
      status: 'pending',
      featured: false,
      joinedDate: '2025-12-15',
      contractEnd: '2027-12-14',
      tabseraShare: 50,
      centerShare: 50,
      students: 40,
      monthlyRevenue: 0,
      lifetimeRevenue: 0,
      programs: ['IGCSE Full', 'Islamic Studies'],
      rating: 4.4,
      contactName: 'Abdi Omar',
      contactEmail: 'abdi@bosaso.edu.so',
      contactPhone: '+252 61 567 8901',
      settlementStatus: 'none',
      lastSettlement: null
    },
    {
      id: 'dares',
      name: 'Dar es Salaam Islamic School',
      location: 'Dar es Salaam, Tanzania',
      country: 'Tanzania',
      flag: '🇹🇿',
      logo: 'DI',
      status: 'suspended',
      featured: false,
      joinedDate: '2025-04-01',
      contractEnd: '2027-03-31',
      tabseraShare: 50,
      centerShare: 50,
      students: 55,
      monthlyRevenue: 0,
      lifetimeRevenue: 27500,
      programs: ['IGCSE Full', 'Islamic Studies'],
      rating: 4.7,
      contactName: 'Hassan Juma',
      contactEmail: 'hassan@daresislamic.tz',
      contactPhone: '+255 71 234 5678',
      settlementStatus: 'overdue',
      lastSettlement: '2025-10-15',
      suspendedReason: 'Payment overdue - 3 months'
    },
  ];

  const countries = ['all', 'Somalia', 'Kenya', 'Ethiopia', 'Uganda', 'Tanzania'];

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          partner.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          partner.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;
    const matchesCountry = filterCountry === 'all' || partner.country === filterCountry;
    return matchesSearch && matchesStatus && matchesCountry;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'students') return b.students - a.students;
    if (sortBy === 'revenue') return b.monthlyRevenue - a.monthlyRevenue;
    if (sortBy === 'joined') return new Date(b.joinedDate) - new Date(a.joinedDate);
    return 0;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />Active</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} />Pending</span>;
      case 'suspended':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><PauseCircle size={12} />Suspended</span>;
      default:
        return null;
    }
  };

  const getSettlementBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="text-xs text-green-600 font-medium">✓ Paid</span>;
      case 'pending':
        return <span className="text-xs text-yellow-600 font-medium">⏳ Pending</span>;
      case 'overdue':
        return <span className="text-xs text-red-600 font-medium">⚠ Overdue</span>;
      default:
        return <span className="text-xs text-gray-400">-</span>;
    }
  };

  const openPartnerDetails = (partner) => {
    setSelectedPartner(partner);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 block leading-none">TABSERA</span>
                <span className="text-xs text-gray-400">ADMIN PORTAL</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              <Plus size={18} />Add Partner
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Partner Learning Centers</h1>
          <p className="text-gray-500">Manage all affiliated learning centers and partnerships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Partners</span>
              <Building2 size={18} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPartners}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-green-600">{stats.activePartners} active</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-yellow-600">{stats.pendingPartners} pending</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Students</span>
              <Users size={18} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            <p className="text-xs text-gray-500 mt-1">Across all centers</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Monthly Revenue</span>
              <DollarSign size={18} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <TrendingUp size={12} />+12.5% from last month
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Countries</span>
              <Globe size={18} className="text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.countries}</p>
            <p className="text-xs text-gray-500 mt-1">East Africa region</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl flex-1 lg:flex-none lg:w-72">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, location, or contact..."
                  className="bg-transparent border-none outline-none text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium border-none outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <select 
                value={filterCountry} 
                onChange={(e) => setFilterCountry(e.target.value)} 
                className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium border-none outline-none cursor-pointer"
              >
                <option value="all">All Countries</option>
                {countries.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium border-none outline-none cursor-pointer"
              >
                <option value="name">Sort: Name</option>
                <option value="students">Sort: Students</option>
                <option value="revenue">Sort: Revenue</option>
                <option value="joined">Sort: Recently Joined</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <BarChart3 size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Menu size={20} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
                <Download size={16} />Export
              </button>
            </div>
          </div>
        </div>

        {/* Partners Grid View */}
        {viewMode === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map((partner) => (
              <div 
                key={partner.id} 
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                  partner.status === 'suspended' ? 'border-red-100 opacity-75' : 
                  partner.status === 'pending' ? 'border-yellow-100' : 
                  'border-gray-100 hover:border-blue-200'
                }`}
                onClick={() => openPartnerDetails(partner)}
              >
                {/* Card Header */}
                <div className={`p-4 ${partner.featured ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        partner.featured ? 'bg-white/20 text-white' : 'bg-white text-blue-600 shadow-sm'
                      }`}>
                        {partner.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold ${partner.featured ? 'text-white' : 'text-gray-900'}`}>{partner.name}</h3>
                          {partner.featured && <Star size={14} className="text-yellow-300 fill-yellow-300" />}
                        </div>
                        <p className={`text-sm flex items-center gap-1 ${partner.featured ? 'text-blue-100' : 'text-gray-500'}`}>
                          <span>{partner.flag}</span> {partner.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(partner.status)}
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{partner.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                      <p className="text-lg font-bold text-gray-900">{partner.students}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl text-center">
                      <p className="text-lg font-bold text-green-600">${partner.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600">Monthly</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {partner.programs.map((prog, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                        {prog}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Share: {partner.tabseraShare}% / {partner.centerShare}%
                    </div>
                    {getSettlementBadge(partner.settlementStatus)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Partners List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Partner</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Students</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Monthly Revenue</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Revenue Share</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Settlement</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className={`hover:bg-gray-50 ${partner.status === 'suspended' ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                          partner.status === 'active' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          partner.status === 'pending' ? 'bg-gradient-to-br from-yellow-400 to-orange-400' :
                          'bg-gray-400'
                        }`}>
                          {partner.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{partner.name}</p>
                            {partner.featured && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                          </div>
                          <p className="text-xs text-gray-500">{partner.flag} {partner.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(partner.status)}</td>
                    <td className="px-5 py-4 text-center font-medium text-gray-900">{partner.students}</td>
                    <td className="px-5 py-4 text-right font-semibold text-green-600">${partner.monthlyRevenue.toLocaleString()}</td>
                    <td className="px-5 py-4 text-center text-sm text-gray-600">{partner.tabseraShare}% / {partner.centerShare}%</td>
                    <td className="px-5 py-4 text-center">{getSettlementBadge(partner.settlementStatus)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openPartnerDetails(partner); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                          <FileText size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Receipt size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredPartners.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
            <button 
              onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterCountry('all'); }}
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Summary Footer */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {filteredPartners.length} of {partners.length} partners
            </span>
            <div className="flex items-center gap-6 text-sm">
              <div><span className="text-gray-500">Total Students:</span> <span className="font-bold text-gray-900">{filteredPartners.reduce((sum, p) => sum + p.students, 0)}</span></div>
              <div><span className="text-gray-500">Monthly Revenue:</span> <span className="font-bold text-green-600">${filteredPartners.reduce((sum, p) => sum + p.monthlyRevenue, 0).toLocaleString()}</span></div>
              <div><span className="text-gray-500">Lifetime Revenue:</span> <span className="font-bold text-blue-600">${filteredPartners.reduce((sum, p) => sum + p.lifetimeRevenue, 0).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </main>

      {/* Partner Details Modal */}
      {showDetailsModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`p-6 ${selectedPartner.featured ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                    selectedPartner.featured ? 'bg-white/20 text-white' : 'bg-white text-blue-600 shadow-sm'
                  }`}>
                    {selectedPartner.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className={`text-xl font-bold ${selectedPartner.featured ? 'text-white' : 'text-gray-900'}`}>
                        {selectedPartner.name}
                      </h2>
                      {selectedPartner.featured && <Star size={16} className="text-yellow-300 fill-yellow-300" />}
                    </div>
                    <p className={`flex items-center gap-1 ${selectedPartner.featured ? 'text-blue-100' : 'text-gray-500'}`}>
                      <span className="text-lg">{selectedPartner.flag}</span> {selectedPartner.location}
                    </p>
                    <div className="mt-2">{getStatusBadge(selectedPartner.status)}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className={`p-2 rounded-lg ${selectedPartner.featured ? 'text-white/80 hover:bg-white/20' : 'text-gray-400 hover:bg-gray-200'}`}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedPartner.students}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-green-600">${selectedPartner.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">Monthly</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-blue-600">${selectedPartner.lifetimeRevenue.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">Lifetime</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-purple-600">{selectedPartner.tabseraShare}%:{selectedPartner.centerShare}%</p>
                  <p className="text-xs text-purple-600">Share</p>
                </div>
              </div>

              {/* Contract Info */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Contract Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Partner Since</p>
                    <p className="font-medium text-gray-900">{new Date(selectedPartner.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Contract Ends</p>
                    <p className="font-medium text-gray-900">{new Date(selectedPartner.contractEnd).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" />{selectedPartner.rating} / 5.0</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Settlement Status</p>
                    {getSettlementBadge(selectedPartner.settlementStatus)}
                  </div>
                </div>
              </div>

              {/* Programs */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Active Programs</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.programs.map((prog, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      {prog}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <p className="text-sm flex items-center gap-2"><Users size={16} className="text-gray-400" />{selectedPartner.contactName}</p>
                  <p className="text-sm flex items-center gap-2"><Mail size={16} className="text-gray-400" />{selectedPartner.contactEmail}</p>
                  <p className="text-sm flex items-center gap-2"><Phone size={16} className="text-gray-400" />{selectedPartner.contactPhone}</p>
                </div>
              </div>

              {/* Suspended Warning */}
              {selectedPartner.status === 'suspended' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Partner Suspended</p>
                      <p className="text-sm text-red-600">{selectedPartner.suspendedReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-gray-600 font-medium">
                Close
              </button>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                  <FileText size={16} />View Contract
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                  <Receipt size={16} />Settlements
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                  <Edit2 size={16} />Edit Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Add New Partner</h3>
              <p className="text-sm text-gray-500">Register a new learning center partnership</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Center Name</label>
                  <input type="text" placeholder="e.g., Al-Hikma Academy" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input type="text" placeholder="e.g., Nairobi" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                      <option>Select country</option>
                      <option>Somalia</option>
                      <option>Kenya</option>
                      <option>Ethiopia</option>
                      <option>Uganda</option>
                      <option>Tanzania</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                  <input type="text" placeholder="Full name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" placeholder="email@example.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input type="tel" placeholder="+254 7XX XXX XXX" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue Share (TABSERA %)</label>
                  <input type="number" placeholder="50" min="30" max="70" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  <p className="text-xs text-gray-500 mt-1">Center will receive the remaining percentage</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
                Cancel
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                <UserPlus size={18} />Add Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
