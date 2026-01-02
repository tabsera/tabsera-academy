/**
 * Recording Pipeline Service
 *
 * Orchestrates the recording workflow:
 * 1. LiveKit Egress → S3 (triggered by session end)
 * 2. S3 → Vimeo upload (triggered by webhook)
 * 3. Session update with Vimeo URL
 * 4. S3 cleanup after successful Vimeo upload
 */

const { PrismaClient } = require('@prisma/client');
const { S3Client, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const livekitService = require('./livekit');
const vimeoService = require('./vimeo');

const prisma = new PrismaClient();

// S3 client for managing recording files
const s3Client = new S3Client({
  region: process.env.RECORDING_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const RECORDING_S3_BUCKET = process.env.RECORDING_S3_BUCKET || 'tabsera-recordings';
const APP_DOMAIN = process.env.APP_DOMAIN || 'tabsera.com';

/**
 * Initialize recording for a session (called when session starts)
 * @param {string} sessionId - Session ID
 * @returns {Promise<{success: boolean, egressId?: string}>}
 */
async function initializeRecording(sessionId) {
  try {
    // Get session details
    const session = await prisma.tutorSession.findUnique({
      where: { id: sessionId },
      include: {
        tutorProfile: { include: { user: true } },
        student: true,
        course: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.livekitRoomName) {
      throw new Error('No LiveKit room associated with session');
    }

    // Start recording
    const { egressId, filename } = await livekitService.startRecording({
      roomName: session.livekitRoomName,
      sessionId,
    });

    if (egressId) {
      // Update session with recording info
      await prisma.tutorSession.update({
        where: { id: sessionId },
        data: {
          recordingStatus: 'recording',
          recordingEgressId: egressId,
        },
      });

      console.log(`Recording initialized for session ${sessionId}`);
      return { success: true, egressId, filename };
    }

    return { success: false, error: 'Failed to start recording' };
  } catch (error) {
    console.error('Failed to initialize recording:', error.message);

    // Update session status to failed
    await prisma.tutorSession.update({
      where: { id: sessionId },
      data: { recordingStatus: 'failed' },
    }).catch(() => {});

    return { success: false, error: error.message };
  }
}

/**
 * Stop recording for a session (called when session ends)
 * @param {string} sessionId - Session ID
 * @returns {Promise<{success: boolean}>}
 */
async function stopSessionRecording(sessionId) {
  try {
    const session = await prisma.tutorSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.recordingEgressId) {
      return { success: false, error: 'No active recording found' };
    }

    // Stop the egress
    const result = await livekitService.stopRecording(session.recordingEgressId);

    if (result.success) {
      // Update status - webhook will update to 'processing' when file is ready
      await prisma.tutorSession.update({
        where: { id: sessionId },
        data: { recordingStatus: 'pending' },
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to stop recording:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Process a completed recording (called by LiveKit webhook)
 * Uploads to Vimeo and updates session
 * @param {Object} params - Parameters from webhook
 * @param {string} params.egressId - LiveKit egress ID
 * @param {string} params.fileUrl - S3 URL of the recording
 * @param {string} params.filename - Recording filename
 * @returns {Promise<{success: boolean}>}
 */
async function processRecording({ egressId, fileUrl, filename }) {
  console.log(`Processing recording: ${egressId}`);

  try {
    // Find session by egress ID
    const session = await prisma.tutorSession.findFirst({
      where: { recordingEgressId: egressId },
      include: {
        tutorProfile: { include: { user: true } },
        student: true,
        course: true,
      },
    });

    if (!session) {
      console.error(`No session found for egress ID: ${egressId}`);
      return { success: false, error: 'Session not found' };
    }

    // Update status to processing
    await prisma.tutorSession.update({
      where: { id: session.id },
      data: { recordingStatus: 'processing' },
    });

    // Helper to get full name
    const getFullName = (user) => {
      if (!user) return null;
      return [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
    };

    // Generate title and description for Vimeo
    const tutorName = getFullName(session.tutorProfile?.user) || 'Tutor';
    const studentName = getFullName(session.student) || 'Student';
    const courseName = session.course?.title || 'General';
    const sessionDate = new Date(session.scheduledAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const title = `Session: ${courseName} - ${sessionDate}`;
    const description = `Tutoring session between ${tutorName} and ${studentName}\n` +
      `Topic: ${session.topic || 'General tutoring'}\n` +
      `Date: ${sessionDate}\n` +
      `Session ID: ${session.id}`;

    // Upload to Vimeo
    const uploadResult = await vimeoService.uploadFromUrl({
      fileUrl,
      title,
      description,
    });

    if (!uploadResult.videoId) {
      throw new Error('Vimeo upload failed');
    }

    console.log(`Vimeo upload initiated for session ${session.id}: ${uploadResult.videoId}`);

    // Add our domains to embed whitelist
    await vimeoService.addEmbedDomain(uploadResult.videoId, 'academy.tabsera.com').catch(() => {});
    await vimeoService.addEmbedDomain(uploadResult.videoId, 'learn.tabsera.com').catch(() => {});
    await vimeoService.addEmbedDomain(uploadResult.videoId, 'localhost').catch(() => {}); // For dev

    // Get the embed URL (may not be available immediately)
    let embedUrl = null;
    try {
      // Wait a bit for video to be registered
      await new Promise(resolve => setTimeout(resolve, 5000));
      embedUrl = await vimeoService.getEmbedUrl(uploadResult.videoId);
    } catch (e) {
      // Embed URL might not be available yet, we'll update later
      console.log('Embed URL not available yet, will be updated later');
    }

    // Update session with Vimeo info
    await prisma.tutorSession.update({
      where: { id: session.id },
      data: {
        recordingStatus: 'completed',
        vimeoVideoId: uploadResult.videoId,
        vimeoVideoUrl: embedUrl,
      },
    });

    // Schedule S3 cleanup (after successful Vimeo upload)
    scheduleS3Cleanup(filename, session.id);

    return { success: true, videoId: uploadResult.videoId };
  } catch (error) {
    console.error('Failed to process recording:', error.message);

    // Try to update the session status
    const session = await prisma.tutorSession.findFirst({
      where: { recordingEgressId: egressId },
    });

    if (session) {
      await prisma.tutorSession.update({
        where: { id: session.id },
        data: { recordingStatus: 'failed' },
      }).catch(() => {});
    }

    return { success: false, error: error.message };
  }
}

/**
 * Handle recording failure (called by LiveKit webhook)
 * @param {string} egressId - LiveKit egress ID
 * @param {string} error - Error message
 */
async function handleRecordingFailure(egressId, error) {
  console.error(`Recording failed for egress ${egressId}:`, error);

  try {
    const session = await prisma.tutorSession.findFirst({
      where: { recordingEgressId: egressId },
    });

    if (session) {
      await prisma.tutorSession.update({
        where: { id: session.id },
        data: { recordingStatus: 'failed' },
      });
    }
  } catch (e) {
    console.error('Failed to update session after recording failure:', e.message);
  }
}

/**
 * Update session with final Vimeo details (embed URL, duration)
 * Called after Vimeo finishes processing
 * @param {string} sessionId - Session ID
 * @returns {Promise<{success: boolean}>}
 */
async function finalizeRecording(sessionId) {
  try {
    const session = await prisma.tutorSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.vimeoVideoId) {
      return { success: false, error: 'No Vimeo video found' };
    }

    // Get video status and details
    const videoStatus = await vimeoService.getVideoStatus(session.vimeoVideoId);

    if (videoStatus.status !== 'available') {
      return { success: false, error: 'Video not ready yet' };
    }

    // Get embed URL
    const embedUrl = await vimeoService.getEmbedUrl(session.vimeoVideoId);

    // Update session
    await prisma.tutorSession.update({
      where: { id: sessionId },
      data: {
        vimeoVideoUrl: embedUrl,
        recordingDuration: videoStatus.duration,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to finalize recording:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Schedule S3 file cleanup after successful Vimeo upload
 * Waits to ensure Vimeo has pulled the file before deleting
 * @param {string} filename - S3 object key
 * @param {string} sessionId - Session ID for logging
 */
function scheduleS3Cleanup(filename, sessionId) {
  // Wait 30 minutes before deleting from S3
  // This gives Vimeo time to pull the file
  const cleanupDelay = 30 * 60 * 1000;

  setTimeout(async () => {
    try {
      // Verify the file exists
      try {
        await s3Client.send(new HeadObjectCommand({
          Bucket: RECORDING_S3_BUCKET,
          Key: filename,
        }));
      } catch (e) {
        console.log(`S3 file ${filename} already deleted or doesn't exist`);
        return;
      }

      // Check that Vimeo video is ready
      const session = await prisma.tutorSession.findUnique({
        where: { id: sessionId },
      });

      if (session?.recordingStatus === 'completed' && session?.vimeoVideoId) {
        const videoStatus = await vimeoService.getVideoStatus(session.vimeoVideoId);

        if (videoStatus.status === 'available') {
          // Safe to delete
          await s3Client.send(new DeleteObjectCommand({
            Bucket: RECORDING_S3_BUCKET,
            Key: filename,
          }));
          console.log(`S3 cleanup: Deleted ${filename} after successful Vimeo upload`);
        } else {
          // Vimeo still processing, schedule another cleanup
          console.log(`Vimeo still processing ${session.vimeoVideoId}, rescheduling cleanup`);
          scheduleS3Cleanup(filename, sessionId);
        }
      }
    } catch (error) {
      console.error('S3 cleanup failed:', error.message);
    }
  }, cleanupDelay);
}

/**
 * Delete recording for a session (admin action)
 * @param {string} sessionId - Session ID
 * @returns {Promise<{success: boolean}>}
 */
async function deleteRecording(sessionId) {
  try {
    const session = await prisma.tutorSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Delete from Vimeo
    if (session.vimeoVideoId) {
      await vimeoService.deleteVideo(session.vimeoVideoId).catch(e => {
        console.error('Failed to delete Vimeo video:', e.message);
      });
    }

    // Update session
    await prisma.tutorSession.update({
      where: { id: sessionId },
      data: {
        recordingStatus: null,
        recordingEgressId: null,
        vimeoVideoId: null,
        vimeoVideoUrl: null,
        recordingDuration: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete recording:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get recording details for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>}
 */
async function getRecordingDetails(sessionId) {
  const session = await prisma.tutorSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      recordingStatus: true,
      vimeoVideoId: true,
      vimeoVideoUrl: true,
      recordingDuration: true,
      scheduledAt: true,
      startedAt: true,
      endedAt: true,
      topic: true,
      tutorProfile: {
        select: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      student: { select: { id: true, firstName: true, lastName: true } },
      course: { select: { id: true, title: true } },
    },
  });

  if (!session) {
    return null;
  }

  // If we have a Vimeo ID but no URL, try to get it
  if (session.vimeoVideoId && !session.vimeoVideoUrl) {
    try {
      const embedUrl = await vimeoService.getEmbedUrl(session.vimeoVideoId);
      if (embedUrl) {
        await prisma.tutorSession.update({
          where: { id: sessionId },
          data: { vimeoVideoUrl: embedUrl },
        });
        session.vimeoVideoUrl = embedUrl;
      }
    } catch (e) {
      // Ignore, video might not be ready
    }
  }

  // Helper to get full name
  const getFullName = (user) => {
    if (!user) return null;
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
  };

  // Decode HTML entities in embed URL
  let embedUrl = session.vimeoVideoUrl;
  if (embedUrl) {
    embedUrl = embedUrl.replace(/&amp;/g, '&');
  }

  // Calculate duration from session timestamps if not stored
  let duration = session.recordingDuration;
  if (!duration && session.startedAt && session.endedAt) {
    const startTime = new Date(session.startedAt).getTime();
    const endTime = new Date(session.endedAt).getTime();
    duration = Math.round((endTime - startTime) / 1000); // Duration in seconds
  }

  return {
    sessionId: session.id,
    status: session.recordingStatus,
    vimeoVideoId: session.vimeoVideoId,
    vimeoEmbedUrl: embedUrl,
    duration: duration,
    scheduledAt: session.scheduledAt,
    topic: session.topic,
    tutor: session.tutorProfile?.user ? {
      id: session.tutorProfile.user.id,
      name: getFullName(session.tutorProfile.user),
    } : null,
    student: session.student ? {
      id: session.student.id,
      name: getFullName(session.student),
    } : null,
    course: session.course,
  };
}

module.exports = {
  initializeRecording,
  stopSessionRecording,
  processRecording,
  handleRecordingFailure,
  finalizeRecording,
  deleteRecording,
  getRecordingDetails,
};
