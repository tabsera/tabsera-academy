/**
 * RecordingLayout
 *
 * Custom layout page for LiveKit Room Composite Egress.
 * Shows full-screen whiteboard with audio, switches to screenshare when active.
 *
 * This page is loaded by LiveKit's egress service via customBaseUrl.
 * LiveKit injects its participant video tracks into this layout.
 *
 * IMPORTANT: Must call EgressHelper.setRoom() and EgressHelper.startRecording() to signal egress can start.
 *
 * URL: /recording-layout/:sessionId?token=xxx
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  useRoomContext,
  VideoTrack,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, RoomEvent } from 'livekit-client';
import EgressHelper from '@livekit/egress-sdk';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

// Poll interval for whiteboard updates
const POLL_INTERVAL = 500;

/**
 * Main Recording Layout Component
 *
 * LiveKit Egress loads this page with query params:
 * - url: LiveKit WebSocket URL (wss://...)
 * - token: Access token for the room
 */
export function RecordingLayout() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();

  // LiveKit connection params (injected by LiveKit egress)
  // Egress passes: url (WebSocket URL) and token (JWT)
  const token = searchParams.get('token');
  const serverUrl = searchParams.get('url') || import.meta.env.VITE_LIVEKIT_URL;
  const apiUrl = searchParams.get('apiUrl') || import.meta.env.VITE_API_URL || 'https://academy.tabsera.com/api';

  console.log('[RecordingLayout] Params:', {
    sessionId,
    hasToken: !!token,
    serverUrl,
    apiUrl,
    allParams: Object.fromEntries(searchParams.entries())
  });

  if (!sessionId) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">
        No session ID provided
      </div>
    );
  }

  // If no token, show preview mode (for testing the layout)
  if (!token) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p>Recording Layout Preview</p>
          <p className="text-sm text-gray-400 mt-2">
            Waiting for LiveKit egress to provide token...
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Session: {sessionId}
          </p>
          {/* Still show whiteboard in preview mode */}
          <div className="mt-8 w-96 h-64 bg-white rounded-lg overflow-hidden">
            <WhiteboardPanel sessionId={sessionId} apiUrl={apiUrl} />
          </div>
        </div>
      </div>
    );
  }

  // Connect to LiveKit with the provided token
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={false}
      video={false}
      className="h-screen w-screen"
    >
      <RecordingLayoutContent sessionId={sessionId} apiUrl={apiUrl} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

/**
 * Recording layout content (inside LiveKit room context)
 * Shows full-screen whiteboard, switches to screenshare when active
 */
function RecordingLayoutContent({ sessionId, apiUrl }) {
  const room = useRoomContext();

  // Track screenshare - when someone shares screen, show it instead of whiteboard
  const screenShareTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );
  const hasScreenShare = screenShareTracks.length > 0;
  const screenShareTrack = screenShareTracks[0];

  // Signal to LiveKit egress that the layout is ready
  useEffect(() => {
    if (!room) return;

    const handleConnected = () => {
      console.log('[RecordingLayout] Room connected, signaling layout ready');
      // Register the room with EgressHelper and start recording
      EgressHelper.setRoom(room);
      EgressHelper.startRecording();
    };

    // Check if already connected
    if (room.state === 'connected') {
      console.log('[RecordingLayout] Already connected, signaling layout ready');
      EgressHelper.setRoom(room);
      EgressHelper.startRecording();
    }

    room.on(RoomEvent.Connected, handleConnected);

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
    };
  }, [room]);

  // Log screenshare state changes
  useEffect(() => {
    console.log('[RecordingLayout] Screenshare active:', hasScreenShare);
  }, [hasScreenShare]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      {hasScreenShare ? (
        // Full-screen screenshare when active
        <ScreenShareView trackRef={screenShareTrack} />
      ) : (
        // Full-screen whiteboard (default)
        <WhiteboardPanel sessionId={sessionId} apiUrl={apiUrl} />
      )}
    </div>
  );
}

/**
 * Full-screen screenshare view
 */
function ScreenShareView({ trackRef }) {
  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      <VideoTrack
        trackRef={trackRef}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

/**
 * Whiteboard panel that polls for updates
 */
function WhiteboardPanel({ sessionId, apiUrl }) {
  const [elements, setElements] = useState([]);
  const [appState, setAppState] = useState({});
  const excalidrawRef = useRef(null);
  const lastVersionRef = useRef(0);

  // Poll for whiteboard updates
  const pollWhiteboard = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Use public endpoint for egress (no auth required)
      const response = await fetch(`${apiUrl}/tutors/sessions/${sessionId}/whiteboard/public`);

      if (!response.ok) return;

      const data = await response.json();

      if (data.success && data.snapshot) {
        const serverVersion = data.snapshot.savedAt || 0;

        if (serverVersion > lastVersionRef.current) {
          lastVersionRef.current = serverVersion;

          if (data.snapshot.elements && excalidrawRef.current) {
            // Apply elements and viewport (scroll/zoom) from tutor's view
            excalidrawRef.current.updateScene({
              elements: data.snapshot.elements,
              appState: {
                viewBackgroundColor: data.snapshot.appState?.viewBackgroundColor || '#ffffff',
                scrollX: data.snapshot.appState?.scrollX || 0,
                scrollY: data.snapshot.appState?.scrollY || 0,
                zoom: data.snapshot.appState?.zoom || { value: 1 },
                viewModeEnabled: true,
              },
            });
          }
        }
      }
    } catch (err) {
      // Silent fail for polling
    }
  }, [sessionId, apiUrl]);

  // Start polling
  useEffect(() => {
    pollWhiteboard();
    const interval = setInterval(pollWhiteboard, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [pollWhiteboard]);

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => { excalidrawRef.current = api; }}
        initialData={{
          elements: elements,
          appState: {
            viewBackgroundColor: '#ffffff',
            viewModeEnabled: true,
            zenModeEnabled: true,
          },
        }}
        viewModeEnabled={true}
        zenModeEnabled={true}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
            export: false,
            loadScene: false,
            saveAsImage: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
          tools: { image: false },
        }}
        theme="light"
      />
    </div>
  );
}

export default RecordingLayout;
