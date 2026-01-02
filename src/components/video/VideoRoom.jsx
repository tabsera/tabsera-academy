/**
 * VideoRoom Component
 * Full-featured video conferencing room using LiveKit
 * Features: Multiple layouts, screen share, chat, whiteboard
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
  Chat,
  LayoutContextProvider,
  useTracks,
  useRoomContext,
  useParticipants,
  TrackRefContext,
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Users,
  MonitorUp,
} from 'lucide-react';
import CollaborativeWhiteboard from './CollaborativeWhiteboard';

// Layout options similar to Google Meet
const LAYOUT_MODES = {
  AUTO: 'auto',        // Auto-switch based on content
  GRID: 'grid',        // Equal tiles for all
  SPOTLIGHT: 'spotlight', // One large, others small
  SIDEBAR: 'sidebar',  // Video sidebar with main content area
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
  const [layoutMode, setLayoutMode] = useState(LAYOUT_MODES.AUTO);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  const [focusedTrackSid, setFocusedTrackSid] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Determine the active panel
  const activePanel = showChat ? 'chat' : showWhiteboard ? 'whiteboard' : showParticipants ? 'participants' : null;

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
          layoutMode={layoutMode}
          onLayoutChange={setLayoutMode}
          showChat={showChat}
          showWhiteboard={showWhiteboard}
          showParticipants={showParticipants}
          onToggleChat={() => {
            setShowChat(!showChat);
            if (!showChat) {
              setShowWhiteboard(false);
              setShowParticipants(false);
            }
          }}
          onToggleWhiteboard={() => {
            setShowWhiteboard(!showWhiteboard);
            if (!showWhiteboard) {
              setShowChat(false);
              setShowParticipants(false);
            }
          }}
          onToggleParticipants={() => {
            setShowParticipants(!showParticipants);
            if (!showParticipants) {
              setShowChat(false);
              setShowWhiteboard(false);
            }
          }}
        />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video area */}
          <div className={`flex-1 transition-all duration-300 ${activePanel && !sidebarCollapsed ? 'mr-0' : ''}`}>
            <VideoArea
              layoutMode={layoutMode}
              focusedTrackSid={focusedTrackSid}
              onFocusTrack={setFocusedTrackSid}
              hasActivePanel={!!activePanel}
            />
          </div>

          {/* Side panel */}
          {activePanel && (
            <SidePanel
              activePanel={activePanel}
              sessionInfo={sessionInfo}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onClose={() => {
                setShowChat(false);
                setShowWhiteboard(false);
                setShowParticipants(false);
              }}
            />
          )}
        </div>

        {/* Controls footer */}
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
 * Room header with session info, layout controls, and panel toggles
 */
function RoomHeader({
  sessionInfo,
  isRecording,
  layoutMode,
  onLayoutChange,
  showChat,
  showWhiteboard,
  showParticipants,
  onToggleChat,
  onToggleWhiteboard,
  onToggleParticipants,
}) {
  return (
    <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
      {/* Left: Session info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <h1 className="text-white font-semibold truncate">
          {sessionInfo?.topic || 'Tutoring Session'}
        </h1>
        <span className="text-gray-400 text-sm hidden md:block">
          {sessionInfo?.tutor?.name} & {sessionInfo?.student?.name}
        </span>
        {isRecording && (
          <div className="flex items-center gap-1.5 bg-red-600/20 text-red-400 px-2.5 py-1 rounded-full text-xs font-medium">
            <Circle className="w-2 h-2 fill-current animate-pulse" />
            REC
          </div>
        )}
      </div>

      {/* Center: Layout selector */}
      <div className="hidden md:flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
        <LayoutButton
          active={layoutMode === LAYOUT_MODES.AUTO}
          onClick={() => onLayoutChange(LAYOUT_MODES.AUTO)}
          title="Auto layout"
        >
          <Maximize2 className="w-4 h-4" />
        </LayoutButton>
        <LayoutButton
          active={layoutMode === LAYOUT_MODES.GRID}
          onClick={() => onLayoutChange(LAYOUT_MODES.GRID)}
          title="Grid view"
        >
          <LayoutGrid className="w-4 h-4" />
        </LayoutButton>
        <LayoutButton
          active={layoutMode === LAYOUT_MODES.SPOTLIGHT}
          onClick={() => onLayoutChange(LAYOUT_MODES.SPOTLIGHT)}
          title="Spotlight view"
        >
          <Presentation className="w-4 h-4" />
        </LayoutButton>
      </div>

      {/* Right: Panel toggles */}
      <div className="flex items-center gap-1">
        <PanelToggle
          active={showParticipants}
          onClick={onToggleParticipants}
          title="Participants"
        >
          <Users className="w-5 h-5" />
        </PanelToggle>
        <PanelToggle
          active={showChat}
          onClick={onToggleChat}
          title="Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </PanelToggle>
        <PanelToggle
          active={showWhiteboard}
          onClick={onToggleWhiteboard}
          title="Whiteboard"
        >
          <PenTool className="w-5 h-5" />
        </PanelToggle>
      </div>
    </div>
  );
}

function LayoutButton({ active, onClick, title, children }) {
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

function PanelToggle({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Video area with different layout modes
 */
function VideoArea({ layoutMode, focusedTrackSid, onFocusTrack, hasActivePanel }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const participants = useParticipants();

  // Find screen share track
  const screenShareTrack = tracks.find(
    (track) => track.source === Track.Source.ScreenShare && track.publication?.isSubscribed
  );

  // Determine effective layout
  let effectiveLayout = layoutMode;
  if (layoutMode === LAYOUT_MODES.AUTO) {
    // Auto: Use spotlight if screen share is active, otherwise grid
    effectiveLayout = screenShareTrack ? LAYOUT_MODES.SPOTLIGHT : LAYOUT_MODES.GRID;
  }

  // Get the focused track for spotlight mode
  const focusTrack = focusedTrackSid
    ? tracks.find((t) => t.publication?.trackSid === focusedTrackSid)
    : screenShareTrack || tracks[0];

  const otherTracks = tracks.filter((t) => t !== focusTrack);

  if (effectiveLayout === LAYOUT_MODES.GRID) {
    return (
      <div className="h-full p-2">
        <GridLayout tracks={tracks} className="h-full">
          <ParticipantTile
            onParticipantClick={(evt) => {
              // Allow clicking to focus in grid mode
              onFocusTrack(evt.participant.sid);
            }}
          />
        </GridLayout>
      </div>
    );
  }

  if (effectiveLayout === LAYOUT_MODES.SPOTLIGHT) {
    return (
      <div className="h-full flex flex-col p-2 gap-2">
        {/* Main focused view */}
        <div className="flex-1 min-h-0">
          {focusTrack && (
            <FocusLayout trackRef={focusTrack} className="h-full rounded-lg overflow-hidden" />
          )}
        </div>

        {/* Carousel of other participants */}
        {otherTracks.length > 0 && (
          <div className="h-24 md:h-32 flex-shrink-0">
            <CarouselLayout tracks={otherTracks} orientation="horizontal">
              <ParticipantTile
                onParticipantClick={(evt) => {
                  // Click to focus this participant
                  const clickedTrack = otherTracks.find(
                    (t) => t.participant.sid === evt.participant.sid
                  );
                  if (clickedTrack) {
                    onFocusTrack(clickedTrack.publication?.trackSid);
                  }
                }}
              />
            </CarouselLayout>
          </div>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className="h-full p-2">
      <GridLayout tracks={tracks} className="h-full">
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}

/**
 * Side panel for chat, whiteboard, or participants
 */
function SidePanel({ activePanel, sessionInfo, collapsed, onToggleCollapse, onClose }) {
  const participants = useParticipants();

  return (
    <div
      className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-80 md:w-96'
      }`}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 capitalize">{activePanel}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'chat' && (
          <div className="h-full">
            <Chat className="h-full" />
          </div>
        )}

        {activePanel === 'whiteboard' && (
          <div className="h-full">
            <CollaborativeWhiteboard sessionId={sessionInfo?.id} />
          </div>
        )}

        {activePanel === 'participants' && (
          <div className="p-4 space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.sid}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {participant.name?.charAt(0)?.toUpperCase() || participant.identity?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {participant.name || participant.identity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {participant.isSpeaking && '🔊 Speaking'}
                    {participant.isCameraEnabled && ' 📹'}
                    {participant.isMicrophoneEnabled && ' 🎤'}
                    {participant.isScreenShareEnabled && ' 🖥️'}
                  </p>
                </div>
                {participant.isLocal && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
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
            screenShare: true, // Enable for everyone
            settings: true,
            leave: false,
            chat: false, // We use our own chat toggle
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
