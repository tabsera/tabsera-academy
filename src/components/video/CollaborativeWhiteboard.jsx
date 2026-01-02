/**
 * CollaborativeWhiteboard Component
 * Real-time collaborative whiteboard using tldraw with LiveKit data channel sync
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils } from 'tldraw';
import { useRoomContext } from '@livekit/components-react';
import 'tldraw/tldraw.css';

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
  const [remoteSnapshot, setRemoteSnapshot] = useState(null);
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

  // Send snapshot via LiveKit data channel
  const sendSnapshot = useCallback((snapshot) => {
    if (!room?.localParticipant || !isConnected || room.state !== 'connected') {
      return;
    }

    // Don't send if it's the same as last sent
    const snapshotStr = JSON.stringify(snapshot);
    if (snapshotStr === lastSentRef.current) {
      return;
    }
    lastSentRef.current = snapshotStr;

    try {
      const data = JSON.stringify({
        type: 'whiteboard_sync',
        snapshot,
        timestamp: Date.now(),
        sender: room.localParticipant.identity,
      });

      room.localParticipant.publishData(
        new TextEncoder().encode(data),
        { reliable: true }
      );
    } catch (error) {
      // Silently ignore connection errors
      if (!error.message?.includes('closed') && !error.message?.includes('PC manager')) {
        console.error('Failed to send whiteboard sync:', error);
      }
    }
  }, [room, isConnected]);

  // Listen for remote snapshots
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload, participant) => {
      // Don't process our own messages
      if (participant?.identity === room.localParticipant?.identity) return;

      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'whiteboard_sync' && data.snapshot) {
          setRemoteSnapshot(data.snapshot);
        }
      } catch (error) {
        // Ignore parse errors
      }
    };

    room.on('dataReceived', handleDataReceived);

    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  return { sendSnapshot, remoteSnapshot, clearRemoteSnapshot: () => setRemoteSnapshot(null), isConnected };
}

/**
 * Main Whiteboard Component
 */
export function CollaborativeWhiteboard({ sessionId }) {
  const { sendSnapshot, remoteSnapshot, clearRemoteSnapshot, isConnected } = useWhiteboardSync();
  const editorRef = useRef(null);
  const isApplyingRemoteRef = useRef(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Update connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'connecting');
  }, [isConnected]);

  // Debounced sync function
  const debouncedSync = useCallback(
    debounce((editor) => {
      if (isApplyingRemoteRef.current || !editor) return;

      try {
        // Get document snapshot for sync
        const snapshot = editor.store.getSnapshot();
        sendSnapshot({
          document: snapshot.document,
          schema: snapshot.schema,
        });
      } catch (error) {
        console.error('Failed to get snapshot:', error);
      }
    }, 100),
    [sendSnapshot]
  );

  // Apply remote snapshot
  useEffect(() => {
    if (!remoteSnapshot || !editorRef.current) return;

    isApplyingRemoteRef.current = true;

    try {
      const editor = editorRef.current;

      // Load the remote snapshot
      if (remoteSnapshot.document) {
        editor.store.loadSnapshot({
          document: remoteSnapshot.document,
          schema: remoteSnapshot.schema,
        });
      }
    } catch (error) {
      console.error('Failed to apply remote snapshot:', error);
    } finally {
      isApplyingRemoteRef.current = false;
      clearRemoteSnapshot();
    }
  }, [remoteSnapshot, clearRemoteSnapshot]);

  // Handle editor mount
  const handleMount = useCallback((editor) => {
    editorRef.current = editor;

    // Listen to store changes
    const unsubscribe = editor.store.listen(
      (entry) => {
        // Only sync user changes, not remote changes
        if (entry.source === 'user' && !isApplyingRemoteRef.current) {
          debouncedSync(editor);
        }
      },
      { source: 'user', scope: 'document' }
    );

    // Initial zoom
    editor.zoomToFit();

    return () => {
      unsubscribe();
      editorRef.current = null;
    };
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

      {/* Tldraw canvas */}
      <div className="flex-1 min-h-0">
        <Tldraw
          onMount={handleMount}
          autoFocus={false}
        />
      </div>
    </div>
  );
}

export default CollaborativeWhiteboard;
