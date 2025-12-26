/**
 * Learning Centers Routes
 * Public and authenticated endpoints for learning centers
 */

const express = require('express');
const { optionalAuth, authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/centers
 * Get all active learning centers (public)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { city, country, search } = req.query;

    const where = {
      isActive: true,
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(country && { country: { contains: country, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const centers = await req.prisma.learningCenter.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        email: true,
        logo: true,
        coverImage: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      centers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/centers/:slug
 * Get learning center by slug (public)
 */
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;

    const center = await req.prisma.learningCenter.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
        isActive: true,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!center) {
      return res.status(404).json({ message: 'Learning center not found' });
    }

    res.json({
      success: true,
      center: {
        ...center,
        studentCount: center._count.users,
        _count: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/centers/validate-promo
 * Validate a promo code
 */
router.post('/validate-promo', optionalAuth, async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Promo code is required' });
    }

    const promo = await req.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid promo code',
      });
    }

    // Check if active
    if (!promo.isActive) {
      return res.status(400).json({
        valid: false,
        message: 'This promo code is no longer active',
      });
    }

    // Check expiration
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({
        valid: false,
        message: 'This promo code has expired',
      });
    }

    // Check max uses
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({
        valid: false,
        message: 'This promo code has reached its usage limit',
      });
    }

    // Check minimum purchase
    if (promo.minPurchase && subtotal < parseFloat(promo.minPurchase)) {
      return res.status(400).json({
        valid: false,
        message: `Minimum purchase of $${promo.minPurchase} required for this promo code`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (subtotal * parseFloat(promo.discountValue)) / 100;
    } else {
      discount = parseFloat(promo.discountValue);
    }

    // Cap discount at subtotal
    discount = Math.min(discount, subtotal);

    res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: parseFloat(promo.discountValue),
      discount,
      message: promo.discountType === 'percentage'
        ? `${promo.discountValue}% discount applied`
        : `$${promo.discountValue} discount applied`,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * GET /api/centers/admin/all
 * Get all learning centers (admin)
 */
router.get('/admin/all', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const centers = await req.prisma.learningCenter.findMany({
      include: {
        _count: {
          select: { users: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      centers: centers.map(center => ({
        ...center,
        studentCount: center._count.users,
        orderCount: center._count.orders,
        _count: undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/centers/admin
 * Create a learning center (admin)
 */
router.post('/admin', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      address,
      city,
      country,
      phone,
      email,
      logo,
      coverImage,
      latitude,
      longitude,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    // Check for duplicate slug
    const existing = await req.prisma.learningCenter.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({ message: 'A center with this slug already exists' });
    }

    const center = await req.prisma.learningCenter.create({
      data: {
        name,
        slug,
        description,
        address,
        city,
        country,
        phone,
        email,
        logo,
        coverImage,
        latitude,
        longitude,
      },
    });

    res.status(201).json({
      success: true,
      center,
      message: 'Learning center created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/centers/admin/:id
 * Update a learning center (admin)
 */
router.put('/admin/:id', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await req.prisma.learningCenter.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Learning center not found' });
    }

    // Check for duplicate slug if changing
    if (updateData.slug && updateData.slug !== existing.slug) {
      const slugExists = await req.prisma.learningCenter.findUnique({
        where: { slug: updateData.slug },
      });
      if (slugExists) {
        return res.status(400).json({ message: 'A center with this slug already exists' });
      }
    }

    const center = await req.prisma.learningCenter.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      center,
      message: 'Learning center updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/centers/admin/:id
 * Delete a learning center (admin)
 */
router.delete('/admin/:id', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await req.prisma.learningCenter.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, orders: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Learning center not found' });
    }

    // Check for dependencies
    if (existing._count.users > 0 || existing._count.orders > 0) {
      return res.status(400).json({
        message: 'Cannot delete center with existing users or orders. Deactivate instead.',
      });
    }

    await req.prisma.learningCenter.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Learning center deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PROMO CODE ADMIN ROUTES
// ============================================

/**
 * GET /api/centers/admin/promo-codes
 * Get all promo codes (admin)
 */
router.get('/admin/promo-codes', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const promoCodes = await req.prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      promoCodes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/centers/admin/promo-codes
 * Create a promo code (admin)
 */
router.post('/admin/promo-codes', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxUses,
      minPurchase,
      expiresAt,
      isActive = true,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        message: 'Code, discount type, and discount value are required',
      });
    }

    // Check for duplicate code
    const existing = await req.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({ message: 'A promo code with this code already exists' });
    }

    const promoCode = await req.prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxUses,
        minPurchase,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    });

    res.status(201).json({
      success: true,
      promoCode,
      message: 'Promo code created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/centers/admin/promo-codes/:id
 * Update a promo code (admin)
 */
router.put('/admin/promo-codes/:id', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await req.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    // Check for duplicate code if changing
    if (updateData.code && updateData.code.toUpperCase() !== existing.code) {
      const codeExists = await req.prisma.promoCode.findUnique({
        where: { code: updateData.code.toUpperCase() },
      });
      if (codeExists) {
        return res.status(400).json({ message: 'A promo code with this code already exists' });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }

    const promoCode = await req.prisma.promoCode.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      promoCode,
      message: 'Promo code updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/centers/admin/promo-codes/:id
 * Delete a promo code (admin)
 */
router.delete('/admin/promo-codes/:id', authenticate, requireRole('TABSERA_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await req.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    await req.prisma.promoCode.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
