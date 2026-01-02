/**
 * CollaborativeWhiteboard Component
 * Real-time collaborative whiteboard using Excalidraw with LiveKit data channel sync
 * Excalidraw is MIT licensed - free for commercial use
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import { useRoomContext } from '@livekit/components-react';

/**
 * Debounce utility
 */
function debounce(fn, ms) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Custom hook for whiteboard sync via LiveKit data channel
 */
function useWhiteboardSync() {
  const room = useRoomContext();
  const [remoteData, setRemoteData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastSentRef = useRef(null);

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
  const sendDrawingData = useCallback((elements, appState) => {
    if (!room?.localParticipant || !isConnected || room.state !== 'connected') {
      return;
    }

    // Only send essential data (elements and viewport)
    const dataToSend = {
      elements: elements,
      scrollX: appState?.scrollX,
      scrollY: appState?.scrollY,
      zoom: appState?.zoom?.value,
    };

    const dataStr = JSON.stringify(dataToSend);

    // Don't send if identical to last sent
    if (dataStr === lastSentRef.current) {
      return;
    }
    lastSentRef.current = dataStr;

    try {
      const message = JSON.stringify({
        type: 'whiteboard_sync',
        data: dataToSend,
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
      // Don't process our own messages
      if (participant?.identity === room.localParticipant?.identity) return;

      try {
        const text = new TextDecoder().decode(payload);
        const message = JSON.parse(text);

        if (message.type === 'whiteboard_sync' && message.data) {
          setRemoteData(message.data);
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
  const isApplyingRemoteRef = useRef(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Update connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'connecting');
  }, [isConnected]);

  // Debounced sync function
  const debouncedSync = useCallback(
    debounce((elements, appState) => {
      if (isApplyingRemoteRef.current) return;
      sendDrawingData(elements, appState);
    }, 150),
    [sendDrawingData]
  );

  // Apply remote changes
  useEffect(() => {
    if (!remoteData || !excalidrawRef.current) return;

    isApplyingRemoteRef.current = true;

    try {
      const api = excalidrawRef.current;

      if (remoteData.elements) {
        // Update scene with remote elements
        api.updateScene({
          elements: remoteData.elements,
        });
      }
    } catch (error) {
      console.error('Failed to apply remote changes:', error);
    } finally {
      // Small delay before allowing local changes to sync again
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 100);
      clearRemoteData();
    }
  }, [remoteData, clearRemoteData]);

  // Handle drawing changes
  const handleChange = useCallback((elements, appState) => {
    if (!isApplyingRemoteRef.current) {
      debouncedSync(elements, appState);
    }
  }, [debouncedSync]);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
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

      {/* Excalidraw canvas */}
      <div className="flex-1 min-h-0">
        <Excalidraw
          ref={excalidrawRef}
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
