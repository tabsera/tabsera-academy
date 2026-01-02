/**
 * Vimeo Video Service
 *
 * Manages video uploads and playback for tutoring session recordings:
 * - Upload recordings from S3 to Vimeo
 * - Get video status and playback URLs
 * - Generate secure embed URLs
 * - Manage video privacy settings
 */

const { Vimeo } = require('@vimeo/vimeo');

// Vimeo configuration
const VIMEO_CLIENT_ID = process.env.VIMEO_CLIENT_ID || '';
const VIMEO_CLIENT_SECRET = process.env.VIMEO_CLIENT_SECRET || '';
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
// Hardcoded folder ID for tutoring session recordings
const VIMEO_RECORDINGS_FOLDER_ID = '27735211';

// Check if Vimeo is properly configured (only access token is required)
const VIMEO_ENABLED = !!VIMEO_ACCESS_TOKEN;

// Initialize Vimeo client
let vimeoClient = null;

if (VIMEO_ENABLED) {
  try {
    // Vimeo client can work with just access token (client id/secret can be empty)
    vimeoClient = new Vimeo(VIMEO_CLIENT_ID, VIMEO_CLIENT_SECRET, VIMEO_ACCESS_TOKEN);
    console.log('Vimeo service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Vimeo client:', error.message);
  }
}

/**
 * Upload a video to Vimeo from a URL (pull upload)
 * @param {Object} params - Upload parameters
 * @param {string} params.fileUrl - URL of the video file (e.g., S3 URL)
 * @param {string} params.title - Video title
 * @param {string} params.description - Video description
 * @param {string} params.folderId - Optional folder ID to organize recordings
 * @returns {Promise<{videoId: string, videoUri: string}>}
 */
async function uploadFromUrl({ fileUrl, title, description }) {
  if (!VIMEO_ENABLED) {
    console.warn('Vimeo not configured, skipping upload');
    return { videoId: null, error: 'Vimeo not configured' };
  }

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'POST',
        path: '/me/videos',
        query: {
          upload: {
            approach: 'pull',
            link: fileUrl,
          },
          name: title,
          description: description || 'Tabsera Academy tutoring session recording',
          privacy: {
            view: 'disable', // Hidden - accessible only via direct link
            embed: 'whitelist', // Only allow embedding on our domain
            download: false,
            comments: 'nobody',
          },
          embed: {
            title: {
              name: 'show',
              owner: 'hide',
              portrait: 'hide',
            },
            playbar: true,
            volume: true,
            speed: true,
            fullscreen: true,
            color: '#2563eb', // Blue-600 to match our theme
          },
        },
      },
      (error, body, statusCode) => {
        if (error) {
          console.error('Vimeo upload failed:', error.message);
          reject(error);
          return;
        }

        if (statusCode === 201 || statusCode === 200) {
          // Extract video ID from URI (format: /videos/123456789)
          const videoUri = body.uri;
          const videoId = videoUri.split('/').pop();

          console.log(`Video upload initiated: ${videoId}`);

          // Add video to the recordings folder
          addVideoToFolder(videoId).catch(err => {
            console.error(`Failed to add video ${videoId} to folder:`, err.message);
          });

          resolve({
            videoId,
            videoUri,
            status: body.status, // 'in_progress' for pull uploads
          });
        } else {
          reject(new Error(`Vimeo upload failed with status ${statusCode}`));
        }
      }
    );
  });
}

/**
 * Add a video to the recordings folder
 * @param {string} videoId - Vimeo video ID
 * @returns {Promise<boolean>}
 */
async function addVideoToFolder(videoId) {
  if (!VIMEO_ENABLED || !VIMEO_RECORDINGS_FOLDER_ID) {
    return false;
  }

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'PUT',
        path: `/me/projects/${VIMEO_RECORDINGS_FOLDER_ID}/videos/${videoId}`,
      },
      (error, body, statusCode) => {
        if (error) {
          console.error('Failed to add video to folder:', error.message);
          reject(error);
          return;
        }

        // 204 No Content or 200 OK is success
        if (statusCode === 204 || statusCode === 200) {
          console.log(`Video ${videoId} added to folder ${VIMEO_RECORDINGS_FOLDER_ID}`);
          resolve(true);
        } else {
          reject(new Error(`Failed to add video to folder: ${statusCode}`));
        }
      }
    );
  });
}

/**
 * Get video status and details
 * @param {string} videoId - Vimeo video ID
 * @returns {Promise<Object>} Video details
 */
async function getVideoStatus(videoId) {
  if (!VIMEO_ENABLED) {
    return { status: 'unknown', error: 'Vimeo not configured' };
  }

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'GET',
        path: `/videos/${videoId}`,
      },
      (error, body, statusCode) => {
        if (error) {
          console.error('Failed to get video status:', error.message);
          reject(error);
          return;
        }

        if (statusCode === 200) {
          resolve({
            videoId,
            status: body.status, // 'available', 'uploading', 'transcoding', 'transcode_starting'
            duration: body.duration, // Duration in seconds
            width: body.width,
            height: body.height,
            createdAt: body.created_time,
            modifiedAt: body.modified_time,
            pictures: body.pictures?.sizes || [],
            privacy: body.privacy,
          });
        } else if (statusCode === 404) {
          resolve({ videoId, status: 'not_found' });
        } else {
          reject(new Error(`Failed to get video status: ${statusCode}`));
        }
      }
    );
  });
}

/**
 * Wait for video to finish processing
 * @param {string} videoId - Vimeo video ID
 * @param {number} maxWait - Maximum wait time in ms (default: 5 minutes)
 * @param {number} interval - Check interval in ms (default: 10 seconds)
 * @returns {Promise<Object>} Final video status
 */
async function waitForVideoReady(videoId, maxWait = 300000, interval = 10000) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const status = await getVideoStatus(videoId);

    if (status.status === 'available') {
      return status;
    }

    if (status.status === 'not_found' || status.status === 'error') {
      throw new Error(`Video processing failed: ${status.status}`);
    }

    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Video processing timed out');
}

/**
 * Get a secure embed URL for a video
 * @param {string} videoId - Vimeo video ID
 * @returns {Promise<string>} Embed URL
 */
async function getEmbedUrl(videoId) {
  if (!VIMEO_ENABLED) {
    return null;
  }

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'GET',
        path: `/videos/${videoId}`,
        query: {
          fields: 'embed.html,privacy.embed,link',
        },
      },
      (error, body, statusCode) => {
        if (error) {
          console.error('Failed to get embed URL:', error.message);
          reject(error);
          return;
        }

        if (statusCode === 200) {
          // Extract the embed URL from the embed HTML
          // Format: <iframe src="https://player.vimeo.com/video/123456789?h=abc123" ...>
          const embedHtml = body.embed?.html;

          if (embedHtml) {
            const srcMatch = embedHtml.match(/src="([^"]+)"/);
            const embedUrl = srcMatch ? srcMatch[1] : null;
            resolve(embedUrl);
          } else {
            // Fallback: construct basic embed URL
            resolve(`https://player.vimeo.com/video/${videoId}`);
          }
        } else {
          reject(new Error(`Failed to get embed URL: ${statusCode}`));
        }
      }
    );
  });
}

/**
 * Get the direct link to watch a video
 * @param {string} videoId - Vimeo video ID
 * @returns {Promise<string>} Video link
 */
async function getVideoLink(videoId) {
  if (!VIMEO_ENABLED) {
    return null;
  }

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'GET',
        path: `/videos/${videoId}`,
        query: {
          fields: 'link',
        },
      },
      (error, body, statusCode) => {
        if (error) {
          reject(error);
          return;
        }

        if (statusCode === 200) {
          resolve(body.link);
        } else {
          reject(new Error(`Failed to get video link: ${statusCode}`));
        }
      }
    );
  });
}

/**
 * Update video privacy settings
 * @param {string} videoId - Vimeo video ID
 * @param {Object} privacy - Privacy settings
 * @returns {Promise<boolean>}
 */
async function setPrivacy(videoId, privacy = {}) {
  if (!VIMEO_ENABLED) {
    return false;
  }

  const defaultPrivacy = {
    view: 'disable', // Hidden
    embed: 'whitelist',
    download: false,
    comments: 'nobody',
  };

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'PATCH',
        path: `/videos/${videoId}`,
        query: {
          privacy: { ...defaultPrivacy, ...privacy },
        },
      },
      (error, body, statusCode) => {
        if (error) {
          console.error('Failed to set privacy:', error.message);
          reject(error);
          return;
        }

        resolve(statusCode === 200);
      }
    );
  });
}

/**
 * Add our domain to embed whitelist
 * @param {string} videoId - Vimeo video ID
 * @param {string} domain - Domain to whitelist
 * @returns {Promise<boolean>}
 */
async function addEmbedDomain(videoId, domain = 'tabsera.com') {
  if (!VIMEO_ENABLED) {
    return false;
  }

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'PUT',
        path: `/videos/${videoId}/privacy/domains/${domain}`,
      },
      (error, body, statusCode) => {
        if (error) {
          console.error('Failed to add embed domain:', error.message);
          reject(error);
          return;
        }

        resolve(statusCode === 204 || statusCode === 200);
      }
    );
  });
}

/**
 * Delete a video from Vimeo
 * @param {string} videoId - Vimeo video ID
 * @returns {Promise<boolean>}
 */
async function deleteVideo(videoId) {
  if (!VIMEO_ENABLED) {
    return false;
  }

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'DELETE',
        path: `/videos/${videoId}`,
      },
      (error, body, statusCode) => {
        if (error) {
          console.error('Failed to delete video:', error.message);
          reject(error);
          return;
        }

        // 204 No Content is success for DELETE
        resolve(statusCode === 204);
      }
    );
  });
}

/**
 * Get video thumbnail URL
 * @param {string} videoId - Vimeo video ID
 * @param {string} size - Size: 'small', 'medium', 'large'
 * @returns {Promise<string>} Thumbnail URL
 */
async function getThumbnailUrl(videoId, size = 'medium') {
  if (!VIMEO_ENABLED) {
    return null;
  }

  const sizeMap = {
    small: 0, // 100x75
    medium: 2, // 295x166
    large: 3, // 640x360
  };

  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: 'GET',
        path: `/videos/${videoId}/pictures`,
      },
      (error, body, statusCode) => {
        if (error) {
          reject(error);
          return;
        }

        if (statusCode === 200 && body.data?.length > 0) {
          const picture = body.data[0];
          const sizeIndex = sizeMap[size] || 2;
          const thumbnailUrl = picture.sizes?.[sizeIndex]?.link || picture.sizes?.[0]?.link;
          resolve(thumbnailUrl);
        } else {
          resolve(null);
        }
      }
    );
  });
}

module.exports = {
  VIMEO_ENABLED,
  uploadFromUrl,
  getVideoStatus,
  waitForVideoReady,
  getEmbedUrl,
  getVideoLink,
  setPrivacy,
  addEmbedDomain,
  addVideoToFolder,
  deleteVideo,
  getThumbnailUrl,
};
