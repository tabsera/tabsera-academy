/**
 * LiveKit Video Session Service
 *
 * Manages LiveKit video rooms for tutoring sessions with:
 * - Room creation and management
 * - Access token generation
 * - Composite recording (video + audio + screen share)
 * - Recording to S3 for later Vimeo upload
 */

const { AccessToken, RoomServiceClient, EgressClient, EncodedFileOutput, TrackSource } = require('livekit-server-sdk');

// LiveKit configuration
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || process.env.LIVEKIT_HOST;
// Convert wss:// to https:// for API calls
const LIVEKIT_HOST = LIVEKIT_URL ? LIVEKIT_URL.replace('wss://', 'https://').replace('ws://', 'http://') : null;

// S3 configuration for recording output
const RECORDING_S3_BUCKET = process.env.RECORDING_S3_BUCKET || 'tabsera-recordings';
const RECORDING_S3_REGION = process.env.RECORDING_S3_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Check if LiveKit is properly configured
const LIVEKIT_ENABLED = !!(LIVEKIT_API_KEY && LIVEKIT_API_SECRET && LIVEKIT_HOST);

// Initialize clients only if enabled
let roomService = null;
let egressClient = null;

if (LIVEKIT_ENABLED) {
  try {
    roomService = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    egressClient = new EgressClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    console.log('LiveKit service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize LiveKit clients:', error.message);
  }
}

/**
 * Generate a unique room name from session ID
 * @param {string} sessionId - The tutoring session ID
 * @returns {string} Clean room name
 */
function generateRoomName(sessionId) {
  return `session-${sessionId}`.replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * Create an access token for a participant
 * @param {Object} params - Token parameters
 * @param {string} params.roomName - Room to join
 * @param {string} params.participantId - Unique participant ID
 * @param {string} params.participantName - Display name
 * @param {boolean} params.isTutor - Whether this is the tutor
 * @param {number} params.ttl - Token TTL in seconds (default: 2 hours)
 * @returns {string} JWT access token
 */
async function createAccessToken({ roomName, participantId, participantName, isTutor, ttl = 7200 }) {
  if (!LIVEKIT_ENABLED) {
    throw new Error('LiveKit is not configured');
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantId,
    name: participantName,
    ttl,
  });

  // Grant permissions based on role
  // Both tutor and student can:
  // - Publish video and audio
  // - Publish data (for whiteboard sync)
  // - Subscribe to others
  // Only tutor can:
  // - Screen share
  // - Control room settings
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    // Screen share enabled for both, but we'll control via UI
    canPublishSources: isTutor
      ? [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO]
      : [TrackSource.CAMERA, TrackSource.MICROPHONE],
    roomAdmin: isTutor, // Tutors can manage room
  });

  // toJwt() returns a Promise in livekit-server-sdk v2+
  return await token.toJwt();
}

/**
 * Create a LiveKit room for a session
 * @param {Object} params - Room parameters
 * @param {string} params.sessionId - Session ID
 * @param {string} params.tutorName - Tutor's name for metadata
 * @param {string} params.studentName - Student's name for metadata
 * @param {string} params.topic - Session topic for metadata
 * @returns {Promise<{roomName: string, roomSid: string}>}
 */
async function createRoom({ sessionId, tutorName, studentName, topic }) {
  if (!LIVEKIT_ENABLED) {
    console.warn('LiveKit not enabled, returning mock room');
    return {
      roomName: generateRoomName(sessionId),
      roomSid: `mock-sid-${sessionId}`,
    };
  }

  const roomName = generateRoomName(sessionId);

  try {
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 60 * 10, // 10 minutes empty before auto-close
      maxParticipants: 3, // Tutor + Student + Admin (if needed)
      metadata: JSON.stringify({
        sessionId,
        tutorName,
        studentName,
        topic,
        createdAt: new Date().toISOString(),
      }),
    });

    return {
      roomName: room.name,
      roomSid: room.sid,
    };
  } catch (error) {
    console.error('Failed to create LiveKit room:', error.message);
    throw error;
  }
}

/**
 * Start composite recording for a room
 * Records all participants in a grid layout with audio
 * @param {Object} params - Recording parameters
 * @param {string} params.roomName - Room to record
 * @param {string} params.sessionId - Session ID for file naming
 * @returns {Promise<{egressId: string}>}
 */
async function startRecording({ roomName, sessionId }) {
  if (!LIVEKIT_ENABLED || !egressClient) {
    console.warn('LiveKit egress not configured, skipping recording');
    return { egressId: null };
  }

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.warn('S3 credentials not configured, skipping recording');
    return { egressId: null };
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `session-${sessionId}-${timestamp}.mp4`;

    // Configure S3 output
    const s3Output = new EncodedFileOutput({
      filepath: filename,
      s3: {
        accessKey: AWS_ACCESS_KEY_ID,
        secret: AWS_SECRET_ACCESS_KEY,
        bucket: RECORDING_S3_BUCKET,
        region: RECORDING_S3_REGION,
      },
    });

    // Start room composite egress (records all tracks in grid)
    const egress = await egressClient.startRoomCompositeEgress(
      roomName,
      {
        file: s3Output,
      },
      {
        layout: 'grid', // Grid layout for multiple participants
        customBaseUrl: undefined, // Use default layout
        audioOnly: false,
        videoOnly: false,
      }
    );

    console.log(`Recording started for room ${roomName}, egress ID: ${egress.egressId}`);

    return {
      egressId: egress.egressId,
      filename,
    };
  } catch (error) {
    console.error('Failed to start recording:', error.message);
    // Don't throw - recording is optional, session should continue
    return { egressId: null, error: error.message };
  }
}

/**
 * Stop a recording
 * @param {string} egressId - Egress ID to stop
 * @returns {Promise<{success: boolean, fileUrl?: string}>}
 */
async function stopRecording(egressId) {
  if (!LIVEKIT_ENABLED || !egressClient || !egressId) {
    return { success: false };
  }

  try {
    const result = await egressClient.stopEgress(egressId);

    // The file URL will be in the webhook callback
    // or we can construct it from the S3 bucket
    return {
      success: true,
      status: result.status,
    };
  } catch (error) {
    console.error('Failed to stop recording:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get the status of a room
 * @param {string} roomName - Room name
 * @returns {Promise<{exists: boolean, participants: number}>}
 */
async function getRoomStatus(roomName) {
  if (!LIVEKIT_ENABLED) {
    return { exists: false, participants: 0 };
  }

  try {
    const rooms = await roomService.listRooms([roomName]);
    const room = rooms.find(r => r.name === roomName);

    if (!room) {
      return { exists: false, participants: 0 };
    }

    return {
      exists: true,
      participants: room.numParticipants,
      metadata: room.metadata ? JSON.parse(room.metadata) : null,
    };
  } catch (error) {
    console.error('Failed to get room status:', error.message);
    return { exists: false, participants: 0 };
  }
}

/**
 * List participants in a room
 * @param {string} roomName - Room name
 * @returns {Promise<Array>}
 */
async function listParticipants(roomName) {
  if (!LIVEKIT_ENABLED) {
    return [];
  }

  try {
    const participants = await roomService.listParticipants(roomName);
    return participants.map(p => ({
      identity: p.identity,
      name: p.name,
      state: p.state,
      joinedAt: p.joinedAt,
      isPublishing: p.tracks.length > 0,
    }));
  } catch (error) {
    console.error('Failed to list participants:', error.message);
    return [];
  }
}

/**
 * Remove a participant from a room
 * @param {string} roomName - Room name
 * @param {string} participantId - Participant identity
 */
async function removeParticipant(roomName, participantId) {
  if (!LIVEKIT_ENABLED) {
    return { success: false };
  }

  try {
    await roomService.removeParticipant(roomName, participantId);
    return { success: true };
  } catch (error) {
    console.error('Failed to remove participant:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Close a room (end session)
 * @param {string} roomName - Room to close
 * @returns {Promise<{success: boolean}>}
 */
async function closeRoom(roomName) {
  if (!LIVEKIT_ENABLED) {
    return { success: true };
  }

  try {
    await roomService.deleteRoom(roomName);
    return { success: true };
  } catch (error) {
    console.error('Failed to close room:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get egress info by ID
 * @param {string} egressId - Egress ID
 * @returns {Promise<Object>}
 */
async function getEgressInfo(egressId) {
  if (!LIVEKIT_ENABLED || !egressClient || !egressId) {
    return null;
  }

  try {
    const egresses = await egressClient.listEgress({ egressId });
    return egresses[0] || null;
  } catch (error) {
    console.error('Failed to get egress info:', error.message);
    return null;
  }
}

/**
 * Construct S3 file URL for a recording
 * @param {string} filename - Recording filename
 * @returns {string} S3 URL
 */
function getRecordingS3Url(filename) {
  return `https://${RECORDING_S3_BUCKET}.s3.${RECORDING_S3_REGION}.amazonaws.com/${filename}`;
}

/**
 * Verify a LiveKit webhook signature
 * @param {string} body - Request body as string
 * @param {string} signature - Authorization header value
 * @returns {boolean} Whether the signature is valid
 */
function verifyWebhookSignature(body, signature) {
  if (!LIVEKIT_ENABLED || !signature) {
    return false;
  }

  // LiveKit webhooks use the same auth as the API
  // The Authorization header contains: Bearer <api_key>:<sha256_signature>
  try {
    const crypto = require('crypto');
    const [bearer, authValue] = signature.split(' ');

    if (bearer !== 'Bearer' || !authValue) {
      return false;
    }

    const [apiKey, providedSignature] = authValue.split(':');

    if (apiKey !== LIVEKIT_API_KEY) {
      return false;
    }

    // Compute expected signature
    const hmac = crypto.createHmac('sha256', LIVEKIT_API_SECRET);
    hmac.update(body);
    const expectedSignature = hmac.digest('base64');

    return providedSignature === expectedSignature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return false;
  }
}

module.exports = {
  LIVEKIT_ENABLED,
  LIVEKIT_HOST,
  LIVEKIT_URL,
  generateRoomName,
  createAccessToken,
  createRoom,
  startRecording,
  stopRecording,
  getRoomStatus,
  listParticipants,
  removeParticipant,
  closeRoom,
  getEgressInfo,
  getRecordingS3Url,
  verifyWebhookSignature,
};
