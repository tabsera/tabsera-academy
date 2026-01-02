/**
 * WhiteboardRecordView
 *
 * A standalone page that renders the whiteboard for LiveKit Web Egress recording.
 * This page is rendered server-side by LiveKit and included in the session recording.
 *
 * Features:
 * - Polls backend for whiteboard state updates
 * - Renders Excalidraw in view-only mode
 * - No UI controls - just the canvas
 * - Optimized for recording (no animations, clean rendering)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

// Poll interval for whiteboard updates (500ms for smooth recording)
const POLL_INTERVAL = 500;

export function WhiteboardRecordView() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [elements, setElements] = useState([]);
  const [appState, setAppState] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const excalidrawRef = useRef(null);
  const lastVersionRef = useRef(0);
  const pollIntervalRef = useRef(null);

  // Get API URL from query params or environment
  const apiUrl = searchParams.get('apiUrl') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Poll for whiteboard updates
  const pollWhiteboard = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Use public endpoint for egress (no auth required)
      const response = await fetch(`${apiUrl}/tutors/sessions/${sessionId}/whiteboard/public`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch whiteboard');
      }

      const data = await response.json();

      if (data.success && data.snapshot) {
        const serverVersion = data.snapshot.savedAt || 0;

        // Only update if version changed
        if (serverVersion > lastVersionRef.current) {
          lastVersionRef.current = serverVersion;

          if (data.snapshot.elements) {
            setElements(data.snapshot.elements);
          }

          if (data.snapshot.appState) {
            setAppState(data.snapshot.appState);
          }

          // Update Excalidraw scene
          if (excalidrawRef.current && data.snapshot.elements) {
            excalidrawRef.current.updateScene({
              elements: data.snapshot.elements,
              appState: {
                ...data.snapshot.appState,
                viewModeEnabled: true, // Always view-only for recording
              },
            });
          }
        }

        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      console.error('Whiteboard poll error:', err);
      setError(err.message);
    }
  }, [sessionId, apiUrl]);

  // Start polling on mount
  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    // Initial poll
    pollWhiteboard();

    // Start interval
    pollIntervalRef.current = setInterval(pollWhiteboard, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId, pollWhiteboard]);

  // Error state
  if (error && !isConnected) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Connecting to whiteboard...</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-white overflow-hidden">
      {/* Status indicator for debugging (hidden in production) */}
      {import.meta.env.DEV && (
        <div className="absolute top-2 left-2 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {isConnected ? '● Connected' : '○ Connecting...'}
        </div>
      )}

      {/* Excalidraw in view-only mode */}
      <Excalidraw
        excalidrawAPI={(api) => { excalidrawRef.current = api; }}
        initialData={{
          elements: elements,
          appState: {
            viewBackgroundColor: '#ffffff',
            currentItemFontFamily: 1,
            viewModeEnabled: true, // View-only mode
            zenModeEnabled: true, // Hide UI
            gridSize: null,
            ...appState,
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

export default WhiteboardRecordView;
