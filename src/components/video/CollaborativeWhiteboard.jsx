/**
 * CollaborativeWhiteboard Component
 * Real-time collaborative whiteboard using Excalidraw with LiveKit data channel sync
 * Excalidraw is MIT licensed - free for commercial use
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useRoomContext } from '@livekit/components-react';

// Import Excalidraw styles
import '@excalidraw/excalidraw/index.css';

/**
 * Custom hook for whiteboard sync via LiveKit data channel
 */
function useWhiteboardSync() {
  const room = useRoomContext();
  const [remoteData, setRemoteData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Track connection state
  useEffect(() => {
    if (!room) return;

    const updateConnectionState = () => {
      setIsConnected(room.state === 'connected');
    };

    updateConnectionState();
    room.on('connected', updateConnectionState);
    room.on('disconnected', updateConnectionState);
    room.on('reconnecting', updateConnectionState);

    return () => {
      room.off('connected', updateConnectionState);
      room.off('disconnected', updateConnectionState);
      room.off('reconnecting', updateConnectionState);
    };
  }, [room]);

  // Send drawing data via LiveKit data channel
  const sendDrawingData = useCallback((elements) => {
    if (!room?.localParticipant || !isConnected || room.state !== 'connected') {
      return;
    }

    try {
      const message = JSON.stringify({
        type: 'whiteboard_sync',
        elements: elements,
        timestamp: Date.now(),
        sender: room.localParticipant.identity,
      });

      room.localParticipant.publishData(
        new TextEncoder().encode(message),
        { reliable: true }
      );
    } catch (error) {
      if (!error.message?.includes('closed') && !error.message?.includes('PC manager')) {
        console.error('Failed to send whiteboard sync:', error);
      }
    }
  }, [room, isConnected]);

  // Listen for remote drawing data
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload, participant) => {
      // Don't process our own messages (check participant)
      if (participant?.identity === room.localParticipant?.identity) return;

      try {
        const text = new TextDecoder().decode(payload);
        const message = JSON.parse(text);

        // Double-check sender identity in message
        if (message.sender === room.localParticipant?.identity) return;

        if (message.type === 'whiteboard_sync' && message.elements) {
          setRemoteData({
            elements: message.elements,
            timestamp: message.timestamp,
            sender: message.sender,
          });
        }
      } catch (error) {
        // Ignore parse errors (might be other message types)
      }
    };

    room.on('dataReceived', handleDataReceived);

    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  return {
    sendDrawingData,
    remoteData,
    clearRemoteData: () => setRemoteData(null),
    isConnected
  };
}

/**
 * Main Whiteboard Component
 */
export function CollaborativeWhiteboard({ sessionId }) {
  const { sendDrawingData, remoteData, clearRemoteData, isConnected } = useWhiteboardSync();
  const excalidrawRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastSyncedRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Update connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'connecting');
  }, [isConnected]);

  // Apply remote changes only when not actively drawing
  useEffect(() => {
    if (!remoteData || !excalidrawRef.current || isDrawingRef.current) return;

    // Don't apply if we just sent this data
    if (lastSyncedRef.current === remoteData.timestamp) return;

    try {
      const api = excalidrawRef.current;
      if (remoteData.elements) {
        api.updateScene({
          elements: remoteData.elements,
        });
      }
    } catch (error) {
      console.error('Failed to apply remote changes:', error);
    } finally {
      clearRemoteData();
    }
  }, [remoteData, clearRemoteData]);

  // Handle pointer down - mark as drawing
  const handlePointerDown = useCallback(() => {
    isDrawingRef.current = true;
  }, []);

  // Handle pointer up - sync after drawing stops
  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;

    // Sync after a short delay when pointer is released
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      if (excalidrawRef.current) {
        const elements = excalidrawRef.current.getSceneElements();
        const timestamp = Date.now();
        lastSyncedRef.current = timestamp;
        sendDrawingData(elements);
      }
    }, 100);
  }, [sendDrawingData]);

  // Handle drawing changes - only sync when not actively drawing
  const handleChange = useCallback((elements, appState) => {
    // Don't sync while actively drawing to prevent flicker
    if (isDrawingRef.current) return;

    // Debounced sync for other changes (like selection, deletion)
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      const timestamp = Date.now();
      lastSyncedRef.current = timestamp;
      sendDrawingData(elements);
    }, 300);
  }, [sendDrawingData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white" style={{ minHeight: '400px' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50 z-10">
        <span className="text-sm font-medium text-gray-700">Whiteboard</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
          }`} />
          <span className="text-xs text-gray-500">
            {connectionStatus === 'connected' ? 'Synced' : 'Syncing...'}
          </span>
        </div>
      </div>

      {/* Excalidraw canvas - needs explicit height */}
      <div
        className="flex-1 relative"
        style={{ minHeight: '300px', height: '100%' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <Excalidraw
          excalidrawAPI={(api) => { excalidrawRef.current = api; }}
          onChange={handleChange}
          initialData={{
            appState: {
              viewBackgroundColor: '#ffffff',
              currentItemFontFamily: 1,
            },
          }}
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
      </div>
    </div>
  );
}

export default CollaborativeWhiteboard;
