/**
 * My Contracts Page
 * Student's recurring session contracts
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Calendar, Clock, User, X,
  CheckCircle, XCircle, CreditCard, Repeat, ChevronRight
} from 'lucide-react';

const STATUS_STYLES = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MyContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await tutorsApi.getStudentContracts();
      setContracts(response.contracts || []);
    } catch (err) {
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (contractId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    setCancellingId(contractId);
    try {
      await tutorsApi.cancelContract(contractId, reason);
      fetchContracts();
    } catch (err) {
      alert(err.message || 'Failed to cancel contract');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">My Recurring Sessions</h1>
          <p className="text-gray-500">Manage your recurring session contracts</p>
        </div>
        <Link
          to="/tutors"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
        >
          <Repeat size={18} />
          New Recurring Contract
        </Link>
      </div>

      {contracts.length > 0 ? (
        <div className="space-y-4">
          {contracts.map(contract => {
            const status = STATUS_STYLES[contract.status] || STATUS_STYLES.PENDING;
            const isActive = ['PENDING', 'ACCEPTED'].includes(contract.status);

            return (
              <div
                key={contract.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Tutor Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {contract.tutorProfile?.user?.firstName?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {contract.tutorProfile?.user?.firstName} {contract.tutorProfile?.user?.lastName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      {contract.course && (
                        <p className="text-sm text-gray-500">{contract.course.title}</p>
                      )}
                      {contract.topic && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{contract.topic}</p>
                      )}
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="flex-1 md:text-center">
                    <p className="text-sm text-gray-500 mb-1">
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </p>
                    <p className="font-medium text-gray-900">
                      {contract.daysOfWeek.map(d => DAYS[d]).join(', ')} at {contract.timeSlot}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {contract.slotCount === 1 ? '10 min' : contract.slotCount === 2 ? '20 min' : contract.slotCount === 4 ? '40 min' : '60 min'} sessions
                    </p>
                  </div>

                  {/* Credits Info */}
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-500">Credits</p>
                    <div className="flex items-center gap-2 justify-center md:justify-end">
                      <span className="text-green-600 font-semibold">{contract.usedCredits}</span>
                      <span className="text-gray-400">/</span>
                      <span className="font-semibold text-gray-900">{contract.totalCredits}</span>
                    </div>
                    {contract.status === 'ACCEPTED' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {contract.reservedCredits} reserved
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <button
                        onClick={() => handleCancel(contract.id)}
                        disabled={cancellingId === contract.id}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                      >
                        {cancellingId === contract.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <X size={18} />
                        )}
                        Cancel
                      </button>
                    )}
                    <Link
                      to={`/student/contracts/${contract.id}`}
                      className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                    >
                      View
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Rejection Reason */}
                {contract.status === 'REJECTED' && contract.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700">
                      <strong>Reason:</strong> {contract.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {contract.status === 'CANCELLED' && contract.cancellationReason && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700">
                      <strong>Cancellation reason:</strong> {contract.cancellationReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Repeat size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recurring sessions yet</h3>
          <p className="text-gray-500 mb-6">
            Set up recurring sessions with a tutor for consistent learning.
          </p>
          <Link to="/tutors" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
            Find a Tutor
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyContracts;
