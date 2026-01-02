/**
 * VideoRoom Component
 * Full-featured video conferencing room using LiveKit
 * Features: Multiple layouts, screen share, chat, whiteboard
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  FocusLayout,
  CarouselLayout,
  Chat,
  LayoutContextProvider,
  useTracks,
  useRoomContext,
  useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, RoomEvent } from 'livekit-client';
import {
  LayoutGrid,
  Presentation,
  MessageSquare,
  PenTool,
  Circle,
  X,
  Users,
  Maximize,
  Minimize,
  Video,
  Monitor,
} from 'lucide-react';
import CollaborativeWhiteboard from './CollaborativeWhiteboard';
import { tutorsApi } from '@/api/tutors';

// View modes
const VIEW_MODES = {
  VIDEO_ONLY: 'video_only',           // Just video grid
  VIDEO_CHAT: 'video_chat',           // Video + Chat sidebar
  WHITEBOARD_FULL: 'whiteboard_full', // Whiteboard fullscreen with small video
  SCREEN_FULL: 'screen_full',         // Screen share fullscreen with small video
  SPLIT: 'split',                     // Split view (video + whiteboard/screen)
};

export function VideoRoom({
  token,
  serverUrl,
  sessionInfo,
  isTutor,
  isRecording,
  onLeave,
  onEndSession,
}) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.VIDEO_ONLY);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
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

  // Toggle whiteboard fullscreen
  const toggleWhiteboard = () => {
    if (viewMode === VIEW_MODES.WHITEBOARD_FULL) {
      setViewMode(VIEW_MODES.VIDEO_ONLY);
    } else {
      setViewMode(VIEW_MODES.WHITEBOARD_FULL);
      setShowChat(false);
    }
  };

  // Toggle chat
  const toggleChat = () => {
    if (showChat) {
      setShowChat(false);
      if (viewMode === VIEW_MODES.VIDEO_CHAT) {
        setViewMode(VIEW_MODES.VIDEO_ONLY);
      }
    } else {
      setShowChat(true);
      if (viewMode === VIEW_MODES.VIDEO_ONLY) {
        setViewMode(VIEW_MODES.VIDEO_CHAT);
      }
    }
  };

  // Handle synced view mode changes (from tutor)
  const handleSyncedViewMode = useCallback((newMode) => {
    setViewMode(newMode);
    // Show chat if switching to video_chat mode
    if (newMode === VIEW_MODES.VIDEO_CHAT) {
      setShowChat(true);
    }
  }, []);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={true}
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
            viewMode={viewMode}
            setViewMode={setViewMode}
            showChat={showChat}
            toggleChat={toggleChat}
            toggleWhiteboard={toggleWhiteboard}
            showParticipants={showParticipants}
            setShowParticipants={setShowParticipants}
          />

          {/* Main content */}
          <MainContent
            viewMode={viewMode}
            setViewMode={setViewMode}
            showChat={showChat}
            showParticipants={showParticipants}
            setShowParticipants={setShowParticipants}
            sessionInfo={sessionInfo}
            isTutor={isTutor}
            onSyncedViewMode={handleSyncedViewMode}
          />

          {/* Controls footer */}
          <RoomFooter
            isTutor={isTutor}
            isRecording={isRecording}
            onEndSession={onEndSession}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        <RoomAudioRenderer />
      </LayoutContextProvider>
    </LiveKitRoom>
  );
}

/**
 * Room header
 */
function RoomHeader({
  sessionInfo,
  isRecording,
  viewMode,
  setViewMode,
  showChat,
  toggleChat,
  toggleWhiteboard,
  showParticipants,
  setShowParticipants,
}) {
  const isWhiteboardFull = viewMode === VIEW_MODES.WHITEBOARD_FULL;
  const isScreenFull = viewMode === VIEW_MODES.SCREEN_FULL;

  return (
    <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
      {/* Left: Session info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <h1 className="text-white font-semibold truncate text-sm md:text-base">
          {sessionInfo?.topic || 'Tutoring Session'}
        </h1>
        {isRecording && (
          <div className="flex items-center gap-1.5 bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
            <Circle className="w-2 h-2 fill-current animate-pulse" />
            REC
          </div>
        )}
      </div>

      {/* Center: View mode buttons */}
      <div className="hidden md:flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
        <ViewModeButton
          active={viewMode === VIEW_MODES.VIDEO_ONLY || viewMode === VIEW_MODES.VIDEO_CHAT}
          onClick={() => setViewMode(showChat ? VIEW_MODES.VIDEO_CHAT : VIEW_MODES.VIDEO_ONLY)}
          title="Video View"
        >
          <Video className="w-4 h-4" />
        </ViewModeButton>
        <ViewModeButton
          active={viewMode === VIEW_MODES.WHITEBOARD_FULL}
          onClick={toggleWhiteboard}
          title="Whiteboard Full Screen"
        >
          <PenTool className="w-4 h-4" />
        </ViewModeButton>
        <ViewModeButton
          active={viewMode === VIEW_MODES.SPLIT}
          onClick={() => setViewMode(VIEW_MODES.SPLIT)}
          title="Split View"
        >
          <LayoutGrid className="w-4 h-4" />
        </ViewModeButton>
      </div>

      {/* Right: Panel toggles */}
      <div className="flex items-center gap-1">
        <PanelButton
          active={showParticipants}
          onClick={() => setShowParticipants(!showParticipants)}
          title="Participants"
        >
          <Users className="w-5 h-5" />
        </PanelButton>
        <PanelButton
          active={showChat}
          onClick={toggleChat}
          title="Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </PanelButton>
        {/* Mobile whiteboard toggle */}
        <PanelButton
          active={isWhiteboardFull}
          onClick={toggleWhiteboard}
          title="Whiteboard"
          className="md:hidden"
        >
          <PenTool className="w-5 h-5" />
        </PanelButton>
      </div>
    </div>
  );
}

function ViewModeButton({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

function PanelButton({ active, onClick, title, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
}

// View mode polling interval (700ms to match whiteboard)
const VIEW_MODE_POLL_INTERVAL = 700;

/**
 * Main content area with different view modes
 */
function MainContent({ viewMode, setViewMode, showChat, showParticipants, setShowParticipants, sessionInfo, isTutor, onSyncedViewMode }) {
  const room = useRoomContext();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const participants = useParticipants();
  const lastBroadcastedMode = useRef(null);
  const lastSavedViewMode = useRef(null);
  const lastPolledViewMode = useRef(null);
  const participantCount = useRef(participants.length);
  const viewModePollRef = useRef(null);

  // Check for active screen share
  const screenShareTrack = tracks.find(
    (track) => track.source === Track.Source.ScreenShare
  );

  // Function to broadcast view mode (tutor only) - using proper topic for better iPad support
  const broadcastViewMode = useCallback((mode) => {
    if (!room?.localParticipant) {
      console.log('View mode sync: No local participant');
      return;
    }

    try {
      const data = JSON.stringify({
        viewMode: mode,
        timestamp: Date.now(),
      });

      // Use topic option for better cross-platform support (especially iPad)
      room.localParticipant.publishData(new TextEncoder().encode(data), {
        reliable: true,
        topic: 'viewmode',
      });
      console.log('View mode sync: Broadcasted', mode);
    } catch (error) {
      console.error('View mode sync: Failed to broadcast:', error);
    }
  }, [room]);

  // Save view mode to backend (tutor only) - for polling fallback
  const saveViewModeToBackend = useCallback(async (mode) => {
    if (!sessionInfo?.id) return;

    try {
      // Get current whiteboard state and add viewMode
      const response = await tutorsApi.getWhiteboard(sessionInfo.id);
      const currentSnapshot = response.success ? response.snapshot : {};

      await tutorsApi.saveWhiteboard(sessionInfo.id, {
        ...currentSnapshot,
        viewMode: mode,
        viewModeUpdatedAt: Date.now(),
      });
      console.log('View mode sync: Saved to backend:', mode);
    } catch (error) {
      console.error('View mode sync: Failed to save:', error);
    }
  }, [sessionInfo?.id]);

  // Poll for view mode changes (student only)
  const pollViewMode = useCallback(async () => {
    if (!sessionInfo?.id || isTutor) return;

    try {
      const response = await tutorsApi.getWhiteboard(sessionInfo.id);

      if (response.success && response.snapshot?.viewMode) {
        const serverViewMode = response.snapshot.viewMode;
        const serverTimestamp = response.snapshot.viewModeUpdatedAt || 0;

        // Only apply if different from last polled value
        if (serverViewMode !== lastPolledViewMode.current) {
          console.log('View mode sync: Poll found new mode:', serverViewMode);
          lastPolledViewMode.current = serverViewMode;
          onSyncedViewMode(serverViewMode);
        }
      }
    } catch (error) {
      // Silent fail for polling
    }
  }, [sessionInfo?.id, isTutor, onSyncedViewMode]);

  // Start view mode polling (student only)
  useEffect(() => {
    if (isTutor || !sessionInfo?.id) return;

    console.log('View mode sync: Starting poll for student');
    viewModePollRef.current = setInterval(pollViewMode, VIEW_MODE_POLL_INTERVAL);

    // Initial poll
    pollViewMode();

    return () => {
      if (viewModePollRef.current) {
        clearInterval(viewModePollRef.current);
      }
    };
  }, [isTutor, sessionInfo?.id, pollViewMode]);

  // Listen for view mode sync from tutor (using direct room API with topic parameter)
  useEffect(() => {
    if (!room || isTutor) return;

    console.log('View mode sync: Student listening for tutor commands');

    // Note: DataReceived gives (payload, participant, kind, topic)
    const handleDataReceived = (payload, participant, kind, topic) => {
      // Skip own messages
      if (participant?.identity === room.localParticipant?.identity) return;

      // Only handle viewmode topic
      if (topic !== 'viewmode') return;

      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.viewMode) {
          console.log('View mode sync: Received from tutor:', data.viewMode);
          lastPolledViewMode.current = data.viewMode; // Update to prevent poll override
          onSyncedViewMode(data.viewMode);
        }
      } catch (error) {
        // Not a view mode message
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, isTutor, onSyncedViewMode]);

  // Broadcast and save view mode changes (tutor only)
  useEffect(() => {
    if (!isTutor || !room?.localParticipant) return;

    // Only broadcast if mode actually changed
    if (lastBroadcastedMode.current === viewMode) return;
    lastBroadcastedMode.current = viewMode;

    // Small delay to ensure room is ready
    const timer = setTimeout(() => {
      broadcastViewMode(viewMode);
      // Also save to backend for polling fallback
      if (lastSavedViewMode.current !== viewMode) {
        lastSavedViewMode.current = viewMode;
        saveViewModeToBackend(viewMode);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [viewMode, isTutor, room, broadcastViewMode, saveViewModeToBackend]);

  // Re-broadcast when new participants join (tutor only)
  useEffect(() => {
    if (!isTutor || !room?.localParticipant) return;

    // Check if a new participant joined
    if (participants.length > participantCount.current) {
      // Re-broadcast current view mode for the new participant
      setTimeout(() => {
        broadcastViewMode(viewMode);
        saveViewModeToBackend(viewMode);
      }, 1000); // Small delay to ensure participant is ready
    }
    participantCount.current = participants.length;
  }, [participants.length, isTutor, viewMode, room, broadcastViewMode, saveViewModeToBackend]);

  // Auto-switch to screen full mode when someone shares
  useEffect(() => {
    if (screenShareTrack && viewMode === VIEW_MODES.VIDEO_ONLY) {
      setViewMode(VIEW_MODES.SCREEN_FULL);
    } else if (!screenShareTrack && viewMode === VIEW_MODES.SCREEN_FULL) {
      setViewMode(VIEW_MODES.VIDEO_ONLY);
    }
  }, [screenShareTrack, viewMode, setViewMode]);

  // Determine what to render based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case VIEW_MODES.WHITEBOARD_FULL:
        return (
          <div className="h-full flex flex-col">
            {/* Recording tip banner - show when no screen share and session is recording */}
            {!screenShareTrack && (
              <div className="bg-amber-500/90 text-amber-950 px-4 py-2 text-sm flex items-center justify-center gap-2 flex-shrink-0">
                <Monitor className="w-4 h-4" />
                <span>
                  <strong>Recording tip:</strong> Share your screen (click Screen Share below) to include the whiteboard in the recording
                </span>
              </div>
            )}
            <div className="flex-1 flex min-h-0">
              {/* Whiteboard takes full space - no video overlay */}
              <div className="flex-1 bg-white">
                <CollaborativeWhiteboard sessionId={sessionInfo?.id} />
              </div>
              {/* Optional chat sidebar */}
              {showChat && <ChatSidebar />}
            </div>
          </div>
        );

      case VIEW_MODES.SCREEN_FULL:
        return (
          <div className="h-full flex">
            {/* Screen share takes most space */}
            <div className="flex-1 relative bg-black">
              {screenShareTrack ? (
                <FocusLayout trackRef={screenShareTrack} className="h-full" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No screen share active</p>
                  </div>
                </div>
              )}
              {/* Mini video overlay */}
              <div className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
                <MiniVideoGrid tracks={tracks.filter(t => t.source !== Track.Source.ScreenShare)} />
              </div>
            </div>
            {/* Optional chat sidebar */}
            {showChat && <ChatSidebar />}
          </div>
        );

      case VIEW_MODES.SPLIT:
        return (
          <div className="h-full flex">
            {/* Left: Video */}
            <div className="w-1/2 p-2 border-r border-gray-700">
              <GridLayout tracks={tracks} className="h-full">
                <ParticipantTile />
              </GridLayout>
            </div>
            {/* Right: Whiteboard */}
            <div className="w-1/2 bg-white">
              <CollaborativeWhiteboard sessionId={sessionInfo?.id} />
            </div>
          </div>
        );

      case VIEW_MODES.VIDEO_CHAT:
        return (
          <div className="h-full flex">
            {/* Video area */}
            <div className="flex-1 p-2">
              <VideoGrid tracks={tracks} screenShareTrack={screenShareTrack} />
            </div>
            {/* Chat sidebar */}
            <ChatSidebar />
          </div>
        );

      case VIEW_MODES.VIDEO_ONLY:
      default:
        return (
          <div className="h-full flex">
            {/* Video area */}
            <div className="flex-1 p-2">
              <VideoGrid tracks={tracks} screenShareTrack={screenShareTrack} />
            </div>
            {/* Participants sidebar (optional) */}
            {showParticipants && (
              <ParticipantsSidebar
                participants={participants}
                onClose={() => setShowParticipants(false)}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {renderContent()}
    </div>
  );
}

/**
 * Video grid component
 */
function VideoGrid({ tracks, screenShareTrack }) {
  if (screenShareTrack) {
    // Spotlight mode when screen sharing
    const otherTracks = tracks.filter(t => t !== screenShareTrack);
    return (
      <div className="h-full flex flex-col gap-2">
        <div className="flex-1 min-h-0">
          <FocusLayout trackRef={screenShareTrack} className="h-full rounded-lg overflow-hidden" />
        </div>
        {otherTracks.length > 0 && (
          <div className="h-24 md:h-28 flex-shrink-0">
            <CarouselLayout tracks={otherTracks} orientation="horizontal">
              <ParticipantTile />
            </CarouselLayout>
          </div>
        )}
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}

/**
 * Mini video grid for overlay
 */
function MiniVideoGrid({ tracks }) {
  const cameraTracks = tracks.filter(t => t.source === Track.Source.Camera);

  if (cameraTracks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-xs">
        No video
      </div>
    );
  }

  return (
    <GridLayout tracks={cameraTracks.slice(0, 4)} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}

/**
 * Chat sidebar
 */
function ChatSidebar() {
  return (
    <div className="w-80 md:w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800">Chat</h3>
      </div>
      <div className="flex-1 overflow-hidden">
        <Chat className="h-full" />
      </div>
    </div>
  );
}

/**
 * Participants sidebar
 */
function ParticipantsSidebar({ participants, onClose }) {
  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Participants ({participants.length})</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.sid}
            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {participant.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {participant.name || participant.identity}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {participant.isSpeaking && <span>🔊</span>}
                {participant.isCameraEnabled && <span>📹</span>}
                {participant.isMicrophoneEnabled && <span>🎤</span>}
                {participant.isScreenShareEnabled && <span>🖥️</span>}
              </div>
            </div>
            {participant.isLocal && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                You
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Room footer with controls
 */
function RoomFooter({ isTutor, isRecording, onEndSession, viewMode, setViewMode }) {
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

  // Toggle fullscreen for current content
  const isFullscreen = viewMode === VIEW_MODES.WHITEBOARD_FULL || viewMode === VIEW_MODES.SCREEN_FULL;
  const toggleFullscreen = () => {
    if (isFullscreen) {
      setViewMode(VIEW_MODES.VIDEO_ONLY);
    } else if (viewMode === VIEW_MODES.SPLIT) {
      setViewMode(VIEW_MODES.WHITEBOARD_FULL);
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 py-3 flex-shrink-0">
      <div className="flex items-center justify-center gap-2">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            settings: true,
            leave: false,
            chat: false,
          }}
        />

        {/* Fullscreen toggle */}
        {(viewMode === VIEW_MODES.WHITEBOARD_FULL || viewMode === VIEW_MODES.SCREEN_FULL || viewMode === VIEW_MODES.SPLIT) && (
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        )}

        {/* End/Leave button */}
        <button
          onClick={handleEndSession}
          className={`ml-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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
