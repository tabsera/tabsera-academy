import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, DollarSign, TrendingUp, TrendingDown,
  Receipt, AlertTriangle, CheckCircle2, Clock, ArrowUpRight,
  Calendar, FileText, UserPlus, BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Partners', value: '8', change: '+2', trend: 'up', icon: Building2, color: 'blue' },
    { label: 'Active Students', value: '510', change: '+45', trend: 'up', icon: Users, color: 'purple' },
    { label: 'Monthly Revenue', value: '$28,550', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'green' },
    { label: 'Pending Settlements', value: '4', change: '$9,825', trend: 'neutral', icon: Receipt, color: 'yellow' },
  ];

  const recentActivity = [
    { type: 'payment', message: 'Sunrise International completed January settlement', time: '2 hours ago', status: 'success' },
    { type: 'student', message: '15 new students enrolled at Aqoonyahan School', time: '5 hours ago', status: 'info' },
    { type: 'alert', message: 'Dar es Salaam Islamic - 3 months overdue', time: '1 day ago', status: 'warning' },
    { type: 'partner', message: 'Bosaso Academy partnership activated', time: '2 days ago', status: 'success' },
  ];

  const pendingSettlements = [
    { center: 'Aqoonyahan School', flag: '🇸🇴', amount: 2450, due: '7 days' },
    { center: 'Al-Noor Academy', flag: '🇸🇴', amount: 1912, due: '7 days' },
    { center: 'Excel Academy', flag: '🇪🇹', amount: 2486, due: '7 days' },
    { center: 'Hidaya Learning Center', flag: '🇰🇪', amount: 1636, due: '7 days' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with TABSERA Academy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon size={18} className={`text-${stat.color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${
              stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {stat.trend === 'up' ? <TrendingUp size={14} /> : stat.trend === 'down' ? <TrendingDown size={14} /> : <Clock size={14} />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Settlements */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Pending Settlements</h3>
              <p className="text-sm text-gray-500">January 2026 • Due Jan 15</p>
            </div>
            <Link to="/admin/settlements" className="text-sm text-blue-600 font-medium hover:text-blue-700">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingSettlements.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.flag}</span>
                  <div>
                    <p className="font-medium text-gray-900">{item.center}</p>
                    <p className="text-xs text-gray-500">Due in {item.due}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${item.amount.toLocaleString()}</p>
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Link 
              to="/admin/settlements/process"
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              Process Settlements
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status === 'success' ? 'bg-green-100' :
                    item.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {item.status === 'success' ? <CheckCircle2 size={16} className="text-green-600" /> :
                     item.status === 'warning' ? <AlertTriangle size={16} className="text-yellow-600" /> :
                     <Users size={16} className="text-blue-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{item.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/partners" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <Building2 size={24} className="text-blue-600" />
            <span className="font-medium text-gray-900">View Partners</span>
          </Link>
          <Link to="/admin/students" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <UserPlus size={24} className="text-purple-600" />
            <span className="font-medium text-gray-900">Register Student</span>
          </Link>
          <Link to="/admin/settlements/process" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <Receipt size={24} className="text-green-600" />
            <span className="font-medium text-gray-900">Process Settlement</span>
          </Link>
          <Link to="/admin/contracts" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <FileText size={24} className="text-cyan-600" />
            <span className="font-medium text-gray-900">Contracts</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
