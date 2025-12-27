/**
 * Users Routes
 */

const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/enrollments
 * Get user's enrollments
 */
router.get('/enrollments', authenticate, async (req, res, next) => {
  try {
    const enrollments = await req.prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        track: {
          select: { id: true, title: true, slug: true, image: true },
        },
        course: {
          select: { id: true, title: true, slug: true, image: true, lessons: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, enrollments });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/certificates
 * Get user's certificates
 */
router.get('/certificates', authenticate, async (req, res, next) => {
  try {
    const certificates = await req.prisma.certificate.findMany({
      where: { userId: req.user.id },
      orderBy: { issueDate: 'desc' },
    });

    res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        avatar: true,
        role: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile (including billing info)
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { firstName, lastName, phone, country } = req.body;

    const updatedUser = await req.prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(country && { country }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        avatar: true,
        role: true,
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/enrollments/:id/progress
 * Update enrollment progress
 */
router.put('/enrollments/:id/progress', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress, completedLessons } = req.body;

    const enrollment = await req.prisma.enrollment.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const updatedEnrollment = await req.prisma.enrollment.update({
      where: { id },
      data: {
        ...(progress !== undefined && { progress }),
        ...(completedLessons !== undefined && { completedLessons }),
        ...(progress >= 100 && {
          status: 'completed',
          completedAt: new Date(),
        }),
      },
    });

    res.json({ success: true, enrollment: updatedEnrollment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
