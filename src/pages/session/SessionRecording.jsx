/**
 * SessionRecording Page
 * View recorded session with Vimeo player
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle, Video } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { tutorsApi } from '../../api/tutors';
import RecordingPlayer from '../../components/video/RecordingPlayer';
import Layout from '../../components/Layout';

export function SessionRecording() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(null);

  // Fetch recording details
  useEffect(() => {
    let mounted = true;

    async function fetchRecording() {
      try {
        setLoading(true);
        setError(null);

        const response = await tutorsApi.getRecording(sessionId);

        if (!mounted) return;

        if (response.success) {
          setRecording(response.recording);
        } else {
          setError(response.message || 'Failed to load recording');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Fetch recording error:', err);
        setError(err.message || 'Failed to load recording');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (sessionId) {
      fetchRecording();
    }

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Recording</h2>
          <p className="text-gray-500 mt-2">Please wait...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Recording</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // No recording found
  if (!recording) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Recording Available</h2>
            <p className="text-gray-600 mb-6">
              This session does not have a recording or the recording is not yet available.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </button>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Session Recording
          </h1>
          <p className="text-gray-500 mt-1">
            Review your tutoring session
          </p>
        </div>

        {/* Recording player */}
        <RecordingPlayer recording={recording} showDetails={true} />

        {/* Related sessions link */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Sessions</h3>
          <div className="flex gap-4">
            <Link
              to="/student/sessions"
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            >
              View All My Sessions
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SessionRecording;
