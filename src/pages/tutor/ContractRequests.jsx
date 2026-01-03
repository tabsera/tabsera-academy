/**
 * Contract Requests Page
 * Tutor's pending contract requests to accept or reject
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, User, X,
  CheckCircle, XCircle, CreditCard, Repeat, BookOpen,
  ChevronRight, Check
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function ContractRequests() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await tutorsApi.getPendingContracts();
      setContracts(response.contracts || []);
    } catch (err) {
      setError(err.message || 'Failed to load contract requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (contractId) => {
    if (!confirm('Accept this recurring session request? Sessions will be scheduled and credits will be reserved from the student.')) {
      return;
    }

    setRespondingId(contractId);
    try {
      await tutorsApi.respondToContract(contractId, { accept: true });
      fetchContracts();
    } catch (err) {
      alert(err.message || 'Failed to accept contract');
    } finally {
      setRespondingId(null);
    }
  };

  const handleReject = async (contractId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setRespondingId(contractId);
    try {
      await tutorsApi.respondToContract(contractId, { accept: false, reason: rejectReason });
      setRejectingId(null);
      setRejectReason('');
      fetchContracts();
    } catch (err) {
      alert(err.message || 'Failed to reject contract');
    } finally {
      setRespondingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDurationLabel = (slotCount) => {
    switch (slotCount) {
      case 1: return '10 min';
      case 2: return '20 min';
      case 4: return '40 min';
      case 6: return '60 min';
      default: return '10 min';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchContracts} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
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
          <h1 className="text-2xl font-bold text-gray-900">Recurring Session Requests</h1>
          <p className="text-gray-500">Review and respond to student requests for recurring sessions</p>
        </div>
        {contracts.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl">
            <AlertCircle size={18} />
            <span className="font-medium">{contracts.length} pending request{contracts.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {contracts.length > 0 ? (
        <div className="space-y-6">
          {contracts.map(contract => {
            const isRejecting = rejectingId === contract.id;
            const isResponding = respondingId === contract.id;

            return (
              <div
                key={contract.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {contract.student?.firstName?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {contract.student?.firstName} {contract.student?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{contract.student?.email}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Requested {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 bg-gray-50">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Period</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Days</p>
                      <p className="font-medium text-gray-900">
                        {contract.daysOfWeek.map(d => DAYS[d].slice(0, 3)).join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Time</p>
                      <p className="font-medium text-gray-900">{contract.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Duration</p>
                      <p className="font-medium text-gray-900">{getDurationLabel(contract.slotCount)}</p>
                    </div>
                  </div>

                  {contract.course && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <BookOpen size={16} className="text-gray-400" />
                      <span className="text-gray-600">Course: {contract.course.title}</span>
                    </div>
                  )}

                  {contract.topic && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Topic/Focus</p>
                      <p className="text-gray-900">{contract.topic}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong className="text-gray-900">{Math.round(contract.totalCredits / (contract.slotCount || 1))}</strong> sessions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong className="text-gray-900">{contract.totalCredits}</strong> total credits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reject Form */}
                {isRejecting && (
                  <div className="p-6 bg-red-50 border-t border-red-100">
                    <p className="text-sm font-medium text-red-700 mb-2">Reason for rejection:</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please explain why you cannot accept this request..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(contract.id)}
                        disabled={isResponding}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                      >
                        {isResponding ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <XCircle size={18} />
                        )}
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!isRejecting && (
                  <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      onClick={() => setRejectingId(contract.id)}
                      disabled={isResponding}
                      className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(contract.id)}
                      disabled={isResponding}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                    >
                      {isResponding ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Accept Request
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-500">
            You're all caught up! New contract requests will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

export default ContractRequests;
