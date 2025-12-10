import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, TrendingUp, Receipt, Clock, CheckCircle2,
  AlertTriangle, BarChart3, Calendar, BookOpen, ArrowUpRight
} from 'lucide-react';

const CenterDashboard = () => {
  const stats = [
    { label: 'Total Students', value: '60', change: '+5', trend: 'up', icon: Users, color: 'blue' },
    { label: 'Monthly Revenue', value: '$4,900', change: '+8.5%', trend: 'up', icon: DollarSign, color: 'green' },
    { label: 'Collection Rate', value: '87%', change: '8 pending', trend: 'neutral', icon: Receipt, color: 'yellow' },
    { label: 'Your Share', value: '$2,450', change: '50%', trend: 'up', icon: TrendingUp, color: 'purple' },
  ];

  const recentPayments = [
    { student: 'Ahmed Hassan', amount: 80, track: 'IGCSE Full', date: 'Jan 3', status: 'paid' },
    { student: 'Fatima Omar', amount: 80, track: 'IGCSE Full', date: 'Jan 2', status: 'paid' },
    { student: 'Mohamed Ali', amount: 25, track: 'Islamic Studies', date: 'Jan 3', status: 'paid' },
    { student: 'Ibrahim Farah', amount: 80, track: 'IGCSE Full', date: 'Overdue', status: 'pending' },
  ];

  const upcomingSettlement = {
    amount: 2450,
    dueDate: 'January 15, 2026',
    daysLeft: 7,
    status: 'pending'
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your center's performance overview.</p>
      </div>

      {/* Stats */}
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
            <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Settlement */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Upcoming Settlement</h3>
            <Clock size={20} className="text-blue-200" />
          </div>
          <p className="text-4xl font-bold mb-2">${upcomingSettlement.amount.toLocaleString()}</p>
          <p className="text-blue-200 mb-4">Due: {upcomingSettlement.dueDate}</p>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{upcomingSettlement.daysLeft} days left</span>
            <Link to="/center/settlements" className="text-sm font-medium flex items-center gap-1 hover:underline">
              View Details <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Payments</h3>
            <Link to="/center/fees" className="text-sm text-blue-600 font-medium">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.map((payment, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {payment.status === 'paid' ? <CheckCircle2 size={18} className="text-green-600" /> : <Clock size={18} className="text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment.student}</p>
                    <p className="text-xs text-gray-500">{payment.track}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${payment.amount}</p>
                  <p className={`text-xs ${payment.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{payment.date}</p>
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
          <Link to="/center/fees" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <Receipt size={24} className="text-green-600" />
            <span className="font-medium text-gray-900">Record Payment</span>
          </Link>
          <Link to="/center/revenue" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <BarChart3 size={24} className="text-blue-600" />
            <span className="font-medium text-gray-900">View Revenue</span>
          </Link>
          <Link to="/center/settlements" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <DollarSign size={24} className="text-purple-600" />
            <span className="font-medium text-gray-900">Settlements</span>
          </Link>
          <Link to="/center/progress" className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
            <BookOpen size={24} className="text-cyan-600" />
            <span className="font-medium text-gray-900">Progress Tracker</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CenterDashboard;
