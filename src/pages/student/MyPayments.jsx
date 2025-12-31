/**
 * My Payments Page
 * Student payment history and order management
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Clock, CheckCircle, AlertTriangle, Download,
  Calendar, Search, Receipt, DollarSign, AlertCircle as AlertIcon,
  Loader2, ExternalLink, XCircle, RefreshCw
} from 'lucide-react';
import { apiClient } from '@/api/client';

function MyPayments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch orders and payments in parallel
        const [ordersRes, paymentsRes] = await Promise.all([
          apiClient.get('/orders'),
          apiClient.get('/payments'),
        ]);

        setOrders(ordersRes.orders || []);
        setPayments(paymentsRes.payments || []);
      } catch (err) {
        console.error('Failed to fetch payment data:', err);
        setError(err.message || 'Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case 'pending':
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'failed':
      case 'declined':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <XCircle size={12} />
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            <RefreshCw size={12} />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'zaad':
      case 'evc_plus':
      case 'sahal':
      case 'mobile_money':
        return '📱';
      case 'bank_transfer':
        return '🏦';
      case 'cash':
      case 'pay_at_center':
        return '💵';
      case 'card':
      case 'credit_card':
        return '💳';
      default:
        return '💰';
    }
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'Unknown';
    return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate summary stats
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const pendingOrders = orders.filter(o => o.status === 'PENDING_PAYMENT');
  const totalPaid = completedOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'completed' && order.status === 'COMPLETED') ||
      (filterStatus === 'pending' && order.status === 'PENDING_PAYMENT') ||
      (filterStatus === 'failed' && ['FAILED', 'CANCELLED'].includes(order.status));

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      order.referenceId?.toLowerCase().includes(searchLower) ||
      order.items?.some(item =>
        item.track?.title?.toLowerCase().includes(searchLower) ||
        item.course?.title?.toLowerCase().includes(searchLower)
      );

    return matchesStatus && matchesSearch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading your payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertIcon size={40} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
          <p className="text-gray-500">View your orders and payment history</p>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Browse Courses
          <ExternalLink size={18} />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Orders</span>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Receipt size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          <p className="text-sm text-gray-500 mt-1">{completedOrders.length} completed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Paid</span>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
          <p className="text-sm text-gray-500 mt-1">{completedOrders.length} payments</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Pending</span>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
          <p className="text-sm text-yellow-600 mt-1">{pendingOrders.length} pending orders</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-blue-100">Payment Methods</span>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">3</p>
          <p className="text-sm text-blue-100 mt-1">Zaad, EVC, Card</p>
        </div>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900">Pending Payments</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You have {pendingOrders.length} order(s) awaiting payment
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {pendingOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-3 border border-yellow-200">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-500">{order.referenceId}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              to="/checkout/cart"
              className="shrink-0 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
            >
              Complete Payment
            </Link>
          </div>
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-blue-900 mb-3">Accepted Payment Methods</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
            <span className="text-xl">📱</span>
            <span className="text-sm font-medium text-gray-700">Zaad / EVC Plus / Sahal</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
            <span className="text-xl">💳</span>
            <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
            <span className="text-xl">🏦</span>
            <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
            <span className="text-xl">💵</span>
            <span className="text-sm font-medium text-gray-700">Pay at Center</span>
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
              placeholder="Search by order ID or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  filterStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Order History</h3>
          <span className="text-sm text-gray-500">{filteredOrders.length} orders</span>
        </div>

        {filteredOrders.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Items</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-900">{order.referenceId}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-900 truncate max-w-[200px]">
                              {item.name || item.track?.title || item.course?.title || 'Item'}
                            </p>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-xs text-gray-500">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2">
                          <span>{getPaymentMethodIcon(order.paymentMethod)}</span>
                          <span className="text-gray-600">{formatPaymentMethod(order.paymentMethod)}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <div key={order.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm text-gray-900">{order.referenceId}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="mb-2">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-900">
                        {item.name || item.track?.title || item.course?.title || 'Item'}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getPaymentMethodIcon(order.paymentMethod)}</span>
                      <span className="text-sm text-gray-600">{formatPaymentMethod(order.paymentMethod)}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt size={24} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-4">
              {orders.length === 0
                ? "You haven't made any purchases yet"
                : "No orders match your filter criteria"
              }
            </p>
            {orders.length === 0 && (
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Browse Courses
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-2">Need Help with Payments?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you have questions about your payments or need assistance, please contact our support team.
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
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MyPayments;
