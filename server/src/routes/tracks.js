/**
 * Tracks Routes
 */

const express = require('express');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/tracks
 * Get all tracks
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const tracks = await req.prisma.track.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to include coursesCount
    const transformedTracks = tracks.map(track => ({
      ...track,
      coursesCount: track._count.courses,
      _count: undefined,
    }));

    res.json({ success: true, tracks: transformedTracks });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tracks/:id
 * Get track by ID or slug with courses
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const track = await req.prisma.track.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        courses: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    res.json({
      success: true,
      track: {
        ...track,
        coursesCount: track.courses.length,
      },
      courses: track.courses,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
