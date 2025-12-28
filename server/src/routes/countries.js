/**
 * Countries Routes
 * Public and Admin endpoints for country management
 */

const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/countries
 * Get all active countries (public)
 */
router.get('/', async (req, res, next) => {
  try {
    const countries = await req.prisma.country.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        code: true,
        name: true,
        dialCode: true,
        currency: true,
        currencySymbol: true,
        usdExchangeRate: true,
      },
    });

    res.json({ success: true, countries });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/countries/admin
 * Get all countries including inactive (admin only)
 */
router.get('/admin', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const countries = await req.prisma.country.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json({ success: true, countries });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/countries
 * Create a new country (admin only)
 */
router.post('/', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const { code, name, dialCode, currency, currencySymbol, usdExchangeRate, isActive, sortOrder } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: 'Country code and name are required' });
    }

    // Check if country code already exists
    const existing = await req.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({ message: 'Country with this code already exists' });
    }

    const country = await req.prisma.country.create({
      data: {
        code: code.toUpperCase(),
        name,
        dialCode,
        currency,
        currencySymbol,
        usdExchangeRate: usdExchangeRate || 1,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json({ success: true, country });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/countries/:id
 * Update a country (admin only)
 */
router.put('/:id', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, dialCode, currency, currencySymbol, usdExchangeRate, isActive, sortOrder } = req.body;

    const country = await req.prisma.country.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(dialCode !== undefined && { dialCode }),
        ...(currency !== undefined && { currency }),
        ...(currencySymbol !== undefined && { currencySymbol }),
        ...(usdExchangeRate !== undefined && { usdExchangeRate }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json({ success: true, country });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/countries/:id
 * Delete a country (admin only)
 */
router.delete('/:id', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;

    await req.prisma.country.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Country deleted' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/countries/bulk
 * Bulk create/update countries (admin only)
 */
router.post('/bulk', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const { countries } = req.body;

    if (!Array.isArray(countries)) {
      return res.status(400).json({ message: 'Countries array is required' });
    }

    const results = [];
    for (const countryData of countries) {
      const { code, name, dialCode, currency, currencySymbol, usdExchangeRate, isActive, sortOrder } = countryData;

      if (!code || !name) continue;

      const country = await req.prisma.country.upsert({
        where: { code: code.toUpperCase() },
        update: {
          name,
          dialCode,
          currency,
          currencySymbol,
          usdExchangeRate: usdExchangeRate || 1,
          isActive: isActive !== false,
          sortOrder: sortOrder || 0,
        },
        create: {
          code: code.toUpperCase(),
          name,
          dialCode,
          currency,
          currencySymbol,
          usdExchangeRate: usdExchangeRate || 1,
          isActive: isActive !== false,
          sortOrder: sortOrder || 0,
        },
      });

      results.push(country);
    }

    res.json({ success: true, count: results.length, countries: results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
