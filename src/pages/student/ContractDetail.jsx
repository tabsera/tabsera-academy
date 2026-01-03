/**
 * Contract Detail Page
 * View details of a recurring session contract
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, User, ArrowLeft,
  CheckCircle, XCircle, CreditCard, Repeat, BookOpen, MapPin, Ban
} from 'lucide-react';

const STATUS_STYLES = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Approval' },
  ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await tutorsApi.getContract(id);
      setContract(response.contract);
    } catch (err) {
      setError(err.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      await tutorsApi.cancelContract(id, cancelReason);
      navigate('/student/contracts');
    } catch (err) {
      alert(err.message || 'Failed to cancel contract');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDurationLabel = (slotCount) => {
    switch (slotCount) {
      case 1: return '10 minutes';
      case 2: return '20 minutes';
      case 4: return '40 minutes';
      case 6: return '60 minutes';
      default: return '10 minutes';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{error || 'Contract not found'}</p>
          <Link to="/student/contracts" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl">
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_STYLES[contract.status] || STATUS_STYLES.PENDING;
  const isActive = ['PENDING', 'ACCEPTED'].includes(contract.status);
  const tutor = contract.tutorProfile?.user;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/student/contracts" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} />
        Back to Recurring Sessions
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {tutor?.firstName?.charAt(0).toUpperCase() || 'T'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tutor?.firstName} {tutor?.lastName}
                </h1>
                <p className="text-gray-500">{tutor?.email}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Contract Details */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(contract.startDate)}
                  </p>
                  <p className="text-gray-600">to {formatDate(contract.endDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Repeat size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Days</p>
                  <p className="font-medium text-gray-900">
                    {contract.daysOfWeek.map(d => DAYS[d]).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Time & Duration</p>
                  <p className="font-medium text-gray-900">
                    {contract.timeSlot} ({getDurationLabel(contract.slotCount)})
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {contract.course && (
                <div className="flex items-start gap-3">
                  <BookOpen size={20} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium text-gray-900">{contract.course.title}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Credits</p>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">{contract.usedCredits || 0}</span>
                    <span className="text-gray-400">used /</span>
                    <span className="font-semibold text-gray-900">{contract.totalCredits}</span>
                    <span className="text-gray-400">total</span>
                  </div>
                  {contract.status === 'ACCEPTED' && contract.reservedCredits > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {contract.reservedCredits} credits reserved for upcoming sessions
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {contract.topic && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Topic/Focus</p>
              <p className="text-gray-900">{contract.topic}</p>
            </div>
          )}
        </div>

        {/* Rejection/Cancellation Reason */}
        {contract.status === 'REJECTED' && contract.rejectionReason && (
          <div className="p-6 bg-red-50 border-t border-red-100">
            <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
            <p className="text-red-600">{contract.rejectionReason}</p>
          </div>
        )}

        {contract.status === 'CANCELLED' && contract.cancellationReason && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Cancellation Reason</p>
            <p className="text-gray-600">{contract.cancellationReason}</p>
          </div>
        )}

        {/* Cancel Form */}
        {showCancelForm && isActive && (
          <div className="p-6 bg-red-50 border-t border-red-100">
            <p className="text-sm font-medium text-red-700 mb-2">Reason for cancellation:</p>
            <p className="text-xs text-red-600 mb-3">
              This will cancel all remaining sessions and refund reserved credits.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please explain why you need to cancel this contract..."
              rows={3}
              className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setShowCancelForm(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-white"
              >
                Keep Contract
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Ban size={18} />
                )}
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!showCancelForm && isActive && (
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setShowCancelForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
            >
              <Ban size={18} />
              Cancel Contract
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      {contract.sessions && contract.sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {contract.sessions.slice(0, 10).map((session, index) => (
              <div key={session.id || index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                  session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {session.status}
                </span>
              </div>
            ))}
            {contract.sessions.length > 10 && (
              <div className="p-4 text-center text-sm text-gray-500">
                And {contract.sessions.length - 10} more sessions...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractDetail;
