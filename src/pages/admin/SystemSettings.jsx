/**
 * System Settings Page
 * Configure platform settings, integrations, and preferences
 */

import React, { useState, useEffect } from 'react';
import {
  Settings, Globe, Mail, CreditCard, Link2, Shield,
  Bell, Save, RefreshCw, CheckCircle, AlertCircle,
  Eye, EyeOff, Upload, Loader2, ExternalLink,
  Server, Palette, FileText, GraduationCap, DollarSign
} from 'lucide-react';
import { adminApi } from '../../api/admin';

function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'TABSERA Academy',
    siteTagline: 'Education That Transforms Lives',
    supportEmail: 'support@tabsera.com',
    supportPhone: '+252 63 456 7890',
    timezone: 'Africa/Mogadishu',
    dateFormat: 'MMM DD, YYYY',
    currency: 'USD',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUser: 'apikey',
    smtpPassword: '••••••••••••••••',
    fromEmail: 'noreply@tabsera.com',
    fromName: 'TABSERA Academy',
    enableEmailVerification: true,
    enableWelcomeEmail: true,
    enablePaymentReminders: true,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableMobileMoney: true,
    enableBankTransfer: true,
    enableCenterPayment: true,
    enableCardPayment: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    paymentReminderDays: 5,
    gracePeriodDays: 7,
  });

  const [edxSettings, setEdxSettings] = useState({
    edxBaseUrl: 'https://learn.tabsera.com',
    edxApiKey: 'edx_api_xxxxxxxxxxxxxx',
    enableAutoEnrollment: true,
    enableProgressSync: true,
    syncInterval: '30',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    adminNewEnrollment: true,
    adminNewApplication: true,
    adminPaymentReceived: true,
    adminSettlementDue: true,
    centerNewStudent: true,
    centerPaymentReceived: true,
    studentCourseUpdates: true,
    studentPaymentReminders: true,
  });

  const [tutoringSettings, setTutoringSettings] = useState({
    baseCreditPrice: '1.00',
    freelanceCommissionPercent: '40',
    minHourlyRate: '3.00',
    maxHourlyRate: '100.00',
    sessionDuration: '10',
    prepTime: '10',
  });

  // Fetch settings on load
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsFetching(true);
      const response = await adminApi.getSettings();
      if (response.settings) {
        const settingsMap = {};
        response.settings.forEach(s => {
          settingsMap[s.key] = s.value;
        });

        // Update tutoring settings from API
        setTutoringSettings(prev => ({
          baseCreditPrice: settingsMap.baseCreditPrice || prev.baseCreditPrice,
          freelanceCommissionPercent: settingsMap.freelanceCommissionPercent || prev.freelanceCommissionPercent,
          minHourlyRate: settingsMap.minHourlyRate || prev.minHourlyRate,
          maxHourlyRate: settingsMap.maxHourlyRate || prev.maxHourlyRate,
          sessionDuration: settingsMap.sessionDuration || prev.sessionDuration,
          prepTime: settingsMap.prepTime || prev.prepTime,
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      // Save tutoring settings to the backend
      if (activeTab === 'tutoring') {
        const settings = [
          { key: 'baseCreditPrice', value: tutoringSettings.baseCreditPrice, description: 'Base price per credit in USD' },
          { key: 'freelanceCommissionPercent', value: tutoringSettings.freelanceCommissionPercent, description: 'Platform commission percentage for freelance tutors' },
          { key: 'minHourlyRate', value: tutoringSettings.minHourlyRate, description: 'Minimum hourly rate for freelance tutors (USD)' },
          { key: 'maxHourlyRate', value: tutoringSettings.maxHourlyRate, description: 'Maximum hourly rate for freelance tutors (USD)' },
          { key: 'sessionDuration', value: tutoringSettings.sessionDuration, description: 'Default session duration in minutes' },
          { key: 'prepTime', value: tutoringSettings.prepTime, description: 'Prep time between sessions in minutes' },
        ];
        await adminApi.updateSettings(settings);
      }
      setSuccessMessage('Settings saved successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'tutoring', label: 'Tutoring', icon: GraduationCap },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'edx', label: 'EdX Integration', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500">Configure platform settings and integrations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {isFetching && (
        <div className="mb-6 flex items-center gap-3 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          <p>Loading settings...</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings(s => ({ ...s, siteName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={generalSettings.siteTagline}
                        onChange={(e) => setGeneralSettings(s => ({ ...s, siteTagline: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                      <input
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) => setGeneralSettings(s => ({ ...s, supportEmail: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                      <input
                        type="tel"
                        value={generalSettings.supportPhone}
                        onChange={(e) => setGeneralSettings(s => ({ ...s, supportPhone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings(s => ({ ...s, timezone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Africa/Mogadishu">Africa/Mogadishu (EAT)</option>
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        value={generalSettings.dateFormat}
                        onChange={(e) => setGeneralSettings(s => ({ ...s, dateFormat: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MMM DD, YYYY">Jan 15, 2026</option>
                        <option value="DD/MM/YYYY">15/01/2026</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings(s => ({ ...s, currency: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="KES">KES (KSh)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Palette size={32} className="text-gray-400" />
                      </div>
                      <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Upload size={16} />Upload New Logo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tutoring Settings */}
            {activeTab === 'tutoring' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Tutoring Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-purple-50 rounded-xl flex items-start gap-3">
                    <GraduationCap size={20} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Tutor Pricing Configuration</p>
                      <p className="text-sm text-purple-700">Configure credit pricing and commission rates for freelance tutors.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Session Configuration</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration (minutes)</label>
                        <input
                          type="number"
                          value={tutoringSettings.sessionDuration}
                          onChange={(e) => setTutoringSettings(s => ({ ...s, sessionDuration: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Base session duration (1 credit = 1 session)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (minutes)</label>
                        <input
                          type="number"
                          value={tutoringSettings.prepTime}
                          onChange={(e) => setTutoringSettings(s => ({ ...s, prepTime: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Buffer time between sessions</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Credit Pricing</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base Credit Price (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={tutoringSettings.baseCreditPrice}
                            onChange={(e) => setTutoringSettings(s => ({ ...s, baseCreditPrice: e.target.value }))}
                            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Price per credit for fulltime tutors (1 credit = 1 session)</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Freelance Tutor Settings</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tutoringSettings.freelanceCommissionPercent}
                            onChange={(e) => setTutoringSettings(s => ({ ...s, freelanceCommissionPercent: e.target.value }))}
                            className="w-full pr-8 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Commission taken from freelance tutor earnings</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Hourly Rate (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.50"
                            value={tutoringSettings.minHourlyRate}
                            onChange={(e) => setTutoringSettings(s => ({ ...s, minHourlyRate: e.target.value }))}
                            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum rate freelance tutors can set</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Hourly Rate (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.50"
                            value={tutoringSettings.maxHourlyRate}
                            onChange={(e) => setTutoringSettings(s => ({ ...s, maxHourlyRate: e.target.value }))}
                            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Maximum rate freelance tutors can set</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Pricing Preview</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      {/* Session Timing */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Session Timing</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Slot interval:</p>
                            <p className="font-semibold text-gray-900">
                              {parseInt(tutoringSettings.sessionDuration) + parseInt(tutoringSettings.prepTime)} min
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Sessions per hour:</p>
                            <p className="font-semibold text-gray-900">
                              {Math.floor(60 / (parseInt(tutoringSettings.sessionDuration) + parseInt(tutoringSettings.prepTime)))} sessions
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Slots start at:</p>
                            <p className="font-semibold text-gray-900">:00, :20, :40</p>
                          </div>
                        </div>
                      </div>

                      {/* Duration Options */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Duration Options (Fixed)</p>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          {[
                            { slots: 1, label: '10 min', credits: 1 },
                            { slots: 2, label: '20 min', credits: 2 },
                            { slots: 4, label: '40 min', credits: 4 },
                            { slots: 6, label: '60 min', credits: 6 },
                          ].map(opt => (
                            <div key={opt.slots} className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                              <p className="font-semibold text-gray-900">{opt.label}</p>
                              <p className="text-xs text-gray-500">{opt.credits} credit{opt.credits > 1 ? 's' : ''}</p>
                              <p className="text-xs text-blue-600 font-medium">${(parseFloat(tutoringSettings.baseCreditPrice) * opt.credits).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Freelance Tutor Example */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Freelance Tutor Example (at ${tutoringSettings.minHourlyRate}/hour)</p>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Credit factor:</p>
                            <p className="font-semibold text-gray-900">
                              {Math.ceil(parseFloat(tutoringSettings.minHourlyRate) / (parseFloat(tutoringSettings.baseCreditPrice) * Math.floor(60 / (parseInt(tutoringSettings.sessionDuration) + parseInt(tutoringSettings.prepTime)))))}x per {tutoringSettings.sessionDuration} min session
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Student pays (10 min):</p>
                            <p className="font-semibold text-gray-900">
                              ${(parseFloat(tutoringSettings.baseCreditPrice) * Math.ceil(parseFloat(tutoringSettings.minHourlyRate) / (parseFloat(tutoringSettings.baseCreditPrice) * Math.floor(60 / (parseInt(tutoringSettings.sessionDuration) + parseInt(tutoringSettings.prepTime)))))).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tutor net (after {tutoringSettings.freelanceCommissionPercent}%):</p>
                            <p className="font-semibold text-green-600">
                              ${(parseFloat(tutoringSettings.minHourlyRate) * (1 - parseFloat(tutoringSettings.freelanceCommissionPercent) / 100)).toFixed(2)}/hour
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Email Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700"><strong>SMTP Provider:</strong> Configure your email service for transactional emails.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                      <input type="text" value={emailSettings.smtpHost} onChange={(e) => setEmailSettings(s => ({ ...s, smtpHost: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                      <input type="text" value={emailSettings.smtpPort} onChange={(e) => setEmailSettings(s => ({ ...s, smtpPort: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                      <input type="email" value={emailSettings.fromEmail} onChange={(e) => setEmailSettings(s => ({ ...s, fromEmail: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                      <input type="text" value={emailSettings.fromName} onChange={(e) => setEmailSettings(s => ({ ...s, fromName: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'enableEmailVerification', label: 'Email verification for new accounts' },
                        { key: 'enableWelcomeEmail', label: 'Send welcome email to new students' },
                        { key: 'enablePaymentReminders', label: 'Automated payment reminders' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={emailSettings[item.key]} onChange={(e) => setEmailSettings(s => ({ ...s, [item.key]: e.target.checked }))} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Mail size={16} />Send Test Email
                  </button>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'enableMobileMoney', label: 'Mobile Money (Zaad, EVC, M-Pesa, Telebirr)' },
                        { key: 'enableBankTransfer', label: 'Bank Transfer' },
                        { key: 'enableCenterPayment', label: 'Pay at Learning Center' },
                        { key: 'enableCardPayment', label: 'Credit/Debit Card (Stripe)' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={paymentSettings[item.key]} onChange={(e) => setPaymentSettings(s => ({ ...s, [item.key]: e.target.checked }))} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {paymentSettings.enableCardPayment && (
                    <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                      <h4 className="font-medium text-gray-900">Stripe Configuration</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                        <input type="text" value={paymentSettings.stripePublicKey} onChange={(e) => setPaymentSettings(s => ({ ...s, stripePublicKey: e.target.value }))} placeholder="pk_live_..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                        <div className="relative">
                          <input type={showApiKey ? 'text' : 'password'} value={paymentSettings.stripeSecretKey} onChange={(e) => setPaymentSettings(s => ({ ...s, stripeSecretKey: e.target.value }))} placeholder="sk_live_..." className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                          <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Payment Reminders</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reminder days before due</label>
                        <input type="number" value={paymentSettings.paymentReminderDays} onChange={(e) => setPaymentSettings(s => ({ ...s, paymentReminderDays: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Grace period (days)</label>
                        <input type="number" value={paymentSettings.gracePeriodDays} onChange={(e) => setPaymentSettings(s => ({ ...s, gracePeriodDays: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EdX Integration */}
            {activeTab === 'edx' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">EdX Integration</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                    <Server size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Open edX Platform</p>
                      <p className="text-sm text-blue-700">Configure connection to your Open edX instance.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EdX Base URL</label>
                    <input type="url" value={edxSettings.edxBaseUrl} onChange={(e) => setEdxSettings(s => ({ ...s, edxBaseUrl: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <div className="relative">
                      <input type={showApiKey ? 'text' : 'password'} value={edxSettings.edxApiKey} onChange={(e) => setEdxSettings(s => ({ ...s, edxApiKey: e.target.value }))} className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sync Interval</label>
                    <select value={edxSettings.syncInterval} onChange={(e) => setEdxSettings(s => ({ ...s, syncInterval: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                      <option value="60">Every hour</option>
                    </select>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Integration Options</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={edxSettings.enableAutoEnrollment} onChange={(e) => setEdxSettings(s => ({ ...s, enableAutoEnrollment: e.target.checked }))} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-gray-700">Auto-enroll students in EdX on payment</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={edxSettings.enableProgressSync} onChange={(e) => setEdxSettings(s => ({ ...s, enableProgressSync: e.target.checked }))} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-gray-700">Sync student progress from EdX</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <RefreshCw size={16} />Test Connection
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <ExternalLink size={16} />Open EdX Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Notification Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Admin Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'adminNewEnrollment', label: 'New student enrollments' },
                        { key: 'adminNewApplication', label: 'New partner applications' },
                        { key: 'adminPaymentReceived', label: 'Payment received' },
                        { key: 'adminSettlementDue', label: 'Settlement due reminders' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={notificationSettings[item.key]} onChange={(e) => setNotificationSettings(s => ({ ...s, [item.key]: e.target.checked }))} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Center Admin Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'centerNewStudent', label: 'New student at their center' },
                        { key: 'centerPaymentReceived', label: 'Payment from students' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={notificationSettings[item.key]} onChange={(e) => setNotificationSettings(s => ({ ...s, [item.key]: e.target.checked }))} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Student Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'studentCourseUpdates', label: 'Course updates' },
                        { key: 'studentPaymentReminders', label: 'Payment reminders' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={notificationSettings[item.key]} onChange={(e) => setNotificationSettings(s => ({ ...s, [item.key]: e.target.checked }))} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Security Best Practices</p>
                      <p className="text-sm text-yellow-700">Ensure strong passwords, enable 2FA, and review access logs regularly.</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Password Policy</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-gray-700">Require minimum 8 characters</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-gray-700">Require uppercase and lowercase</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-gray-700">Require at least one number</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Session Settings</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (min)</label>
                        <input type="number" defaultValue="60" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                        <input type="number" defaultValue="5" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-gray-700">Require 2FA for admin accounts</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-gray-700">Require 2FA for center admins</span>
                      </label>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FileText size={16} />View Access Logs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
