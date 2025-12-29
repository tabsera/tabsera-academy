/**
 * CollaborativeWhiteboard Component
 * Real-time collaborative whiteboard using tldraw with LiveKit data channel sync
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tldraw, useEditor, createTLStore, defaultShapeUtils } from '@tldraw/tldraw';
import { useDataChannel, useRoomContext } from '@livekit/components-react';
import { debounce } from '../../utils/debounce';
import '@tldraw/tldraw/tldraw.css';

// Custom hook for whiteboard sync
function useWhiteboardSync() {
  const room = useRoomContext();
  const [remoteChanges, setRemoteChanges] = useState([]);

  // Send changes via LiveKit data channel
  const sendChanges = useCallback((changes) => {
    if (!room?.localParticipant) return;

    try {
      const data = JSON.stringify({
        type: 'whiteboard',
        changes,
        timestamp: Date.now(),
      });

      room.localParticipant.publishData(
        new TextEncoder().encode(data),
        { reliable: true }
      );
    } catch (error) {
      console.error('Failed to send whiteboard changes:', error);
    }
  }, [room]);

  // Listen for remote changes
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload, participant) => {
      // Don't process our own messages
      if (participant?.identity === room.localParticipant?.identity) return;

      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'whiteboard') {
          setRemoteChanges(prev => [...prev, data.changes]);
        }
      } catch (error) {
        // Not a whiteboard message or parse error
      }
    };

    room.on('dataReceived', handleDataReceived);

    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  return { sendChanges, remoteChanges, clearRemoteChanges: () => setRemoteChanges([]) };
}

// Inner component that uses tldraw's useEditor hook
function WhiteboardInner({ sessionId, onChanges }) {
  const editor = useEditor();
  const { sendChanges, remoteChanges, clearRemoteChanges } = useWhiteboardSync();
  const isApplyingRemote = useRef(false);

  // Debounced change handler
  const debouncedSend = useCallback(
    debounce((changes) => {
      if (!isApplyingRemote.current) {
        sendChanges(changes);
        onChanges?.(changes);
      }
    }, 50),
    [sendChanges, onChanges]
  );

  // Listen to local changes
  useEffect(() => {
    if (!editor) return;

    const handleChange = (change) => {
      // Don't broadcast if we're applying remote changes
      if (isApplyingRemote.current) return;

      // Extract relevant change info
      const changes = {
        source: change.source,
        changes: {
          added: change.changes?.added,
          updated: change.changes?.updated,
          removed: change.changes?.removed,
        },
      };

      debouncedSend(changes);
    };

    // Subscribe to store changes
    const unsubscribe = editor.store.listen(handleChange, { source: 'user' });

    return () => {
      unsubscribe();
    };
  }, [editor, debouncedSend]);

  // Apply remote changes
  useEffect(() => {
    if (!editor || remoteChanges.length === 0) return;

    isApplyingRemote.current = true;

    try {
      remoteChanges.forEach((changes) => {
        // Apply shape changes
        if (changes.changes) {
          const { added, updated, removed } = changes.changes;

          if (added && Object.keys(added).length > 0) {
            Object.values(added).forEach((shape) => {
              if (shape && shape.typeName === 'shape') {
                editor.createShape(shape);
              }
            });
          }

          if (updated && Object.keys(updated).length > 0) {
            Object.entries(updated).forEach(([id, update]) => {
              if (update && update[1]) {
                editor.updateShape({ id, ...update[1] });
              }
            });
          }

          if (removed && Object.keys(removed).length > 0) {
            const shapeIds = Object.keys(removed).filter((id) => id.startsWith('shape:'));
            if (shapeIds.length > 0) {
              editor.deleteShapes(shapeIds);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error applying remote changes:', error);
    } finally {
      isApplyingRemote.current = false;
      clearRemoteChanges();
    }
  }, [editor, remoteChanges, clearRemoteChanges]);

  return null;
}

export function CollaborativeWhiteboard({ sessionId, onSave }) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));

  const handleMount = useCallback((editor) => {
    // Set initial zoom and center
    editor.zoomToFit();
  }, []);

  const handleChanges = useCallback((changes) => {
    // Auto-save periodically (handled by parent)
    onSave?.(changes);
  }, [onSave]);

  return (
    <div className="h-full w-full relative">
      {/* Whiteboard header */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b z-10 px-3 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Whiteboard</span>
        <span className="text-xs text-gray-400">Collaborative</span>
      </div>

      {/* tldraw container */}
      <div className="h-full pt-10">
        <Tldraw
          store={store}
          onMount={handleMount}
          hideUi={false}
          className="h-full"
        >
          <WhiteboardInner sessionId={sessionId} onChanges={handleChanges} />
        </Tldraw>
      </div>
    </div>
  );
}

export default CollaborativeWhiteboard;
