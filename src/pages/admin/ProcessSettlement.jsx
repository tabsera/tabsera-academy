import React, { useState } from 'react';
import {
  GraduationCap, Building2, Search, Bell, Settings, X, Check, AlertCircle,
  ArrowLeft, DollarSign, TrendingUp, Clock, Users, FileText, Download, Eye,
  BarChart3, CheckCircle2, AlertTriangle, Wallet, Menu, Receipt, Percent,
  RefreshCw, Printer, CircleDollarSign, FileCheck, Send, Landmark, Phone,
  Copy, MapPin, LayoutDashboard, Briefcase, ChevronRight, ChevronLeft,
  Calendar, Mail, CreditCard, Banknote, ArrowRight, CheckSquare, Square,
  Info, HelpCircle, Upload, Paperclip, XCircle
} from 'lucide-react';

export default function ProcessSettlement() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('jan-2026');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-01-08');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Period options
  const periods = [
    { id: 'jan-2026', name: 'January 2026', dueDate: '2026-01-15' },
    { id: 'dec-2025', name: 'December 2025', dueDate: '2025-12-15' },
  ];

  // Partner Centers with pending settlements
  const pendingCenters = [
    {
      id: 'aqoonyahan',
      name: 'Aqoonyahan School',
      location: 'Hargeisa, Somalia',
      flag: '🇸🇴',
      logo: 'AS',
      tabseraShare: 50,
      centerShare: 50,
      grossRevenue: 4900,
      tabseraAmount: 2450,
      centerAmount: 2450,
      students: 60,
      collectionRate: 87,
      contactName: 'Ahmed Hassan',
      contactEmail: 'ahmed@aqoonyahan.edu.so',
      contactPhone: '+252 61 123 4567',
      tracks: [
        { name: 'IGCSE Full Program', students: 45, revenue: 3600, tabsera: 1800 },
        { name: 'Islamic Studies', students: 52, revenue: 1300, tabsera: 650 }
      ],
      invoiceNumber: 'INV-2026-001',
      status: 'pending'
    },
    {
      id: 'alnoor',
      name: 'Al-Noor Academy',
      location: 'Mogadishu, Somalia',
      flag: '🇸🇴',
      logo: 'AN',
      tabseraShare: 50,
      centerShare: 50,
      grossRevenue: 3825,
      tabseraAmount: 1912.50,
      centerAmount: 1912.50,
      students: 45,
      collectionRate: 92,
      contactName: 'Mohamed Ali',
      contactEmail: 'mohamed@alnoor.edu.so',
      contactPhone: '+252 61 234 5678',
      tracks: [
        { name: 'IGCSE Full Program', students: 35, revenue: 2800, tabsera: 1400 },
        { name: 'Islamic Studies', students: 40, revenue: 1000, tabsera: 500 }
      ],
      invoiceNumber: 'INV-2026-003',
      status: 'pending'
    },
    {
      id: 'excel',
      name: 'Excel Academy',
      location: 'Addis Ababa, Ethiopia',
      flag: '🇪🇹',
      logo: 'EA',
      tabseraShare: 45,
      centerShare: 55,
      grossRevenue: 5525,
      tabseraAmount: 2486.25,
      centerAmount: 3038.75,
      students: 85,
      collectionRate: 88,
      contactName: 'Alemayehu Bekele',
      contactEmail: 'alemayehu@excel.edu.et',
      contactPhone: '+251 91 234 5678',
      tracks: [
        { name: 'IGCSE Full Program', students: 50, revenue: 4000, tabsera: 1800 },
        { name: 'Science Track', students: 25, revenue: 1250, tabsera: 562.50 },
        { name: 'Islamic Studies', students: 30, revenue: 750, tabsera: 337.50 }
      ],
      invoiceNumber: 'INV-2026-004',
      status: 'invoice_sent'
    },
    {
      id: 'hidaya',
      name: 'Hidaya Learning Center',
      location: 'Mombasa, Kenya',
      flag: '🇰🇪',
      logo: 'HL',
      tabseraShare: 55,
      centerShare: 45,
      grossRevenue: 2975,
      tabseraAmount: 1636.25,
      centerAmount: 1338.75,
      students: 35,
      collectionRate: 82,
      contactName: 'Fatima Hassan',
      contactEmail: 'fatima@hidaya.ke',
      contactPhone: '+254 72 345 6789',
      tracks: [
        { name: 'IGCSE Full Program', students: 20, revenue: 1600, tabsera: 880 },
        { name: 'Islamic Studies', students: 35, revenue: 875, tabsera: 481.25 },
        { name: 'ESL Intensive', students: 10, revenue: 300, tabsera: 165 }
      ],
      invoiceNumber: 'INV-2026-006',
      status: 'invoice_sent'
    },
  ];

  const steps = [
    { number: 1, title: 'Select Center', description: 'Choose partner center' },
    { number: 2, title: 'Review & Invoice', description: 'Verify and generate invoice' },
    { number: 3, title: 'Record Payment', description: 'Confirm payment received' },
    { number: 4, title: 'Complete', description: 'Settlement finalized' }
  ];

  const currentPeriod = periods.find(p => p.id === selectedPeriod);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} />Pending</span>;
      case 'invoice_sent':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"><Send size={12} />Invoice Sent</span>;
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />Paid</span>;
      default:
        return null;
    }
  };

  const handleSelectCenter = (center) => {
    setSelectedCenter(center);
    setCurrentStep(2);
    // If invoice already sent, skip to step 3
    if (center.status === 'invoice_sent') {
      setInvoiceGenerated(true);
      setInvoiceSent(true);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setInvoiceGenerated(true);
    setIsProcessing(false);
  };

  const handleSendInvoice = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setInvoiceSent(true);
    setIsProcessing(false);
  };

  const handleProceedToPayment = () => {
    setCurrentStep(3);
  };

  const handleRecordPayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPaymentRecorded(true);
    setIsProcessing(false);
    setCurrentStep(4);
    setShowSuccessModal(true);
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setSelectedCenter(null);
    setInvoiceGenerated(false);
    setInvoiceSent(false);
    setPaymentRecorded(false);
    setPaymentMethod('bank');
    setPaymentReference('');
    setPaymentNotes('');
    setAttachmentName('');
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Process Settlement</h1>
              <p className="text-sm text-gray-500">Complete settlement workflow for partner centers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)} 
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium border-none outline-none cursor-pointer"
              disabled={currentStep > 1}
            >
              {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep > step.number ? 'bg-green-500 text-white' :
                    currentStep === step.number ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <Check size={20} /> : step.number}
                  </div>
                  <div className="hidden md:block">
                    <p className={`font-semibold text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Select Center */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Select Partner Center</h2>
                <p className="text-sm text-gray-500">Choose a center with pending settlement for {currentPeriod?.name}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
                <Search size={18} className="text-gray-400" />
                <input type="text" placeholder="Search centers..." className="border-none outline-none text-sm w-48" />
              </div>
            </div>

            <div className="grid gap-4">
              {pendingCenters.map((center) => (
                <div 
                  key={center.id} 
                  onClick={() => handleSelectCenter(center)}
                  className={`bg-white rounded-2xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                    center.status === 'invoice_sent' ? 'border-blue-200 hover:border-blue-400' : 'border-gray-100 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
                        {center.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{center.name}</h3>
                          <span className="text-lg">{center.flag}</span>
                          {getStatusBadge(center.status)}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} />{center.location}</p>
                        <p className="text-xs text-gray-400">Revenue Share: {center.tabseraShare}% TABSERA / {center.centerShare}% Center</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Gross Revenue</p>
                        <p className="text-xl font-bold text-gray-900">${center.grossRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">TABSERA Share</p>
                        <p className="text-xl font-bold text-green-600">${center.tabseraAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Students</p>
                        <p className="text-xl font-bold text-gray-700">{center.students}</p>
                      </div>
                      <ChevronRight size={24} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Review & Invoice */}
        {currentStep === 2 && selectedCenter && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Settlement Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Center Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
                      {selectedCenter.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{selectedCenter.name}</h3>
                        <span className="text-lg">{selectedCenter.flag}</span>
                      </div>
                      <p className="text-sm text-gray-500">{selectedCenter.location}</p>
                    </div>
                  </div>
                  <button onClick={() => { setCurrentStep(1); setSelectedCenter(null); setInvoiceGenerated(false); setInvoiceSent(false); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Change Center
                  </button>
                </div>

                {/* Revenue Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">${selectedCenter.grossRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Gross Revenue</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">${selectedCenter.tabseraAmount.toLocaleString()}</p>
                    <p className="text-xs text-green-600">TABSERA ({selectedCenter.tabseraShare}%)</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-600">${selectedCenter.centerAmount.toLocaleString()}</p>
                    <p className="text-xs text-purple-600">Center ({selectedCenter.centerShare}%)</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedCenter.students}</p>
                    <p className="text-xs text-blue-600">Students</p>
                  </div>
                </div>

                {/* Track Breakdown */}
                <h4 className="font-semibold text-gray-900 mb-3">Revenue by Program</h4>
                <table className="w-full mb-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 rounded-l-lg">Program</th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-3">Students</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">Gross</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3 rounded-r-lg">TABSERA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedCenter.tracks.map((track, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-medium text-gray-900">{track.name}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{track.students}</td>
                        <td className="px-4 py-3 text-right text-gray-600">${track.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">${track.tabsera.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Collection Rate Warning */}
                {selectedCenter.collectionRate < 90 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Collection Rate: {selectedCenter.collectionRate}%</p>
                      <p className="text-sm text-yellow-600">Some student payments are still pending. Settlement is based on expected revenue.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Invoice Actions */}
            <div className="space-y-6">
              {/* Invoice Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <h3 className="font-bold">Invoice</h3>
                  <p className="text-blue-100 text-sm">{currentPeriod?.name}</p>
                </div>
                <div className="p-5">
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-500">Amount Due</p>
                    <p className="text-4xl font-bold text-green-600">${selectedCenter.tabseraAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Due: {new Date(currentPeriod?.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>

                  {/* Invoice Status Steps */}
                  <div className="space-y-3 mb-6">
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${invoiceGenerated ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${invoiceGenerated ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {invoiceGenerated ? <Check size={16} /> : '1'}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${invoiceGenerated ? 'text-green-800' : 'text-gray-700'}`}>Generate Invoice</p>
                        {invoiceGenerated && <p className="text-xs text-green-600">{selectedCenter.invoiceNumber}</p>}
                      </div>
                      {!invoiceGenerated && (
                        <button 
                          onClick={handleGenerateInvoice}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isProcessing ? 'Generating...' : 'Generate'}
                        </button>
                      )}
                    </div>

                    <div className={`flex items-center gap-3 p-3 rounded-xl ${invoiceSent ? 'bg-green-50' : invoiceGenerated ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${invoiceSent ? 'bg-green-500 text-white' : invoiceGenerated ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                        {invoiceSent ? <Check size={16} /> : '2'}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${invoiceSent ? 'text-green-800' : invoiceGenerated ? 'text-gray-700' : 'text-gray-400'}`}>Send to Partner</p>
                        {invoiceSent && <p className="text-xs text-green-600">Sent to {selectedCenter.contactEmail}</p>}
                      </div>
                      {invoiceGenerated && !invoiceSent && (
                        <button 
                          onClick={handleSendInvoice}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isProcessing ? 'Sending...' : 'Send'}
                        </button>
                      )}
                    </div>

                    <div className={`flex items-center gap-3 p-3 rounded-xl ${invoiceSent ? 'bg-blue-50' : 'bg-gray-50 opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${invoiceSent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        3
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${invoiceSent ? 'text-blue-800' : 'text-gray-400'}`}>Await Payment</p>
                        {invoiceSent && <p className="text-xs text-blue-600">Waiting for partner payment</p>}
                      </div>
                    </div>
                  </div>

                  {invoiceSent && (
                    <button 
                      onClick={handleProceedToPayment}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Record Payment Received
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="font-semibold text-gray-900 mb-3">Partner Contact</h4>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">{selectedCenter.contactName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2"><Mail size={14} />{selectedCenter.contactEmail}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2"><Phone size={14} />{selectedCenter.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Record Payment */}
        {currentStep === 3 && selectedCenter && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <h3 className="font-bold text-lg">Record Settlement Payment</h3>
                <p className="text-green-100">{selectedCenter.name} - {currentPeriod?.name}</p>
              </div>

              <div className="p-6">
                {/* Amount Summary */}
                <div className="p-6 bg-green-50 rounded-xl mb-6 text-center">
                  <p className="text-sm text-green-600">Settlement Amount</p>
                  <p className="text-4xl font-bold text-green-700">${selectedCenter.tabseraAmount.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">Invoice #{selectedCenter.invoiceNumber}</p>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'bank', icon: Landmark, label: 'Bank Transfer' },
                      { id: 'zaad', icon: Phone, label: 'Zaad' },
                      { id: 'evc', icon: Phone, label: 'EVC Plus' },
                      { id: 'check', icon: FileCheck, label: 'Check' }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          paymentMethod === method.id 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <method.icon size={24} className={`mx-auto mb-2 ${paymentMethod === method.id ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium block">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference Number */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reference / Transaction Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g., TXN-12345678 or ZAAD-87654321"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Payment Date */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Attachment */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Proof (Optional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 transition-colors cursor-pointer">
                    {attachmentName ? (
                      <div className="flex items-center justify-center gap-2">
                        <Paperclip size={16} className="text-green-600" />
                        <span className="text-sm text-gray-700">{attachmentName}</span>
                        <button onClick={() => setAttachmentName('')} className="text-gray-400 hover:text-red-500">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload receipt or screenshot</p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG up to 5MB</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Any additional notes about this payment..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRecordPayment}
                    disabled={isProcessing || !paymentReference}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={18} className="animate-spin" />Processing...</>
                    ) : (
                      <><CheckCircle2 size={18} />Confirm & Complete</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && selectedCenter && (
          <div className="max-w-xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Settlement Complete!</h2>
              <p className="text-gray-500 mb-6">
                Payment of <span className="font-semibold text-green-600">${selectedCenter.tabseraAmount.toLocaleString()}</span> has been recorded for {selectedCenter.name}.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Invoice</p>
                    <p className="font-medium text-gray-900">{selectedCenter.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Period</p>
                    <p className="font-medium text-gray-900">{currentPeriod?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900 capitalize">{paymentMethod === 'evc' ? 'EVC Plus' : paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Reference</p>
                    <p className="font-medium text-gray-900">{paymentReference}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleStartNew}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                >
                  Process Another
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                  <Download size={18} />Download Receipt
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <Eye size={16} />View Settlement Details
              </button>
              <span className="text-gray-300">•</span>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <Send size={16} />Send Receipt to Partner
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 size={24} />
            <span className="font-semibold">Settlement processed successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
