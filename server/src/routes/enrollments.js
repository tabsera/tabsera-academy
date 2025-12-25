/**
 * Enrollments Routes
 */

const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/enrollments/check/:courseId
 * Check if current user is enrolled in a course
 */
router.get('/check/:courseId', optionalAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // If user is not authenticated, they're not enrolled
    if (!req.user) {
      return res.json({ enrolled: false });
    }

    // Check for direct course enrollment
    const courseEnrollment = await req.prisma.enrollment.findFirst({
      where: {
        userId: req.user.id,
        courseId: courseId,
        status: 'active',
      },
    });

    if (courseEnrollment) {
      return res.json({ enrolled: true, enrollmentId: courseEnrollment.id });
    }

    // Check if course is part of a track the user is enrolled in
    const course = await req.prisma.course.findUnique({
      where: { id: courseId },
      select: { trackId: true },
    });

    if (course?.trackId) {
      const trackEnrollment = await req.prisma.enrollment.findFirst({
        where: {
          userId: req.user.id,
          trackId: course.trackId,
          status: 'active',
        },
      });

      if (trackEnrollment) {
        return res.json({ enrolled: true, enrollmentId: trackEnrollment.id, enrolledViaTrack: true });
      }
    }

    return res.json({ enrolled: false });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/enrollments
 * Get user's enrollments
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status }),
    };

    const [enrollments, total] = await Promise.all([
      req.prisma.enrollment.findMany({
        where,
        include: {
          track: {
            select: {
              id: true,
              title: true,
              slug: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              image: true,
              externalUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.enrollment.count({ where }),
    ]);

    res.json({
      success: true,
      enrollments,
      total,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/enrollments/:id
 * Get specific enrollment
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await req.prisma.enrollment.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        track: true,
        course: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
