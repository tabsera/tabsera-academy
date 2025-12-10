/**
 * Analytics Dashboard
 * Comprehensive analytics with charts, trends, and reports
 */

import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Users, DollarSign, BookOpen,
  Building2, Calendar, Download, Filter, RefreshCw,
  ArrowUpRight, ArrowDownRight, BarChart3, PieChart,
  Globe, Award, Clock, ChevronDown
} from 'lucide-react';

// Mock data for analytics
const mockOverviewStats = {
  totalRevenue: { value: 45680, change: 12.5, period: 'vs last month' },
  activeStudents: { value: 1247, change: 8.3, period: 'vs last month' },
  newEnrollments: { value: 156, change: -2.1, period: 'vs last month' },
  activeCenters: { value: 12, change: 20, period: 'vs last month' },
};

const mockRevenueByMonth = [
  { month: 'Jul', revenue: 32000, students: 980 },
  { month: 'Aug', revenue: 35500, students: 1020 },
  { month: 'Sep', revenue: 38200, students: 1080 },
  { month: 'Oct', revenue: 41000, students: 1150 },
  { month: 'Nov', revenue: 43500, students: 1200 },
  { month: 'Dec', revenue: 45680, students: 1247 },
];

const mockRevenueByTrack = [
  { track: 'Cambridge IGCSE Full', revenue: 28500, students: 356, percentage: 62.4 },
  { track: 'Islamic Studies', revenue: 8200, students: 328, percentage: 17.9 },
  { track: 'ESL Intensive', revenue: 5400, students: 120, percentage: 11.8 },
  { track: 'Business Track', revenue: 2100, students: 42, percentage: 4.6 },
  { track: 'Other', revenue: 1480, students: 45, percentage: 3.3 },
];

const mockTopCenters = [
  { id: 1, name: 'Aqoonyahan School', location: 'Hargeisa', students: 245, revenue: 12500, growth: 15.2 },
  { id: 2, name: 'Sunrise International', location: 'Nairobi', students: 198, revenue: 9800, growth: 22.1 },
  { id: 3, name: 'Al-Noor Academy', location: 'Mogadishu', students: 167, revenue: 8200, growth: 8.5 },
  { id: 4, name: 'Excel Learning', location: 'Addis Ababa', students: 145, revenue: 7100, growth: -3.2 },
  { id: 5, name: 'Bright Future', location: 'Kampala', students: 112, revenue: 5400, growth: 18.9 },
];

const mockRecentActivity = [
  { type: 'enrollment', message: '15 new students enrolled in IGCSE Full Program', time: '2 hours ago', center: 'Aqoonyahan' },
  { type: 'payment', message: 'Settlement of $4,250 processed for Sunrise International', time: '5 hours ago', center: 'Sunrise' },
  { type: 'center', message: 'New learning center application from Djibouti', time: '1 day ago', center: null },
  { type: 'course', message: 'IGCSE Chemistry course completion rate reached 85%', time: '2 days ago', center: null },
];

const mockCountryDistribution = [
  { country: 'Somalia', flag: '🇸🇴', students: 580, percentage: 46.5 },
  { country: 'Kenya', flag: '🇰🇪', students: 312, percentage: 25.0 },
  { country: 'Ethiopia', flag: '🇪🇹', students: 198, percentage: 15.9 },
  { country: 'Uganda', flag: '🇺🇬', students: 112, percentage: 9.0 },
  { country: 'Others', flag: '🌍', students: 45, percentage: 3.6 },
];

function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getMaxRevenue = () => Math.max(...mockRevenueByMonth.map(m => m.revenue));

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">Monitor performance and track key metrics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium appearance-none cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
              <option value="all">All time</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              mockOverviewStats.totalRevenue.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {mockOverviewStats.totalRevenue.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(mockOverviewStats.totalRevenue.change)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(mockOverviewStats.totalRevenue.value)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
        </div>

        {/* Active Students */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              mockOverviewStats.activeStudents.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {mockOverviewStats.activeStudents.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(mockOverviewStats.activeStudents.change)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{mockOverviewStats.activeStudents.value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Active Students</p>
        </div>

        {/* New Enrollments */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-purple-600" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              mockOverviewStats.newEnrollments.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {mockOverviewStats.newEnrollments.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(mockOverviewStats.newEnrollments.change)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{mockOverviewStats.newEnrollments.value}</p>
          <p className="text-sm text-gray-500 mt-1">New Enrollments</p>
        </div>

        {/* Active Centers */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-orange-600" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              mockOverviewStats.activeCenters.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {mockOverviewStats.activeCenters.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(mockOverviewStats.activeCenters.change)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{mockOverviewStats.activeCenters.value}</p>
          <p className="text-sm text-gray-500 mt-1">Active Centers</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Monthly revenue over time</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Revenue
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-400 rounded-full"></span>
                Students
              </span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4">
            {mockRevenueByMonth.map((month, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-900">
                    {formatCurrency(month.revenue).replace('$', '')}
                  </span>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(month.revenue / getMaxRevenue()) * 180}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Track */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue by Track</h2>
            <PieChart size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {mockRevenueByTrack.map((track, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{track.track}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(track.revenue)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        idx === 0 ? 'bg-blue-500' :
                        idx === 1 ? 'bg-green-500' :
                        idx === 2 ? 'bg-purple-500' :
                        idx === 3 ? 'bg-orange-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${track.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{track.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performing Centers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Top Performing Centers</h2>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Center</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Students</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockTopCenters.map((center, idx) => (
                  <tr key={center.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{center.name}</p>
                          <p className="text-xs text-gray-500">{center.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{center.students}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(center.revenue)}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-sm font-semibold ${
                        center.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {center.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(center.growth)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Student Distribution</h2>
            <Globe size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {mockCountryDistribution.map((country, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{country.country}</span>
                    <span className="text-sm text-gray-600">{country.students} students</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-500 w-12 text-right">
                  {country.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="mt-6 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
            <p className="text-gray-400 text-sm">Interactive map coming soon</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-4">
            {mockRecentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'enrollment' ? 'bg-blue-100' :
                  activity.type === 'payment' ? 'bg-green-100' :
                  activity.type === 'center' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  {activity.type === 'enrollment' && <Users size={20} className="text-blue-600" />}
                  {activity.type === 'payment' && <DollarSign size={20} className="text-green-600" />}
                  {activity.type === 'center' && <Building2 size={20} className="text-purple-600" />}
                  {activity.type === 'course' && <Award size={20} className="text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    {activity.center && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-blue-600">{activity.center}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Course Completion */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Course Completion Rate</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="#3B82F6" 
                    strokeWidth="12" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56 * 0.72} ${2 * Math.PI * 56}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">72%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">Average across all tracks</p>
          </div>

          {/* Payment Collection */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Payment Collection</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Collected</span>
                <span className="font-semibold text-green-600">{formatCurrency(38500)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(5200)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-semibold text-red-600">{formatCurrency(1980)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Collection Rate</span>
                  <span className="font-bold text-gray-900">84.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
