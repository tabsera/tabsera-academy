/**
 * My Certificates Page
 * View and download earned certificates
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, Download, Share2, ExternalLink,
  Calendar, BookOpen, CheckCircle, Search,
  X, Copy, Check
} from 'lucide-react';

// Mock data - replace with API calls
const mockCertificates = [
  {
    id: 'CERT-2025-001',
    title: 'IGCSE Chemistry',
    track: 'Cambridge IGCSE Full Program',
    completedDate: '2025-12-15',
    grade: 'A',
    credentialId: 'TAB-IGCSE-CHEM-2025-001234',
    verificationUrl: 'https://verify.tabsera.com/TAB-IGCSE-CHEM-2025-001234',
    downloadUrl: '/certificates/CERT-2025-001.pdf',
    status: 'issued'
  },
  {
    id: 'CERT-2025-002',
    title: 'IGCSE Biology',
    track: 'Cambridge IGCSE Full Program',
    completedDate: '2025-11-28',
    grade: 'A*',
    credentialId: 'TAB-IGCSE-BIO-2025-001235',
    verificationUrl: 'https://verify.tabsera.com/TAB-IGCSE-BIO-2025-001235',
    downloadUrl: '/certificates/CERT-2025-002.pdf',
    status: 'issued'
  },
  {
    id: 'CERT-2025-003',
    title: 'Quranic Studies & Tajweed',
    track: 'Islamic Studies Program',
    completedDate: '2025-10-20',
    grade: 'Pass with Distinction',
    credentialId: 'TAB-ISLAMIC-QST-2025-001236',
    verificationUrl: 'https://verify.tabsera.com/TAB-ISLAMIC-QST-2025-001236',
    downloadUrl: '/certificates/CERT-2025-003.pdf',
    status: 'issued'
  }
];

const mockPendingCertificates = [
  {
    id: 'PEND-001',
    title: 'IGCSE Mathematics',
    track: 'Cambridge IGCSE Full Program',
    progress: 78,
    estimatedCompletion: 'February 2026',
    status: 'in_progress'
  },
  {
    id: 'PEND-002',
    title: 'Islamic Fiqh Basics',
    track: 'Islamic Studies Program',
    progress: 85,
    estimatedCompletion: 'January 2026',
    status: 'in_progress'
  }
];

function MyCertificates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleShare = (cert) => {
    setSelectedCertificate(cert);
    setShowShareModal(true);
    setCopied(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCertificates = mockCertificates.filter(cert =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.track.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGradeColor = (grade) => {
    if (grade.includes('A*') || grade.includes('Distinction')) return 'text-yellow-600 bg-yellow-100';
    if (grade.includes('A')) return 'text-green-600 bg-green-100';
    if (grade.includes('B')) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-500">View and download your earned certificates</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Award size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockCertificates.length}</p>
              <p className="text-sm text-gray-500">Certificates Earned</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockPendingCertificates.length}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">With Distinction</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-blue-100">Total Courses Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Earned Certificates */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Earned Certificates</h2>
        
        {filteredCertificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map(cert => (
              <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Certificate Preview */}
                <div className="h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-20 h-20 border-4 border-white rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-32 h-32 border-4 border-white rounded-full"></div>
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Award size={40} className="mb-2" />
                    <p className="text-sm font-medium text-blue-200">Certificate of Completion</p>
                    <p className="text-lg font-bold">{cert.title}</p>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{cert.title}</h3>
                      <p className="text-sm text-gray-500">{cert.track}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getGradeColor(cert.grade)}`}>
                      {cert.grade}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar size={14} />
                    <span>Issued: {formatDate(cert.completedDate)}</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-xs text-gray-500 mb-1">Credential ID</p>
                    <p className="font-mono text-sm text-gray-900 truncate">{cert.credentialId}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(cert.downloadUrl, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(cert)}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No certificates found matching your search</p>
          </div>
        )}
      </div>

      {/* In Progress */}
      {mockPendingCertificates.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Certificates In Progress</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mockPendingCertificates.map(cert => (
              <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BookOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{cert.title}</h3>
                      <p className="text-sm text-gray-500">{cert.track}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {cert.progress}% complete
                  </span>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${cert.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Estimated completion: {cert.estimatedCompletion}
                  </p>
                  <Link
                    to="/student/my-learning"
                    className="text-sm text-blue-600 font-medium hover:text-blue-700"
                  >
                    Continue Course →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Share Certificate</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Award size={40} className="text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-gray-900">{selectedCertificate.title}</p>
                <p className="text-sm text-gray-500">{selectedCertificate.track}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedCertificate.verificationUrl}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedCertificate.verificationUrl)}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedCertificate.credentialId}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedCertificate.credentialId)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Share on</p>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0077B5] text-white rounded-xl font-medium text-sm hover:bg-[#006699] transition-colors">
                    LinkedIn
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1DA1F2] text-white rounded-xl font-medium text-sm hover:bg-[#1a8cd8] transition-colors">
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCertificates;
