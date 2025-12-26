/**
 * Track Enrollment Page
 * Bulk enroll students to a track via CSV upload
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import {
  ArrowLeft, Upload, Users, CheckCircle2, AlertCircle, Download,
  FileText, Loader2, X, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';

const TrackEnrollment = () => {
  const [step, setStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Data from API
  const [centers, setCenters] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // CSV handling
  const [csvFile, setCsvFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [parseError, setParseError] = useState(null);
  const fileInputRef = useRef(null);

  // Enrollment state
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState(null);

  // Fetch centers and tracks on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [centersRes, tracksRes] = await Promise.all([
        adminApi.getCenters(),
        adminApi.getTracks({ status: 'published', limit: 100 })
      ]);
      setCenters(centersRes.centers || []);
      setTracks(tracksRes.tracks || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // CSV Template content
  const csvTemplate = `first_name,last_name,email,guardian_name,guardian_phone,classroom
John,Doe,john.doe@example.com,Jane Doe,+252612345678,Grade 10A
Mary,Smith,mary.smith@example.com,Bob Smith,+252612345679,Grade 10B`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_enrollment_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const requiredHeaders = ['first_name', 'last_name', 'email'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const students = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const student = {};
      headers.forEach((header, index) => {
        student[header] = values[index];
      });

      // Validate required fields
      if (!student.first_name || !student.last_name || !student.email) {
        errors.push(`Row ${i + 1}: Missing required fields (first_name, last_name, or email)`);
        continue;
      }

      // Basic email validation
      if (!student.email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email format`);
        continue;
      }

      students.push({
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        guardianName: student.guardian_name || '',
        guardianPhone: student.guardian_phone || '',
        classroom: student.classroom || '',
      });
    }

    if (errors.length > 0 && students.length === 0) {
      throw new Error(`All rows have errors:\n${errors.join('\n')}`);
    }

    return { students, errors };
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = parseCSV(e.target.result);
        setParsedStudents(result.students);
        if (result.errors.length > 0) {
          setParseError(`${result.errors.length} rows skipped due to errors`);
        }
      } catch (err) {
        setParseError(err.message);
        setParsedStudents([]);
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const clearFile = () => {
    setCsvFile(null);
    setParsedStudents([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEnroll = async () => {
    if (!selectedCenter || !selectedTrack || parsedStudents.length === 0) return;

    try {
      setEnrolling(true);
      setEnrollmentResult(null);

      const result = await adminApi.bulkEnroll({
        centerId: selectedCenter.id,
        trackId: selectedTrack.id,
        students: parsedStudents,
        sendWelcomeEmail: true,
      });

      setEnrollmentResult(result);
      setStep(4); // Go to results step
    } catch (err) {
      console.error('Error enrolling students:', err);
      setEnrollmentResult({
        success: false,
        error: err.message || 'Failed to enroll students',
      });
    } finally {
      setEnrolling(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedCenter(null);
    setSelectedTrack(null);
    setCsvFile(null);
    setParsedStudents([]);
    setParseError(null);
    setEnrollmentResult(null);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[1, 2, 3, 4].map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <CheckCircle2 size={20} /> : s}
                </div>
                <span className={`font-medium hidden sm:block ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 ? 'Select Center' : s === 2 ? 'Choose Track' : s === 3 ? 'Upload CSV' : 'Results'}
                </span>
              </div>
              {i < 3 && <div className={`flex-1 h-1 mx-4 rounded-full ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Select Center */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Select Learning Center</h3>
            {centers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No learning centers available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {centers.map((center) => (
                  <button
                    key={center.id}
                    onClick={() => { setSelectedCenter(center); setStep(2); }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-400 ${
                      selectedCenter?.id === center.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{center.name}</p>
                        <p className="text-sm text-gray-500">
                          {center.city}{center.country ? `, ${center.country}` : ''}
                          {center._count?.users > 0 && ` • ${center._count.users} students`}
                        </p>
                      </div>
                      <Users size={24} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Choose Track */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Choose Track/Program</h3>
              <span className="text-sm text-gray-500">
                Center: <strong>{selectedCenter?.name}</strong>
              </span>
            </div>
            {tracks.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tracks available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => { setSelectedTrack(track); setStep(3); }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-400 ${
                      selectedTrack?.id === track.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{track.title}</p>
                        <p className="text-sm text-gray-500">
                          {track._count?.courses || 0} courses
                          {track.price > 0 && ` • $${parseFloat(track.price).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setStep(1)}
              className="mt-4 text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              ← Back to center selection
            </button>
          </div>
        )}

        {/* Step 3: Upload CSV */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Upload Student List</h3>
              <div className="text-sm text-gray-500 text-right">
                <div>Center: <strong>{selectedCenter?.name}</strong></div>
                <div>Track: <strong>{selectedTrack?.title}</strong></div>
              </div>
            </div>

            {/* File Upload Area */}
            {!csvFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={40} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium mb-2">Drag & drop your CSV file here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{csvFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {parsedStudents.length} students parsed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Preview parsed students */}
                {parsedStudents.length > 0 && (
                  <div className="mt-4 max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Classroom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedStudents.slice(0, 5).map((student, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">{student.firstName} {student.lastName}</td>
                            <td className="px-3 py-2 text-gray-500">{student.email}</td>
                            <td className="px-3 py-2 text-gray-500">{student.classroom || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedStudents.length > 5 && (
                      <p className="text-center text-sm text-gray-500 mt-2">
                        ... and {parsedStudents.length - 5} more students
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Parse Error */}
            {parseError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">CSV Parse Error</p>
                    <p className="text-sm text-red-600 whitespace-pre-wrap">{parseError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CSV Format Info */}
            <div className="p-4 bg-blue-50 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">CSV Format Requirements</p>
                  <p className="text-sm text-blue-600">
                    Required columns: <code className="bg-blue-100 px-1 rounded">first_name</code>,
                    <code className="bg-blue-100 px-1 rounded ml-1">last_name</code>,
                    <code className="bg-blue-100 px-1 rounded ml-1">email</code>
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Optional: <code className="bg-blue-100 px-1 rounded">guardian_name</code>,
                    <code className="bg-blue-100 px-1 rounded ml-1">guardian_phone</code>,
                    <code className="bg-blue-100 px-1 rounded ml-1">classroom</code>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-blue-600 font-medium mb-6 hover:text-blue-700"
            >
              <Download size={16} />
              Download CSV Template
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                Back
              </button>
              <button
                onClick={handleEnroll}
                disabled={parsedStudents.length === 0 || enrolling}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Enroll {parsedStudents.length} Students
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && enrollmentResult && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {enrollmentResult.success !== false ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Enrollment Complete!</h3>
                  <p className="text-gray-500 mt-2">
                    Students have been enrolled to <strong>{selectedTrack?.title}</strong>
                  </p>
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{enrollmentResult.created || 0}</p>
                    <p className="text-sm text-green-700">New Students</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{enrollmentResult.enrolled || 0}</p>
                    <p className="text-sm text-blue-700">Enrollments</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-600">{enrollmentResult.existing || 0}</p>
                    <p className="text-sm text-gray-700">Already Existed</p>
                  </div>
                </div>

                {/* Errors if any */}
                {enrollmentResult.errors && enrollmentResult.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Some issues occurred</p>
                        <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                          {enrollmentResult.errors.slice(0, 5).map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                        {enrollmentResult.errors.length > 5 && (
                          <p className="text-sm text-yellow-600 mt-2">
                            ... and {enrollmentResult.errors.length - 5} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Enrollment Failed</h3>
                  <p className="text-gray-500 mt-2">{enrollmentResult.error}</p>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetWizard}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Enroll More Students
              </button>
              <Link
                to="/admin/students"
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 text-center"
              >
                View Students
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackEnrollment;
