/**
 * CollaborativeWhiteboard Component
 * Real-time collaborative whiteboard using Excalidraw
 * Syncs via LiveKit data channel + backend polling fallback
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { tutorsApi } from '@/api/tutors';

// Import Excalidraw styles
import '@excalidraw/excalidraw/index.css';

// Save interval in milliseconds (1 second for near real-time sync)
const SAVE_INTERVAL = 1000;
// Poll interval for fallback sync (700ms for responsive sync)
const POLL_INTERVAL = 700;

/**
 * Main Whiteboard Component
 * Must be used inside a LiveKitRoom context
 */
export function CollaborativeWhiteboard({ sessionId }) {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const excalidrawRef = useRef(null);
  const isReceivingRef = useRef(false);
  const lastSentRef = useRef(0);
  const lastSavedRef = useRef(0);
  const lastPolledVersionRef = useRef(0);
  const pendingUpdateRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const initialStateRef = useRef(null);
  const room = useRoomContext();

  // Debug logging
  const log = useCallback((msg, ...args) => {
    console.log(`[Whiteboard ${room?.localParticipant?.identity || 'unknown'}]`, msg, ...args);
  }, [room?.localParticipant?.identity]);

  // Load saved whiteboard state on mount
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    const loadSavedState = async () => {
      try {
        log('Loading saved state for session', sessionId);
        const response = await tutorsApi.getWhiteboard(sessionId);

        if (response.success && response.snapshot?.elements?.length > 0) {
          log('Found saved state with', response.snapshot.elements.length, 'elements');
          initialStateRef.current = response.snapshot;
          lastPolledVersionRef.current = response.snapshot.savedAt || 0;

          if (excalidrawRef.current) {
            excalidrawRef.current.updateScene({
              elements: response.snapshot.elements,
              appState: response.snapshot.appState || {}
            });
          }
        } else {
          log('No saved state found');
        }
      } catch (error) {
        console.error('Whiteboard: Failed to load saved state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedState();
  }, [sessionId, log]);

  // Save whiteboard state to backend
  const saveToBackend = useCallback(async (force = false) => {
    if (!sessionId || !excalidrawRef.current) return;

    const now = Date.now();
    if (!force && now - lastSavedRef.current < SAVE_INTERVAL) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => saveToBackend(true), SAVE_INTERVAL);
      return;
    }

    lastSavedRef.current = now;

    try {
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();

      const snapshot = {
        elements: elements.map(el => ({ ...el })),
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemFontFamily: appState.currentItemFontFamily,
        },
        savedAt: now,
      };

      log('Saving state with', elements.length, 'elements');
      await tutorsApi.saveWhiteboard(sessionId, snapshot);
      lastPolledVersionRef.current = now; // Update our version so we don't re-apply our own save
      log('Saved to backend');
    } catch (error) {
      console.error('Whiteboard: Failed to save:', error);
    }
  }, [sessionId, log]);

  // Poll backend for updates (fallback sync mechanism)
  const pollForUpdates = useCallback(async () => {
    if (!sessionId || !excalidrawRef.current || isReceivingRef.current) return;

    try {
      const response = await tutorsApi.getWhiteboard(sessionId);

      if (response.success && response.snapshot?.elements) {
        const serverVersion = response.snapshot.savedAt || 0;

        // Only apply if server has newer version than what we last saw
        if (serverVersion > lastPolledVersionRef.current) {
          log('Poll: Found newer version', serverVersion, '>', lastPolledVersionRef.current);
          lastPolledVersionRef.current = serverVersion;

          isReceivingRef.current = true;
          excalidrawRef.current.updateScene({ elements: response.snapshot.elements });
          setLastSyncTime(new Date());
          setTimeout(() => { isReceivingRef.current = false; }, 200);
        }
      }
    } catch (error) {
      // Silent fail for polling
    }
  }, [sessionId, log]);

  // Start polling when connected
  useEffect(() => {
    if (room?.state === 'connected' && sessionId) {
      log('Starting poll interval');
      pollIntervalRef.current = setInterval(pollForUpdates, POLL_INTERVAL);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [room?.state, sessionId, pollForUpdates, log]);

  // Send data via LiveKit data channel (direct room API)
  // Using proper LiveKit topic system for better iPad compatibility
  const sendWhiteboardData = useCallback((data) => {
    if (!room?.localParticipant) {
      log('Cannot send - no local participant');
      return false;
    }

    try {
      const payload = new TextEncoder().encode(JSON.stringify(data));
      log('Sending', data.type, 'with', data.elements?.length || 0, 'elements');

      // Use DataPacket_Kind.RELIABLE and topic option for better cross-platform support
      room.localParticipant.publishData(payload, {
        reliable: true,
        topic: 'whiteboard',
      });
      log('Sent OK');
      return true;
    } catch (e) {
      console.error('Whiteboard: Send failed:', e);
      return false;
    }
  }, [room, log]);

  // Handle incoming data from LiveKit
  useEffect(() => {
    if (!room) return;

    // Note: DataReceived gives (payload, participant, kind, topic)
    const handleDataReceived = (payload, participant, kind, topic) => {
      // Skip our own messages
      if (participant?.identity === room.localParticipant?.identity) {
        return;
      }

      // Only handle whiteboard messages (check topic parameter)
      if (topic !== 'whiteboard') return;

      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        log('=== Received from', participant?.identity, '===');
        log('Type:', data.type);

        if (data.type === 'update' || data.type === 'full_state') {
          log('Applying', data.elements?.length, 'elements');

          if (data.elements && excalidrawRef.current) {
            isReceivingRef.current = true;
            excalidrawRef.current.updateScene({ elements: data.elements });
            setLastSyncTime(new Date());
            setTimeout(() => { isReceivingRef.current = false; }, 200);
          }
        } else if (data.type === 'request') {
          log('Sync request - sending full state');
          const elements = excalidrawRef.current?.getSceneElements() || [];
          sendWhiteboardData({
            type: 'full_state',
            elements: elements.map(el => ({ ...el })),
            timestamp: Date.now(),
          });
        } else if (data.type === 'clear') {
          log('Clear request received');
          if (excalidrawRef.current) {
            excalidrawRef.current.resetScene();
          }
        }
      } catch (e) {
        // Not a JSON message or not for us
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    log('Listening for data on room');

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, sendWhiteboardData, log]);

  // Update connection status
  useEffect(() => {
    if (room?.state === 'connected') {
      setConnectionStatus('connected');
      log('Room connected');

      // Request full state from peers after connection
      setTimeout(() => {
        sendWhiteboardData({
          type: 'request',
          timestamp: Date.now(),
        });
      }, 1500);
    }
  }, [room?.state, sendWhiteboardData, log]);

  // Reset canvas handler
  const handleResetCanvas = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear the whiteboard? This cannot be undone.')) {
      return;
    }

    if (excalidrawRef.current) {
      excalidrawRef.current.resetScene();
    }

    // Clear saved state in backend
    if (sessionId) {
      try {
        await tutorsApi.saveWhiteboard(sessionId, {
          elements: [],
          appState: {},
          clearedAt: Date.now(),
          savedAt: Date.now()
        });
        lastPolledVersionRef.current = Date.now();
        log('Cleared backend state');
      } catch (error) {
        console.error('Whiteboard: Failed to clear backend state:', error);
      }
    }

    // Broadcast clear to other participants
    sendWhiteboardData({
      type: 'clear',
      timestamp: Date.now(),
    });
  }, [sessionId, sendWhiteboardData, log]);

  // Manual sync button
  const handleManualSync = useCallback(async () => {
    log('Manual sync triggered');
    await pollForUpdates();
  }, [pollForUpdates, log]);

  // Handle local changes with debouncing
  const handleChange = useCallback((elements, appState) => {
    // Skip if we're receiving remote changes
    if (isReceivingRef.current) return;

    const now = Date.now();

    // Debounce sending (max once every 150ms for more responsive sync)
    if (now - lastSentRef.current < 150) {
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
      pendingUpdateRef.current = setTimeout(() => {
        const currentElements = excalidrawRef.current?.getSceneElements() || [];
        sendWhiteboardData({
          type: 'update',
          elements: currentElements.map(el => ({ ...el })),
          timestamp: Date.now(),
        });
        lastSentRef.current = Date.now();
        saveToBackend();
      }, 150);
      return;
    }

    // Send immediately
    lastSentRef.current = now;
    sendWhiteboardData({
      type: 'update',
      elements: elements.map(el => ({ ...el })),
      timestamp: now,
    });

    // Save to backend (debounced)
    saveToBackend();
  }, [sendWhiteboardData, saveToBackend]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (pendingUpdateRef.current) clearTimeout(pendingUpdateRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Get initial data for Excalidraw
  const getInitialData = () => {
    if (initialStateRef.current?.elements?.length > 0) {
      return {
        elements: initialStateRef.current.elements,
        appState: {
          viewBackgroundColor: initialStateRef.current.appState?.viewBackgroundColor || '#ffffff',
          currentItemFontFamily: initialStateRef.current.appState?.currentItemFontFamily || 1,
        },
      };
    }
    return {
      appState: {
        viewBackgroundColor: '#ffffff',
        currentItemFontFamily: 1,
      },
    };
  };

  return (
    <div className="h-full w-full flex flex-col bg-white" style={{ minHeight: '400px' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50 z-10">
        <span className="text-sm font-medium text-gray-700">Whiteboard</span>
        <div className="flex items-center gap-2">
          {/* Manual sync button */}
          <button
            onClick={handleManualSync}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Sync now"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetCanvas}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Reset Canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-xs text-gray-500">
              {connectionStatus === 'connected' ? 'Synced' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Excalidraw canvas */}
      <div className="flex-1 relative" style={{ minHeight: '300px', height: '100%' }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-500">Loading whiteboard...</div>
          </div>
        ) : (
          <Excalidraw
            excalidrawAPI={(api) => { excalidrawRef.current = api; }}
            onChange={handleChange}
            initialData={getInitialData()}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                export: false,
                saveAsImage: true,
              },
            }}
            theme="light"
          />
        )}
      </div>
    </div>
  );
}

export default CollaborativeWhiteboard;
