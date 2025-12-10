import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Users, CheckCircle2, AlertCircle, Download, FileText } from 'lucide-react';

const TrackEnrollment = () => {
  const [step, setStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');

  const centers = [
    { id: 'aqoonyahan', name: 'Aqoonyahan School', location: 'Hargeisa', students: 60 },
    { id: 'sunrise', name: 'Sunrise International', location: 'Nairobi', students: 120 },
    { id: 'alnoor', name: 'Al-Noor Academy', location: 'Mogadishu', students: 45 },
  ];

  const tracks = [
    { id: 'igcse', name: 'Cambridge IGCSE Full Program', fee: 80 },
    { id: 'islamic', name: 'ZAAD Academy Islamic Studies', fee: 25 },
    { id: 'business', name: 'Business Track', fee: 45 },
    { id: 'esl', name: 'ESL Intensive', fee: 30 },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/students" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Enrollment</h1>
          <p className="text-gray-500">Enroll multiple students to a track at once</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <CheckCircle2 size={20} /> : s}
                </div>
                <span className={`font-medium ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 ? 'Select Center' : s === 2 ? 'Choose Track' : 'Upload Students'}
                </span>
              </div>
              {i < 2 && <div className={`flex-1 h-1 mx-4 rounded-full ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Select Learning Center</h3>
            <div className="space-y-3">
              {centers.map((center) => (
                <button
                  key={center.id}
                  onClick={() => { setSelectedCenter(center.id); setStep(2); }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-400 ${selectedCenter === center.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{center.name}</p>
                      <p className="text-sm text-gray-500">{center.location} • {center.students} students</p>
                    </div>
                    <Users size={24} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Choose Track/Program</h3>
            <div className="space-y-3">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => { setSelectedTrack(track.id); setStep(3); }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-400 ${selectedTrack === track.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{track.name}</p>
                      <p className="text-sm text-gray-500">${track.fee}/month per student</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-4 text-sm text-blue-600 font-medium">← Back to center selection</button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Upload Student List</h3>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 hover:border-blue-400 transition-colors cursor-pointer">
              <Upload size={40} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium mb-2">Drag & drop your CSV file here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Select File</button>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">CSV Format Requirements</p>
                  <p className="text-sm text-blue-600">Columns: first_name, last_name, email, guardian_name, guardian_phone, classroom</p>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 text-blue-600 font-medium mb-6">
              <Download size={16} />Download CSV Template
            </button>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">Back</button>
              <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold">Upload & Enroll</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackEnrollment;
