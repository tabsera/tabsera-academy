import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, FileText, Save, Check, Edit2,
  Calendar, DollarSign, Percent, Clock, Landmark, Phone,
  Mail, MapPin, AlertCircle, CheckCircle2, History
} from 'lucide-react';

const CenterContractConfiguration = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    tabseraShare: 50,
    centerShare: 50,
    settlementFrequency: 'monthly',
    dueDay: 15,
    currency: 'USD',
    startDate: '2025-09-01',
    endDate: '2027-08-31',
    autoRenew: true,
    contactName: 'Ahmed Hassan',
    contactEmail: 'ahmed@aqoonyahan.edu.so',
    contactPhone: '+252 61 123 4567',
    bankName: 'Dahabshiil Bank',
    accountNumber: '1234567890',
    mobileProvider: 'Zaad',
    mobileNumber: '+252 63 123 4567'
  });

  const center = {
    id: 'aqoonyahan',
    name: 'Aqoonyahan School',
    location: 'Hargeisa, Somalia',
    flag: '🇸🇴',
    logo: 'AS',
    status: 'active'
  };

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue Share' },
    { id: 'settlement', label: 'Settlement Terms' },
    { id: 'banking', label: 'Banking & Payment' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/partners" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
              {center.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{center.name}</h1>
                <span className="text-xl">{center.flag}</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
              </div>
              <p className="text-sm text-gray-500">Contract Configuration</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 size={16} />
              Saved successfully
            </span>
          )}
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                <Save size={16} />Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
              <Edit2 size={16} />Edit Contract
            </button>
          )}
        </div>
      </div>

      {/* Center Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{formData.tabseraShare}%</p>
              <p className="text-xs text-gray-500">TABSERA Share</p>
            </div>
            <div className="text-2xl text-gray-300">:</div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{formData.centerShare}%</p>
              <p className="text-xs text-gray-500">Center Share</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>Monthly Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span>Due on {formData.dueDay}th</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-400" />
              <span>{formData.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900">Contract Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Status</label>
                <select disabled={!isEditing} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl">
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Renewal</label>
                <div className="flex items-center gap-3">
                  <button 
                    disabled={!isEditing}
                    onClick={() => setFormData({...formData, autoRenew: !formData.autoRenew})}
                    className={`w-12 h-6 rounded-full transition-colors ${formData.autoRenew ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.autoRenew ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-600">{formData.autoRenew ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input type="date" value={formData.startDate} disabled={!isEditing} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input type="date" value={formData.endDate} disabled={!isEditing} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
            </div>
            <div className="pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-4">Finance Contact</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <input type="text" value={formData.contactName} disabled={!isEditing} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={formData.contactEmail} disabled={!isEditing} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={formData.contactPhone} disabled={!isEditing} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900">Revenue Share Configuration</h3>
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">TABSERA Academy</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={formData.tabseraShare} 
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, tabseraShare: Number(e.target.value), centerShare: 100 - Number(e.target.value)})}
                      className="w-24 text-center text-3xl font-bold text-blue-600 border border-gray-200 rounded-xl py-2"
                    />
                    <span className="text-2xl text-gray-400">%</span>
                  </div>
                </div>
                <div className="text-3xl text-gray-300">:</div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Learning Center</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={formData.centerShare} 
                      disabled={!isEditing}
                      onChange={(e) => setFormData({...formData, centerShare: Number(e.target.value), tabseraShare: 100 - Number(e.target.value)})}
                      className="w-24 text-center text-3xl font-bold text-purple-600 border border-gray-200 rounded-xl py-2"
                    />
                    <span className="text-2xl text-gray-400">%</span>
                  </div>
                </div>
              </div>
              {isEditing && (
                <input 
                  type="range" 
                  min="30" 
                  max="70" 
                  value={formData.tabseraShare}
                  onChange={(e) => setFormData({...formData, tabseraShare: Number(e.target.value), centerShare: 100 - Number(e.target.value)})}
                  className="w-full mt-6"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'settlement' && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900">Settlement Terms</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Frequency</label>
                <div className="flex gap-3">
                  <button 
                    disabled={!isEditing}
                    onClick={() => setFormData({...formData, settlementFrequency: 'monthly'})}
                    className={`flex-1 py-3 rounded-xl font-medium border-2 ${formData.settlementFrequency === 'monthly' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
                  >
                    Monthly
                  </button>
                  <button 
                    disabled={!isEditing}
                    onClick={() => setFormData({...formData, settlementFrequency: 'quarterly'})}
                    className={`flex-1 py-3 rounded-xl font-medium border-2 ${formData.settlementFrequency === 'quarterly' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
                  >
                    Quarterly
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <select 
                  value={formData.dueDay} 
                  disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, dueDay: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                >
                  <option value={1}>1st of the month</option>
                  <option value={5}>5th of the month</option>
                  <option value={10}>10th of the month</option>
                  <option value={15}>15th of the month</option>
                  <option value={20}>20th of the month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select 
                  value={formData.currency} 
                  disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="ETB">ETB - Ethiopian Birr</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900">Payment Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Landmark size={20} className="text-blue-600" />
                  <span className="font-medium">Bank Transfer</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                    <input type="text" value={formData.bankName} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                    <input type="text" value={formData.accountNumber} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Phone size={20} className="text-green-600" />
                  <span className="font-medium">Mobile Money</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Provider</label>
                    <select value={formData.mobileProvider} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option>Zaad</option>
                      <option>EVC Plus</option>
                      <option>M-Pesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
                    <input type="tel" value={formData.mobileNumber} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900">Contract Change History</h3>
            <div className="space-y-4">
              {[
                { action: 'Contract Created', details: 'Initial 50/50 revenue share agreement', date: 'Sep 1, 2025', user: 'TABSERA Admin' },
                { action: 'Due Date Updated', details: 'Changed from 10th to 15th of month', date: 'Oct 15, 2025', user: 'TABSERA Admin' },
                { action: 'Banking Details Updated', details: 'Added Zaad mobile money option', date: 'Nov 3, 2025', user: 'Ahmed Hassan' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <History size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.action}</p>
                    <p className="text-sm text-gray-600">{item.details}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.date} • {item.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterContractConfiguration;
