/**
 * SessionRoom Page
 * Full-screen video session room with LiveKit integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { tutorsApi } from '../../api/tutors';
import VideoRoom from '../../components/video/VideoRoom';

export function SessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [isTutor, setIsTutor] = useState(false);

  // Join the session on mount
  useEffect(() => {
    let mounted = true;

    async function joinSession() {
      try {
        setLoading(true);
        setError(null);

        const response = await tutorsApi.joinSession(sessionId);

        if (!mounted) return;

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
        if (!mounted) return;
        console.error('Join session error:', err);
        setError(err.message || 'Failed to join session');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (sessionId && user) {
      joinSession();
    }

    return () => {
      mounted = false;
    };
  }, [sessionId, user]);

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
