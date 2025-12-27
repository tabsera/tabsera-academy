/**
 * Tracks Routes
 */

const express = require('express');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Calculate track price from courses with discount
 */
const calculateTrackPrice = (courses, discountPercentage) => {
  const originalPrice = courses.reduce((sum, course) => sum + parseFloat(course.price || 0), 0);
  const discount = parseFloat(discountPercentage || 0);
  const discountedPrice = originalPrice * (1 - discount / 100);
  return {
    originalPrice: originalPrice.toFixed(2),
    discountedPrice: discountedPrice.toFixed(2),
    savings: (originalPrice - discountedPrice).toFixed(2),
  };
};

/**
 * GET /api/tracks
 * Get all tracks
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const tracks = await req.prisma.track.findMany({
      where: { isActive: true },
      include: {
        courses: {
          where: { isActive: true },
          select: { id: true, price: true },
        },
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to include coursesCount and calculated prices
    const transformedTracks = tracks.map(track => {
      const pricing = calculateTrackPrice(track.courses, track.discountPercentage);
      return {
        ...track,
        coursesCount: track._count.courses,
        price: pricing.discountedPrice,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
        courses: undefined,
        _count: undefined,
      };
    });

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

    // Calculate price from courses
    const pricing = calculateTrackPrice(track.courses, track.discountPercentage);

    res.json({
      success: true,
      track: {
        ...track,
        coursesCount: track.courses.length,
        price: pricing.discountedPrice,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
      },
      courses: track.courses,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
