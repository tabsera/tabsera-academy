import React, { useState } from 'react';
import {
  Users, BookOpen, TrendingUp, CheckCircle2, Clock, AlertTriangle,
  Search, Filter, ChevronRight, BarChart3, Award
} from 'lucide-react';

const TeacherProgressTracker = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState('all');

  const stats = {
    totalStudents: 60,
    onTrack: 48,
    needsAttention: 8,
    atRisk: 4,
    avgProgress: 72
  };

  const students = [
    { id: 1, name: 'Ahmed Hassan', track: 'IGCSE Full', classroom: 'Boys A', progress: 85, status: 'on-track', lastActivity: '2 hours ago' },
    { id: 2, name: 'Fatima Omar', track: 'IGCSE Full', classroom: 'Girls A', progress: 78, status: 'on-track', lastActivity: '1 day ago' },
    { id: 3, name: 'Mohamed Ali', track: 'Islamic Studies', classroom: 'Boys B', progress: 92, status: 'on-track', lastActivity: '3 hours ago' },
    { id: 4, name: 'Ibrahim Farah', track: 'IGCSE Full', classroom: 'Boys A', progress: 45, status: 'at-risk', lastActivity: '1 week ago' },
    { id: 5, name: 'Zahra Ahmed', track: 'Islamic Studies', classroom: 'Girls B', progress: 62, status: 'needs-attention', lastActivity: '3 days ago' },
    { id: 6, name: 'Yusuf Ibrahim', track: 'IGCSE Full', classroom: 'Boys B', progress: 71, status: 'on-track', lastActivity: '1 day ago' },
  ];

  const getStatusBadge = (status) => {
    if (status === 'on-track') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} />On Track</span>;
    if (status === 'needs-attention') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} />Needs Attention</span>;
    if (status === 'at-risk') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><AlertTriangle size={12} />At Risk</span>;
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Progress Tracker</h1>
        <p className="text-gray-500">Monitor student progress across all tracks and classrooms</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-blue-500" />
            <span className="text-sm text-gray-500">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-green-500" />
            <span className="text-sm text-gray-500">On Track</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-yellow-500" />
            <span className="text-sm text-gray-500">Needs Attention</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="text-sm text-gray-500">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-purple-500" />
            <span className="text-sm text-gray-500">Avg Progress</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg flex-1 max-w-xs">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search student..." className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none">
          <option value="all">All Classrooms</option>
          <option value="boys-a">Boys A</option>
          <option value="boys-b">Boys B</option>
          <option value="girls-a">Girls A</option>
          <option value="girls-b">Girls B</option>
        </select>
        <select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm border-none">
          <option value="all">All Tracks</option>
          <option value="igcse">IGCSE Full</option>
          <option value="islamic">Islamic Studies</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Track</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Classroom</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Progress</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      student.status === 'on-track' ? 'bg-green-500' :
                      student.status === 'needs-attention' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">{student.track}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{student.classroom}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getProgressColor(student.progress)} rounded-full`} style={{ width: `${student.progress}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">{getStatusBadge(student.status)}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{student.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherProgressTracker;
