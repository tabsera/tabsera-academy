/**
 * Courses Routes
 */

const express = require('express');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/courses
 * Get all courses
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { trackId, level, search, limit = 50, offset = 0 } = req.query;

    const where = {
      isActive: true,
      ...(trackId && { trackId }),
      ...(level && { level }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      req.prisma.course.findMany({
        where,
        include: {
          track: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.course.count({ where }),
    ]);

    res.json({
      success: true,
      courses,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:id
 * Get course by ID or slug
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await req.prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        track: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
