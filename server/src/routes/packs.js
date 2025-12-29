/**
 * Learning Packs Routes
 * Bundles of courses and tuition packs
 */

const express = require('express');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Calculate learning pack price from courses and tuition packs with discount
 */
const calculatePackPrice = (courses, tuitionPacks, discountPercentage) => {
  // Sum of course prices
  const coursesTotal = courses.reduce((sum, course) => sum + parseFloat(course.price || 0), 0);

  // Sum of tuition pack prices (considering quantity)
  const tuitionTotal = tuitionPacks.reduce((sum, tp) => {
    const packPrice = parseFloat(tp.tuitionPack?.price || 0);
    const quantity = tp.quantity || 1;
    return sum + (packPrice * quantity);
  }, 0);

  const originalPrice = coursesTotal + tuitionTotal;
  const discount = parseFloat(discountPercentage || 0);
  const discountedPrice = originalPrice * (1 - discount / 100);

  return {
    originalPrice: originalPrice.toFixed(2),
    discountedPrice: discountedPrice.toFixed(2),
    savings: (originalPrice - discountedPrice).toFixed(2),
    coursesTotal: coursesTotal.toFixed(2),
    tuitionTotal: tuitionTotal.toFixed(2),
  };
};

/**
 * GET /api/packs
 * Get all learning packs
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const packs = await req.prisma.learningPack.findMany({
      where: { isActive: true },
      include: {
        courses: {
          where: { isActive: true },
          select: { id: true, price: true },
        },
        tuitionPacks: {
          include: {
            tuitionPack: {
              select: { id: true, name: true, price: true, creditsIncluded: true },
            },
          },
        },
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to include counts and calculated prices
    const transformedPacks = packs.map(pack => {
      const pricing = calculatePackPrice(pack.courses, pack.tuitionPacks, pack.discountPercentage);
      return {
        ...pack,
        coursesCount: pack._count.courses,
        tuitionPacksCount: pack.tuitionPacks.length,
        price: pricing.discountedPrice,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
        courses: undefined,
        tuitionPacks: undefined,
        _count: undefined,
      };
    });

    res.json({ success: true, packs: transformedPacks });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/packs/:id
 * Get learning pack by ID or slug with courses and tuition packs
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const pack = await req.prisma.learningPack.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        courses: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        tuitionPacks: {
          include: {
            tuitionPack: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                creditsIncluded: true,
                validityDays: true,
              },
            },
          },
        },
      },
    });

    if (!pack) {
      return res.status(404).json({ message: 'Learning pack not found' });
    }

    // Calculate price from courses and tuition packs
    const pricing = calculatePackPrice(pack.courses, pack.tuitionPacks, pack.discountPercentage);

    // Transform tuition packs for easier frontend consumption
    const includedTuitionPacks = pack.tuitionPacks.map(tp => ({
      ...tp.tuitionPack,
      quantity: tp.quantity,
    }));

    res.json({
      success: true,
      pack: {
        ...pack,
        coursesCount: pack.courses.length,
        tuitionPacksCount: includedTuitionPacks.length,
        price: pricing.discountedPrice,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
        tuitionPacks: includedTuitionPacks,
      },
      courses: pack.courses,
      tuitionPacks: includedTuitionPacks,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
