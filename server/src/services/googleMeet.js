/**
 * Google Meet Integration Service
 *
 * Generates meeting links for tutoring sessions.
 * When GOOGLE_CALENDAR_ENABLED=true, uses Google Calendar API.
 * Otherwise, generates placeholder Jitsi Meet links (free, no account needed).
 */

const { google } = require('googleapis');

const GOOGLE_ENABLED = process.env.GOOGLE_CALENDAR_ENABLED === 'true';

/**
 * Generate a meeting link for a tutoring session
 * @param {Object} params - Meeting parameters
 * @param {string} params.tutorEmail - Tutor's email address
 * @param {string} params.studentEmail - Student's email address
 * @param {Date} params.scheduledAt - Session start time
 * @param {number} params.duration - Duration in minutes
 * @param {string} params.topic - Session topic/title
 * @param {string} params.sessionId - Unique session ID
 * @returns {Promise<{meetingUrl: string, meetingId: string}>}
 */
async function createMeetSession({ tutorEmail, studentEmail, scheduledAt, duration, topic, sessionId }) {
  if (GOOGLE_ENABLED) {
    return createGoogleMeetSession({ tutorEmail, studentEmail, scheduledAt, duration, topic });
  }

  // Fallback: Use Jitsi Meet (free, open-source video conferencing)
  return createJitsiMeetSession({ sessionId, topic });
}

/**
 * Create a Google Calendar event with Google Meet link
 * Requires OAuth2 or Service Account credentials
 */
async function createGoogleMeetSession({ tutorEmail, studentEmail, scheduledAt, duration, topic }) {
  try {
    // Initialize OAuth2 client
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const event = {
      summary: topic || 'Tutoring Session',
      description: 'Tabsera Academy tutoring session',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: tutorEmail },
        { email: studentEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: `tabsera-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      e => e.entryPointType === 'video'
    )?.uri;

    return {
      meetingUrl: meetLink || null,
      meetingId: response.data.id,
      calendarEventId: response.data.id,
    };
  } catch (error) {
    console.error('Google Meet creation failed:', error.message);
    // Fallback to Jitsi
    return createJitsiMeetSession({ sessionId: `meet-${Date.now()}`, topic });
  }
}

/**
 * Create a Jitsi Meet room link
 * Free, no account required, works instantly
 */
function createJitsiMeetSession({ sessionId, topic }) {
  // Create a unique, clean room name
  const roomName = `tabsera-${sessionId}`.replace(/[^a-zA-Z0-9-]/g, '');
  const meetingUrl = `https://meet.jit.si/${roomName}`;

  return {
    meetingUrl,
    meetingId: roomName,
    provider: 'jitsi',
  };
}

/**
 * Cancel/delete a meeting
 * @param {string} meetingId - The meeting/event ID
 */
async function cancelMeetSession(meetingId) {
  if (!GOOGLE_ENABLED || !meetingId) {
    return { success: true };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: meetingId,
      sendUpdates: 'all',
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel meeting:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  createMeetSession,
  cancelMeetSession,
  GOOGLE_ENABLED,
};
