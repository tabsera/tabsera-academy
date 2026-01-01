/**
 * VideoRoom Component
 * Main video conferencing room using LiveKit
 */

import React, { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  LayoutContextProvider,
  useTracks,
  useRoomContext,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { PanelRightOpen, PanelRightClose, Video, VideoOff, Circle } from 'lucide-react';
import CollaborativeWhiteboard from './CollaborativeWhiteboard';

export function VideoRoom({
  token,
  serverUrl,
  sessionInfo,
  isTutor,
  isRecording,
  onLeave,
  onEndSession,
}) {
  const [showWhiteboard, setShowWhiteboard] = useState(true);
  const [connectionState, setConnectionState] = useState('connecting');

  const handleDisconnected = useCallback(() => {
    setConnectionState('disconnected');
    onLeave?.();
  }, [onLeave]);

  const handleConnected = useCallback(() => {
    setConnectionState('connected');
  }, []);

  const handleError = useCallback((error) => {
    console.error('LiveKit error:', error);
    setConnectionState('error');
  }, []);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      onDisconnected={handleDisconnected}
      onConnected={handleConnected}
      onError={handleError}
      data-lk-theme="default"
      className="h-screen w-screen bg-gray-900"
    >
      <LayoutContextProvider>
        <div className="h-full flex flex-col">
          {/* Header */}
          <RoomHeader
            sessionInfo={sessionInfo}
            isRecording={isRecording}
            showWhiteboard={showWhiteboard}
            onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
          />

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Video grid */}
            <div className={`flex-1 ${showWhiteboard ? 'w-[70%]' : 'w-full'} transition-all duration-300`}>
              <VideoConference />
            </div>

            {/* Whiteboard sidebar */}
            {showWhiteboard && (
              <div className="w-[30%] border-l border-gray-700 bg-white">
                <CollaborativeWhiteboard sessionId={sessionInfo?.id} />
              </div>
            )}
          </div>

          {/* Custom controls footer */}
          <RoomFooter
            isTutor={isTutor}
            isRecording={isRecording}
            onEndSession={onEndSession}
          />
        </div>

        <RoomAudioRenderer />
      </LayoutContextProvider>
    </LiveKitRoom>
  );
}

/**
 * Room header with session info and recording indicator
 */
function RoomHeader({ sessionInfo, isRecording, showWhiteboard, onToggleWhiteboard }) {
  return (
    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-white font-semibold">
          {sessionInfo?.topic || 'Tutoring Session'}
        </h1>
        <span className="text-gray-400 text-sm">
          {sessionInfo?.tutor?.name} & {sessionInfo?.student?.name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm">
            <Circle className="w-3 h-3 fill-current animate-pulse" />
            Recording
          </div>
        )}

        {/* Whiteboard toggle */}
        <button
          onClick={onToggleWhiteboard}
          className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {showWhiteboard ? (
            <>
              <PanelRightClose className="w-5 h-5" />
              <span className="text-sm">Hide Whiteboard</span>
            </>
          ) : (
            <>
              <PanelRightOpen className="w-5 h-5" />
              <span className="text-sm">Show Whiteboard</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Room footer with controls
 */
function RoomFooter({ isTutor, isRecording, onEndSession }) {
  const room = useRoomContext();

  const handleEndSession = () => {
    if (isTutor) {
      if (window.confirm('Are you sure you want to end this session? This will stop the recording.')) {
        onEndSession?.();
      }
    } else {
      if (window.confirm('Are you sure you want to leave this session?')) {
        room.disconnect();
      }
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 py-3">
      <div className="flex items-center justify-center gap-2">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            screenShare: isTutor, // Only tutors can screen share
            settings: true,
            leave: false, // We use custom leave button
          }}
        />

        {/* Custom end/leave button */}
        <button
          onClick={handleEndSession}
          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
            isTutor
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isTutor ? 'End Session' : 'Leave'}
        </button>
      </div>
    </div>
  );
}

export default VideoRoom;
