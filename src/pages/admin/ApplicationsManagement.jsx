/**
 * Applications Management Page
 * Review and manage partner/center applications
 */

import React, { useState } from 'react';
import {
  FileText, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, MapPin, Mail, Phone, Building2, Calendar,
  ChevronDown, MessageSquare, Download, User, Globe,
  AlertCircle, Send, X, ExternalLink
} from 'lucide-react';

// Mock applications data
const mockApplications = [
  {
    id: 'APP001',
    centerName: 'Al-Hikma Academy',
    applicantName: 'Dr. Yusuf Ahmed',
    email: 'yusuf@alhikma.edu',
    phone: '+253 77 123 4567',
    country: 'Djibouti',
    city: 'Djibouti City',
    status: 'pending',
    submittedAt: '2026-01-08',
    expectedStudents: 150,
    facilities: ['Classrooms', 'Computer Lab', 'Library'],
    experience: '5 years running secondary school programs',
    motivation: 'We want to offer internationally recognized qualifications to our students and expand our curriculum with Cambridge IGCSE programs.',
    documents: ['Business License', 'Tax Registration', 'Facility Photos'],
    notes: [],
  },
  {
    id: 'APP002',
    centerName: 'Mogadishu Learning Hub',
    applicantName: 'Amina Hassan',
    email: 'amina@mlhub.so',
    phone: '+252 61 456 7890',
    country: 'Somalia',
    city: 'Mogadishu',
    status: 'under_review',
    submittedAt: '2026-01-05',
    expectedStudents: 200,
    facilities: ['Classrooms', 'Computer Lab', 'Science Lab'],
    experience: '3 years tutoring center experience',
    motivation: 'Looking to formalize our tutoring programs and offer accredited certificates to students.',
    documents: ['Business License', 'ID Documents', 'Reference Letters'],
    notes: [
      { author: 'Admin', text: 'Verified business registration', date: '2026-01-06' },
      { author: 'Admin', text: 'Scheduled site visit for Jan 15', date: '2026-01-07' },
    ],
    assignedTo: 'Mohamed Ali',
  },
  {
    id: 'APP003',
    centerName: 'Nairobi Excellence Center',
    applicantName: 'James Ochieng',
    email: 'james@nec.co.ke',
    phone: '+254 72 789 0123',
    country: 'Kenya',
    city: 'Nairobi',
    status: 'approved',
    submittedAt: '2025-12-15',
    expectedStudents: 300,
    facilities: ['Classrooms', 'Computer Lab', 'Library', 'Sports Field'],
    experience: '10 years educational institution',
    motivation: 'Expanding our offerings to include Cambridge curriculum alongside national programs.',
    documents: ['Business License', 'Tax Registration', 'Accreditation Certificates'],
    notes: [
      { author: 'Admin', text: 'Site visit completed successfully', date: '2025-12-20' },
      { author: 'Admin', text: 'Contract sent for signing', date: '2025-12-28' },
    ],
    approvedAt: '2025-12-30',
  },
  {
    id: 'APP004',
    centerName: 'Quick Tutors',
    applicantName: 'Anonymous',
    email: 'info@quicktutors.com',
    phone: '+1 555 123 4567',
    country: 'United States',
    city: 'Unknown',
    status: 'rejected',
    submittedAt: '2025-12-01',
    expectedStudents: 50,
    facilities: ['Online Only'],
    experience: 'None specified',
    motivation: 'Looking to resell courses',
    documents: [],
    notes: [
      { author: 'Admin', text: 'Incomplete application, no verifiable details', date: '2025-12-02' },
    ],
    rejectedAt: '2025-12-03',
    rejectionReason: 'Incomplete application and outside target region',
  },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function ApplicationsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [newNote, setNewNote] = useState('');

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = 
      app.centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <Eye size={12} />
            Under Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCountryFlag = (country) => {
    const flags = {
      'Somalia': '🇸🇴',
      'Kenya': '🇰🇪',
      'Ethiopia': '🇪🇹',
      'Djibouti': '🇩🇯',
      'Uganda': '🇺🇬',
    };
    return flags[country] || '🌍';
  };

  const applicationCounts = {
    total: mockApplications.length,
    pending: mockApplications.filter(a => a.status === 'pending').length,
    underReview: mockApplications.filter(a => a.status === 'under_review').length,
    approved: mockApplications.filter(a => a.status === 'approved').length,
    rejected: mockApplications.filter(a => a.status === 'rejected').length,
  };

  const openReviewModal = (app) => {
    setSelectedApplication(app);
    setShowReviewModal(true);
    setActionType(null);
    setNewNote('');
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Applications</h1>
          <p className="text-gray-500">Review and manage learning center partnership applications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={18} />
          Export Applications
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{applicationCounts.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">{applicationCounts.pending}</p>
          <p className="text-sm text-yellow-600">Pending</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{applicationCounts.underReview}</p>
          <p className="text-sm text-blue-600">Under Review</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{applicationCounts.approved}</p>
          <p className="text-sm text-green-600">Approved</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
          <p className="text-2xl font-bold text-red-700">{applicationCounts.rejected}</p>
          <p className="text-sm text-red-600">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by center name, applicant, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map(app => (
          <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {app.centerName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{app.centerName}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-gray-600">{app.applicantName}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {getCountryFlag(app.country)} {app.city}, {app.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Applied: {formatDate(app.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        Expected: {app.expectedStudents} students
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openReviewModal(app)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
                  >
                    <Eye size={16} />
                    Review
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact</p>
                  <p className="text-sm text-gray-700">{app.email}</p>
                  <p className="text-sm text-gray-700">{app.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Facilities</p>
                  <div className="flex flex-wrap gap-1">
                    {app.facilities.slice(0, 3).map((facility, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {facility}
                      </span>
                    ))}
                    {app.facilities.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        +{app.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Documents</p>
                  <p className="text-sm text-gray-700">{app.documents.length} files uploaded</p>
                </div>
              </div>

              {/* Notes Preview */}
              {app.notes && app.notes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Latest Note</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    "{app.notes[app.notes.length - 1].text}" 
                    <span className="text-gray-400 ml-2">— {app.notes[app.notes.length - 1].author}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredApplications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No applications found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReviewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedApplication.centerName}</h3>
                <p className="text-gray-500">Application #{selectedApplication.id}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedApplication.status)}
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Applicant Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-900">{selectedApplication.applicantName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <a href={`mailto:${selectedApplication.email}`} className="text-blue-600 hover:underline">
                        {selectedApplication.email}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-gray-900">{selectedApplication.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-900">
                        {getCountryFlag(selectedApplication.country)} {selectedApplication.city}, {selectedApplication.country}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Center Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Expected Students:</span> <span className="font-medium">{selectedApplication.expectedStudents}</span></p>
                    <p><span className="text-gray-500">Experience:</span> <span className="font-medium">{selectedApplication.experience}</span></p>
                    <p><span className="text-gray-500">Applied:</span> <span className="font-medium">{formatDate(selectedApplication.submittedAt)}</span></p>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.facilities.map((facility, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Motivation */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Motivation</h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{selectedApplication.motivation}</p>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
                {selectedApplication.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{doc}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Internal Notes</h4>
                {selectedApplication.notes && selectedApplication.notes.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {selectedApplication.notes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-sm text-gray-700">{note.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{note.author} • {formatDate(note.date)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-4">No notes yet</p>
                )}
                
                {/* Add Note */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                    <Send size={18} />
                  </button>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {(selectedApplication.status === 'pending' || selectedApplication.status === 'under_review') && (
              <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
                <button className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                  Mark as Under Review
                </button>
                <button className="flex-1 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200">
                  Reject
                </button>
                <button className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsManagement;
