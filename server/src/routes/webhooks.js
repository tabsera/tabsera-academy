/**
 * Webhook Routes
 * Handles incoming webhooks from external services
 */

const express = require('express');
const livekitService = require('../services/livekit');
const recordingPipeline = require('../services/recordingPipeline');

const router = express.Router();

/**
 * POST /api/webhooks/livekit
 * Handle LiveKit egress and room events
 *
 * Event types:
 * - egress_started: Recording has started
 * - egress_ended: Recording has finished (file ready)
 * - egress_updated: Recording status update
 * - room_started: Room was created
 * - room_finished: Room was closed
 * - participant_joined: Someone joined
 * - participant_left: Someone left
 */
router.post('/livekit', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    // Get the raw body for signature verification
    const rawBody = req.body.toString();

    // Verify webhook signature using SDK's WebhookReceiver (async)
    const authHeader = req.headers['authorization'];
    const { valid, event } = await livekitService.verifyWebhookSignature(rawBody, authHeader);

    if (!valid || !event) {
      console.warn('LiveKit webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Debug: log the full event structure
    console.log('LiveKit webhook event keys:', Object.keys(event));
    console.log('LiveKit webhook event:', JSON.stringify(event, null, 2).substring(0, 500));

    console.log(`LiveKit webhook received: ${event.event}`, {
      roomName: event.room?.name,
      egressId: event.egressInfo?.egressId,
    });

    // Handle different event types
    switch (event.event) {
      case 'egress_started':
        await handleEgressStarted(event);
        break;

      case 'egress_ended':
        await handleEgressEnded(event);
        break;

      case 'egress_updated':
        await handleEgressUpdated(event);
        break;

      case 'room_started':
        console.log(`Room started: ${event.room?.name}`);
        break;

      case 'room_finished':
        console.log(`Room finished: ${event.room?.name}`);
        break;

      case 'participant_joined':
        console.log(`Participant joined ${event.room?.name}: ${event.participant?.identity}`);
        break;

      case 'participant_left':
        console.log(`Participant left ${event.room?.name}: ${event.participant?.identity}`);
        break;

      default:
        console.log(`Unhandled LiveKit event: ${event.event}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('LiveKit webhook error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Handle egress started event
 */
async function handleEgressStarted(event) {
  const { egressInfo } = event;

  if (!egressInfo) return;

  console.log(`Recording started: ${egressInfo.egressId}`);

  // Recording has started, update session status
  // The session is already updated when we call startRecording
}

/**
 * Handle egress ended event (recording file is ready)
 */
async function handleEgressEnded(event) {
  const { egressInfo } = event;

  if (!egressInfo) return;

  const egressId = egressInfo.egressId;
  console.log(`Recording ended: ${egressId}`);

  // Get the file info
  const fileResult = egressInfo.file || egressInfo.fileResults?.[0];

  if (!fileResult) {
    console.error('No file info in egress ended event');
    await recordingPipeline.handleRecordingFailure(egressId, 'No file produced');
    return;
  }

  // Construct the S3 URL
  const filename = fileResult.filename;
  const fileUrl = livekitService.getRecordingS3Url(filename);

  console.log(`Recording file ready: ${fileUrl}`);

  // Process the recording (upload to Vimeo)
  await recordingPipeline.processRecording({
    egressId,
    fileUrl,
    filename,
  });
}

/**
 * Handle egress updated event
 */
async function handleEgressUpdated(event) {
  const { egressInfo } = event;

  if (!egressInfo) return;

  // Check for errors
  if (egressInfo.error) {
    console.error(`Recording error for ${egressInfo.egressId}:`, egressInfo.error);
    await recordingPipeline.handleRecordingFailure(egressInfo.egressId, egressInfo.error);
  }
}

/**
 * POST /api/webhooks/livekit/test
 * Test endpoint for development
 */
router.post('/livekit/test', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  console.log('Test webhook received:', req.body);
  res.json({ received: true, body: req.body });
});

module.exports = router;
