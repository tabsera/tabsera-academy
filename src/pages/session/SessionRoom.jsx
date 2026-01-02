/**
 * SessionRoom Page
 * Full-screen video session room with LiveKit integration
 */

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, ArrowLeft, Video, VideoOff, Mic, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { tutorsApi } from '../../api/tutors';
import VideoRoom from '../../components/video/VideoRoom';

export function SessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showConsent, setShowConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [isTutor, setIsTutor] = useState(false);

  // Join the session after consent
  const handleProceed = useCallback(async () => {
    try {
      setShowConsent(false);
      setLoading(true);
      setError(null);

      const response = await tutorsApi.joinSession(sessionId);

      if (response.success) {
        setRoomData({
          token: response.token,
          serverUrl: response.wsUrl,
          roomName: response.roomName,
          isRecording: response.isRecording,
          session: response.session,
        });

        // Determine if current user is the tutor
        setIsTutor(response.session?.tutor?.id === user?.id);
      } else {
        setError(response.message || 'Failed to join session');
      }
    } catch (err) {
      console.error('Join session error:', err);
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  // Handle cancel - go back
  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle leaving the session
  const handleLeave = useCallback(async () => {
    try {
      await tutorsApi.leaveSession(sessionId, false);
    } catch (err) {
      console.error('Leave session error:', err);
    }
    navigate(-1); // Go back
  }, [sessionId, navigate]);

  // Handle ending the session (tutor only)
  const handleEndSession = useCallback(async () => {
    try {
      await tutorsApi.leaveSession(sessionId, true);
      navigate('/student/sessions'); // Or tutor sessions page
    } catch (err) {
      console.error('End session error:', err);
      setError('Failed to end session');
    }
  }, [sessionId, navigate]);

  // Recording consent screen
  if (showConsent) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Recording Notice
          </h2>

          <p className="text-gray-300 text-center mb-6">
            Please read before joining the session
          </p>

          {/* Notice content */}
          <div className="bg-gray-900/50 rounded-xl p-5 mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                This tutoring session will be <span className="text-white font-medium">recorded</span> for quality assurance and learning purposes.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mic className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-white font-medium">Audio will be recorded</span> throughout the session to capture the tutoring content.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <VideoOff className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                You can <span className="text-white font-medium">turn off your camera</span> at any time if you prefer not to have your video recorded.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Proceed
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-4">
            By proceeding, you consent to being recorded during this session.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Joining Session</h2>
        <p className="text-gray-400">Connecting to video room...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Join</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No room data
  if (!roomData) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Session Not Ready</h2>
        <p className="text-gray-400 mb-6">The session could not be initialized.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  // Video room
  return (
    <VideoRoom
      token={roomData.token}
      serverUrl={roomData.serverUrl}
      sessionInfo={roomData.session}
      isTutor={isTutor}
      isRecording={roomData.isRecording}
      onLeave={handleLeave}
      onEndSession={handleEndSession}
    />
  );
}

export default SessionRoom;
