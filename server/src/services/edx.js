/**
 * Open edX Platform API Service
 * Handles user registration, login, and course enrollment on the Open edX LMS
 */

const crypto = require('crypto');

const EDX_BASE_URL = process.env.EDX_BASE_URL || 'https://cambridge.tabsera.com';
const EDX_CLIENT_ID = process.env.EDX_OAUTH_CLIENT_ID;
const EDX_CLIENT_SECRET = process.env.EDX_OAUTH_CLIENT_SECRET;
const EDX_ADMIN_USERNAME = process.env.EDX_ADMIN_USERNAME || 'admin';
const EDX_ADMIN_PASSWORD = process.env.EDX_ADMIN_PASSWORD;

// Encryption key for edX passwords (use JWT_SECRET as base)
const ENCRYPTION_KEY = crypto.createHash('sha256')
  .update(process.env.JWT_SECRET || 'default-key')
  .digest();
const IV_LENGTH = 16;

// Token cache
let accessToken = null;
let tokenExpiry = null;

/**
 * Encrypt edX password for storage
 */
const encryptPassword = (password) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt edX password for use
 */
const decryptPassword = (encryptedPassword) => {
  const parts = encryptedPassword.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Get OAuth2 access token using client credentials
 */
const getAccessToken = async () => {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const credentials = Buffer.from(`${EDX_CLIENT_ID}:${EDX_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${EDX_BASE_URL}/oauth2/access_token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        token_type: 'jwt',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('edX OAuth error:', error);
      throw new Error(`Failed to get edX access token: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + ((data.expires_in || 3600) - 300) * 1000;

    console.log('edX OAuth token obtained successfully');
    return accessToken;
  } catch (error) {
    console.error('edX OAuth error:', error.message);
    throw error;
  }
};

/**
 * Make authenticated request to edX API
 */
const edxRequest = async (endpoint, options = {}) => {
  const token = await getAccessToken();

  const url = `${EDX_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `JWT ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(`edX API error [${endpoint}]:`, data || response.statusText);
    throw {
      status: response.status,
      message: data?.message || data?.detail || response.statusText,
      data,
    };
  }

  return data;
};

/**
 * Generate a unique username from email
 */
const generateUsername = (email, firstName, lastName) => {
  // Try first.last format, then email prefix, then add random suffix
  const base = firstName && lastName
    ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
    : email.split('@')[0].toLowerCase();

  // Remove special chars, max 30 chars
  const clean = base.replace(/[^a-z0-9._]/g, '').substring(0, 25);

  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${clean}_${suffix}`;
};

/**
 * Register a new user on the edX platform
 */
const registerUser = async ({ email, password, firstName, lastName, username }) => {
  try {
    // Generate username if not provided
    const edxUsername = username || generateUsername(email, firstName, lastName);
    const fullName = `${firstName} ${lastName}`;

    // Note: Registration endpoint may not require OAuth, using direct POST
    const response = await fetch(`${EDX_BASE_URL}/api/user/v1/account/registration/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username: edxUsername,
        password,
        name: fullName,
        honor_code: true,
        terms_of_service: true,
      }),
    });

    // edX returns 200 for success, 400 for validation errors
    if (response.status === 200) {
      // Successful registration
      const data = await response.json().catch(() => ({}));
      console.log(`edX user registered: ${email} (${edxUsername})`);
      return {
        success: true,
        username: edxUsername,
        email,
        data,
      };
    }

    // Handle errors
    const errorData = await response.json().catch(() => null);

    // Check for duplicate email
    if (errorData?.email) {
      const emailError = errorData.email[0];
      if (emailError?.user_message?.includes('already exists') ||
          emailError?.user_message?.includes('already registered')) {
        console.log(`edX user already exists: ${email}`);
        return {
          success: true,
          alreadyExists: true,
          email,
          username: edxUsername,
        };
      }
    }

    // Check for duplicate username
    if (errorData?.username) {
      // Retry with different username
      const newUsername = generateUsername(email, firstName, lastName);
      console.log(`Username conflict, retrying with: ${newUsername}`);
      return registerUser({ email, password, firstName, lastName, username: newUsername });
    }

    console.error('edX registration error:', errorData);
    throw {
      status: response.status,
      message: 'Registration failed',
      errors: errorData,
    };
  } catch (error) {
    console.error('edX registerUser error:', error);
    throw error;
  }
};

/**
 * Enroll a user in a course
 */
const enrollUserInCourse = async ({ username, email, courseId, mode = 'honor' }) => {
  try {
    // Server-to-server enrollment requires OAuth
    const result = await edxRequest('/api/enrollment/v1/enrollment', {
      method: 'POST',
      body: JSON.stringify({
        user: username,
        mode: mode,
        is_active: true,
        course_details: {
          course_id: courseId,
        },
        email_opt_in: true,
      }),
    });

    console.log(`edX enrollment successful: ${username} -> ${courseId}`);
    return {
      success: true,
      enrollment: result,
      courseId,
      username,
    };
  } catch (error) {
    // If user not found by username, try by email
    if (error.status === 406 && email) {
      console.log(`User not found by username, trying email: ${email}`);
      try {
        const result = await edxRequest('/api/enrollment/v1/enrollment', {
          method: 'POST',
          body: JSON.stringify({
            user: email,
            mode: mode,
            is_active: true,
            course_details: {
              course_id: courseId,
            },
          }),
        });

        console.log(`edX enrollment successful via email: ${email} -> ${courseId}`);
        return {
          success: true,
          enrollment: result,
          courseId,
          email,
        };
      } catch (emailError) {
        throw emailError;
      }
    }

    console.error('edX enrollment error:', error);
    throw error;
  }
};

/**
 * Get user's enrollments
 */
const getUserEnrollments = async (username) => {
  try {
    const result = await edxRequest(`/api/enrollment/v1/enrollment?user=${encodeURIComponent(username)}`);
    return {
      success: true,
      enrollments: result,
    };
  } catch (error) {
    console.error('edX getUserEnrollments error:', error);
    throw error;
  }
};

/**
 * Check if user is enrolled in a course
 */
const checkEnrollment = async (username, courseId) => {
  try {
    const result = await edxRequest(
      `/api/enrollment/v1/enrollment/${encodeURIComponent(username)},${encodeURIComponent(courseId)}`
    );
    return {
      success: true,
      enrolled: result?.is_active === true,
      enrollment: result,
    };
  } catch (error) {
    if (error.status === 404) {
      return { success: true, enrolled: false };
    }
    throw error;
  }
};

/**
 * Unenroll user from a course
 */
const unenrollUserFromCourse = async ({ username, courseId }) => {
  try {
    const result = await edxRequest('/api/enrollment/v1/enrollment', {
      method: 'POST',
      body: JSON.stringify({
        user: username,
        is_active: false,
        course_details: {
          course_id: courseId,
        },
      }),
    });

    console.log(`edX unenrollment successful: ${username} -> ${courseId}`);
    return {
      success: true,
      enrollment: result,
    };
  } catch (error) {
    console.error('edX unenrollment error:', error);
    throw error;
  }
};

/**
 * Bulk enroll multiple users in courses
 */
const bulkEnroll = async ({ emails, courseIds, autoEnroll = true }) => {
  try {
    const result = await edxRequest('/api/bulk_enroll/v1/bulk_enroll/', {
      method: 'POST',
      body: JSON.stringify({
        auto_enroll: autoEnroll,
        email_students: true,
        action: 'enroll',
        courses: courseIds.join(','),
        identifiers: emails.join(','),
      }),
    });

    console.log(`edX bulk enrollment completed for ${emails.length} users`);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('edX bulkEnroll error:', error);
    throw error;
  }
};

/**
 * Get available courses from edX
 */
const getCourses = async () => {
  try {
    const result = await edxRequest('/api/courses/v1/courses/');
    return {
      success: true,
      courses: result?.results || result,
    };
  } catch (error) {
    console.error('edX getCourses error:', error);
    throw error;
  }
};

/**
 * Get course details by ID
 */
const getCourse = async (courseId) => {
  try {
    const result = await edxRequest(`/api/courses/v1/courses/${encodeURIComponent(courseId)}/`);
    return {
      success: true,
      course: result,
    };
  } catch (error) {
    console.error('edX getCourse error:', error);
    throw error;
  }
};

/**
 * Register user and enroll in courses (combined flow)
 * This is the main function called after payment success
 */
const registerAndEnroll = async ({ user, courses }) => {
  const results = {
    registration: null,
    enrollments: [],
    errors: [],
  };

  try {
    // Step 1: Register user on edX (or get existing)
    const regResult = await registerUser({
      email: user.email,
      password: user.password || generateTemporaryPassword(),
      firstName: user.firstName,
      lastName: user.lastName,
    });

    results.registration = regResult;

    // Step 2: Enroll in each course
    for (const course of courses) {
      try {
        // Get the edX course ID from our course record
        const courseId = course.externalCourseId || course.edxCourseId;

        if (!courseId) {
          results.errors.push({
            courseId: course.id,
            error: 'No edX course ID configured',
          });
          continue;
        }

        const enrollResult = await enrollUserInCourse({
          username: regResult.username,
          email: user.email,
          courseId: courseId,
          mode: course.enrollmentMode || 'honor',
        });

        results.enrollments.push({
          courseId,
          ...enrollResult,
        });
      } catch (enrollError) {
        results.errors.push({
          courseId: course.id,
          error: enrollError.message || 'Enrollment failed',
        });
      }
    }

    return {
      success: results.enrollments.length > 0,
      ...results,
    };
  } catch (error) {
    console.error('edX registerAndEnroll error:', error);
    return {
      success: false,
      error: error.message || 'Registration and enrollment failed',
      ...results,
    };
  }
};

/**
 * Generate temporary password for edX registration
 */
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Test connection to edX platform
 */
const testConnection = async () => {
  try {
    await getAccessToken();
    console.log('edX connection test: SUCCESS');
    return { success: true, message: 'Connected to edX platform' };
  } catch (error) {
    console.error('edX connection test: FAILED', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Login to edX and get session cookies/token
 * Returns session info that can be used to auto-login user
 */
const loginUser = async ({ email, password }) => {
  try {
    // First, get CSRF token from login page
    const loginPageResponse = await fetch(`${EDX_BASE_URL}/login`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    // Extract CSRF token from cookies
    const cookies = loginPageResponse.headers.get('set-cookie') || '';
    const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;

    if (!csrfToken) {
      console.error('Could not get CSRF token from edX');
      return { success: false, error: 'Could not get CSRF token' };
    }

    // Attempt login with email/password
    const loginResponse = await fetch(`${EDX_BASE_URL}/api/user/v1/account/login_session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
        'Cookie': `csrftoken=${csrfToken}`,
        'Referer': `${EDX_BASE_URL}/login`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (loginResponse.ok) {
      // Extract session cookies
      const sessionCookies = loginResponse.headers.get('set-cookie') || '';
      const sessionIdMatch = sessionCookies.match(/sessionid=([^;]+)/);
      const edxSessionMatch = sessionCookies.match(/edx-user-info=([^;]+)/);

      const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
      const edxUserInfo = edxSessionMatch ? edxSessionMatch[1] : null;

      console.log(`edX login successful for: ${email}`);
      return {
        success: true,
        sessionId,
        csrfToken,
        edxUserInfo,
        cookies: sessionCookies,
      };
    }

    // Login failed
    const errorData = await loginResponse.json().catch(() => null);
    console.error('edX login failed:', errorData);
    return {
      success: false,
      error: errorData?.value || 'Login failed',
      errorCode: loginResponse.status,
    };
  } catch (error) {
    console.error('edX login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate auto-login URL for edX
 * This creates a URL that will automatically log the user in when visited
 */
const generateAutoLoginUrl = async ({ email, encryptedPassword, returnUrl }) => {
  try {
    // Decrypt the password
    const password = decryptPassword(encryptedPassword);

    // Get a fresh login session
    const loginResult = await loginUser({ email, password });

    if (!loginResult.success) {
      return { success: false, error: loginResult.error };
    }

    // Return the session info for the frontend to use
    return {
      success: true,
      edxBaseUrl: EDX_BASE_URL,
      sessionId: loginResult.sessionId,
      csrfToken: loginResult.csrfToken,
      returnUrl: returnUrl || `${EDX_BASE_URL}/dashboard`,
    };
  } catch (error) {
    console.error('edX generateAutoLoginUrl error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create edX credentials for a user
 * Returns the password encrypted for storage
 */
const createEdxCredentials = (firstName, lastName) => {
  const password = generateTemporaryPassword();
  const encryptedPassword = encryptPassword(password);
  return { password, encryptedPassword };
};

/**
 * Login to edX as admin
 * Uses configured admin credentials from environment
 * @param {string} returnUrl - URL to redirect after login
 * @returns {Object} Session info for admin access
 */
const adminLogin = async (returnUrl) => {
  if (!EDX_ADMIN_PASSWORD) {
    console.error('EDX_ADMIN_PASSWORD not configured');
    return { success: false, error: 'edX admin credentials not configured' };
  }

  try {
    const loginResult = await loginUser({
      email: EDX_ADMIN_USERNAME,
      password: EDX_ADMIN_PASSWORD,
    });

    if (loginResult.success) {
      return {
        success: true,
        edxBaseUrl: EDX_BASE_URL,
        sessionId: loginResult.sessionId,
        csrfToken: loginResult.csrfToken,
        returnUrl: returnUrl || `${EDX_BASE_URL}/admin`,
      };
    }

    return {
      success: false,
      error: loginResult.error || 'Admin login failed',
      edxBaseUrl: EDX_BASE_URL,
      loginUrl: `${EDX_BASE_URL}/login`,
    };
  } catch (error) {
    console.error('edX admin login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get edX admin dashboard URL
 */
const getAdminUrl = () => `${EDX_BASE_URL}/admin`;

/**
 * Get edX Studio URL for course editing
 */
const getStudioUrl = (courseId) => {
  const studioBase = EDX_BASE_URL.replace('://cambridge.', '://studio.cambridge.');
  return courseId
    ? `${studioBase}/course/${courseId}`
    : studioBase;
};

module.exports = {
  getAccessToken,
  registerUser,
  enrollUserInCourse,
  getUserEnrollments,
  checkEnrollment,
  unenrollUserFromCourse,
  bulkEnroll,
  getCourses,
  getCourse,
  registerAndEnroll,
  testConnection,
  loginUser,
  generateAutoLoginUrl,
  encryptPassword,
  decryptPassword,
  createEdxCredentials,
  adminLogin,
  getAdminUrl,
  getStudioUrl,
};
