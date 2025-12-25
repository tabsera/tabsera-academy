/**
 * Open edX Integration Routes
 * Admin endpoints for managing edX platform integration
 */

const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const edxService = require('../services/edx');

const router = express.Router();

/**
 * GET /api/edx/status
 * Check edX connection status (Admin only)
 */
router.get('/status', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const result = await edxService.testConnection();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/edx/courses
 * Get all courses from edX platform (Admin only)
 */
router.get('/courses', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const result = await edxService.getCourses();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/edx/courses/:courseId
 * Get course details from edX (Admin only)
 */
router.get('/courses/:courseId', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const result = await edxService.getCourse(decodeURIComponent(courseId));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/edx/register
 * Register a user on edX platform (Admin only)
 */
router.post('/register', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Email, first name, and last name are required',
      });
    }

    const result = await edxService.registerUser({
      email,
      password: password || undefined,
      firstName,
      lastName,
    });

    // Update user record if exists in our database
    if (result.success) {
      const user = await req.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (user) {
        await req.prisma.user.update({
          where: { id: user.id },
          data: {
            edxUsername: result.username,
            edxRegistered: true,
            edxRegisteredAt: new Date(),
          },
        });
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/edx/enroll
 * Enroll a user in an edX course (Admin only)
 */
router.post('/enroll', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { username, email, courseId, mode } = req.body;

    if ((!username && !email) || !courseId) {
      return res.status(400).json({
        message: 'Username or email, and course ID are required',
      });
    }

    const result = await edxService.enrollUserInCourse({
      username,
      email,
      courseId,
      mode: mode || 'honor',
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/edx/unenroll
 * Unenroll a user from an edX course (Admin only)
 */
router.post('/unenroll', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { username, courseId } = req.body;

    if (!username || !courseId) {
      return res.status(400).json({
        message: 'Username and course ID are required',
      });
    }

    const result = await edxService.unenrollUserFromCourse({
      username,
      courseId,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/edx/enrollments/:username
 * Get user's edX enrollments (Admin only)
 */
router.get('/enrollments/:username', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await edxService.getUserEnrollments(username);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/edx/check-enrollment/:username/:courseId
 * Check if user is enrolled in a course (Admin only)
 */
router.get('/check-enrollment/:username/:courseId', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { username, courseId } = req.params;
    const result = await edxService.checkEnrollment(username, decodeURIComponent(courseId));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/edx/bulk-enroll
 * Bulk enroll multiple users in courses (Admin only)
 */
router.post('/bulk-enroll', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { emails, courseIds, autoEnroll } = req.body;

    if (!emails || !courseIds || !emails.length || !courseIds.length) {
      return res.status(400).json({
        message: 'Emails and course IDs arrays are required',
      });
    }

    const result = await edxService.bulkEnroll({
      emails,
      courseIds,
      autoEnroll: autoEnroll !== false,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/edx/sync-user/:userId
 * Sync a user to edX platform (register if needed) (Admin only)
 */
router.post('/sync-user/:userId', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get user from database
    const user = await req.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Register on edX
    const result = await edxService.registerUser({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    if (result.success) {
      // Update user record
      await req.prisma.user.update({
        where: { id: userId },
        data: {
          edxUsername: result.username,
          edxRegistered: true,
          edxRegisteredAt: new Date(),
        },
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/edx/sync-enrollment/:enrollmentId
 * Sync an enrollment to edX (enroll user in course) (Admin only)
 */
router.post('/sync-enrollment/:enrollmentId', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    // Get enrollment with user and course
    const enrollment = await req.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!enrollment.course?.edxCourseId) {
      return res.status(400).json({ message: 'Course does not have an edX course ID configured' });
    }

    // Ensure user is registered on edX
    let edxUsername = enrollment.user.edxUsername;

    if (!enrollment.user.edxRegistered) {
      const regResult = await edxService.registerUser({
        email: enrollment.user.email,
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
      });

      if (regResult.success) {
        edxUsername = regResult.username;
        await req.prisma.user.update({
          where: { id: enrollment.user.id },
          data: {
            edxUsername: regResult.username,
            edxRegistered: true,
            edxRegisteredAt: new Date(),
          },
        });
      }
    }

    // Enroll on edX
    const enrollResult = await edxService.enrollUserInCourse({
      username: edxUsername,
      email: enrollment.user.email,
      courseId: enrollment.course.edxCourseId,
      mode: 'honor',
    });

    if (enrollResult.success) {
      // Update enrollment record
      await req.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          edxEnrolled: true,
          edxEnrolledAt: new Date(),
          edxCourseId: enrollment.course.edxCourseId,
          edxEnrollmentMode: 'honor',
        },
      });
    }

    res.json(enrollResult);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
