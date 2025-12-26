/**
 * Order Management Page
 * Admin interface for viewing and managing all orders
 */

import React, { useState, useEffect } from 'react';
import {
  Receipt, Search, Filter, ChevronDown, Eye, CheckCircle,
  XCircle, Clock, RefreshCw, DollarSign, TrendingUp,
  AlertCircle, Loader2, Calendar, Download, MoreVertical
} from 'lucide-react';
import { apiClient } from '@/api/client';

function OrderManagement() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    search: '',
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await apiClient.get('/admin/orders', params);
      setOrders(response.orders || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/orders/stats');
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
      await fetchStats();
      setShowOrderModal(false);
    } catch (err) {
      console.error('Failed to update order:', err);
      alert(err.message || 'Failed to update order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (orderId) => {
    if (!confirm('Are you sure you want to refund this order?')) return;

    try {
      setActionLoading(true);
      await apiClient.post(`/admin/orders/${orderId}/refund`, {});
      await fetchOrders();
      await fetchStats();
      setShowOrderModal(false);
    } catch (err) {
      console.error('Failed to refund order:', err);
      alert(err.message || 'Failed to process refund');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      PENDING_PAYMENT: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
      REFUNDED: { bg: 'bg-purple-100', text: 'text-purple-700', icon: RefreshCw },
    };

    const config = statusConfig[status] || statusConfig.PENDING_PAYMENT;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
        <Icon size={12} />
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'Unknown';
    return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500">View and manage all customer orders</p>
        </div>
        <button
          onClick={() => { fetchOrders(); fetchStats(); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Orders</span>
              <Receipt size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Completed</span>
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pending</span>
              <Clock size={20} className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Failed</span>
              <XCircle size={20} className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.failedOrders}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Total Revenue</span>
              <DollarSign size={20} />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <option value="">All Methods</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="pay_at_center">Pay at Center</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Orders</h3>
          <span className="text-sm text-gray-500">{total} total orders</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Items</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-gray-900">{order.referenceId}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user?.firstName} {order.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-900 truncate max-w-[150px]">
                              {item.track?.title || item.course?.title}
                            </p>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-xs text-gray-500">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">
                        {formatPaymentMethod(order.paymentMethod)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Receipt size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500">{selectedOrder.referenceId}</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedOrder.status)}
                <div className="flex gap-2">
                  {selectedOrder.status === 'PENDING_PAYMENT' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Mark Completed'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleRefund(selectedOrder.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Process Refund'}
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedOrder.billingPhone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Learning Center</p>
                    <p className="font-medium text-gray-900">{selectedOrder.center?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.track?.title || item.course?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.track ? 'Track' : 'Course'}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-blue-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-gray-600">Payment Method: <span className="font-medium text-gray-900">{formatPaymentMethod(selectedOrder.paymentMethod)}</span></p>
                    <p className="text-gray-600">Order Date: <span className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
