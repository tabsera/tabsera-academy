/**
 * RecordingLayout
 *
 * Custom layout page for LiveKit Room Composite Egress.
 * Renders video participants on the left and whiteboard on the right.
 *
 * This page is loaded by LiveKit's egress service via customBaseUrl.
 * LiveKit injects its participant video tracks into this layout.
 *
 * URL: /recording-layout/:sessionId?token=xxx
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

// Poll interval for whiteboard updates
const POLL_INTERVAL = 500;

/**
 * Main Recording Layout Component
 */
export function RecordingLayout() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();

  // LiveKit connection params (injected by LiveKit egress)
  const token = searchParams.get('liveKitUrl') ? null : searchParams.get('token');
  const serverUrl = searchParams.get('url') || searchParams.get('liveKitUrl') || import.meta.env.VITE_LIVEKIT_URL;
  const apiUrl = searchParams.get('apiUrl') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // For LiveKit egress, the token is passed differently
  // Check if we're being rendered by egress (has liveKitUrl param)
  const isEgressRender = !!searchParams.get('liveKitUrl');

  if (!sessionId) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">
        No session ID provided
      </div>
    );
  }

  // When rendered by LiveKit egress, we don't need to connect - egress handles that
  // We just render the layout and LiveKit injects the video
  if (isEgressRender) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex overflow-hidden">
        {/* Left: Video area (LiveKit will inject participants here) */}
        <div className="w-1/2 h-full p-2" id="lk-video-container">
          <div className="h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📹</div>
              <p>Video participants will appear here</p>
            </div>
          </div>
        </div>

        {/* Right: Whiteboard */}
        <div className="w-1/2 h-full bg-white">
          <WhiteboardPanel sessionId={sessionId} apiUrl={apiUrl} />
        </div>
      </div>
    );
  }

  // For preview/testing, connect to LiveKit normally
  if (!token) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p>Recording Layout Preview</p>
          <p className="text-sm text-gray-400 mt-2">
            Provide ?token=xxx to connect to LiveKit
          </p>
        </div>
      </div>
    );
  }

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
 */
function RecordingLayoutContent({ sessionId, apiUrl }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="h-screen w-screen bg-gray-900 flex overflow-hidden">
      {/* Left: Video participants */}
      <div className="w-1/2 h-full p-2">
        <GridLayout tracks={tracks} className="h-full">
          <ParticipantTile />
        </GridLayout>
      </div>

      {/* Right: Whiteboard */}
      <div className="w-1/2 h-full bg-white">
        <WhiteboardPanel sessionId={sessionId} apiUrl={apiUrl} />
      </div>
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
            excalidrawRef.current.updateScene({
              elements: data.snapshot.elements,
              appState: {
                viewBackgroundColor: data.snapshot.appState?.viewBackgroundColor || '#ffffff',
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
