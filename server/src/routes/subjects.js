/**
 * Subjects Routes
 * Public and Admin endpoints for subject management
 */

const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/subjects
 * Get all active subjects (public)
 */
router.get('/', async (req, res, next) => {
  try {
    const subjects = await req.prisma.subject.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: { courses: true },
        },
      },
    });

    res.json({ success: true, subjects });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/subjects/admin
 * Get all subjects including inactive (admin only)
 */
router.get('/admin', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const subjects = await req.prisma.subject.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    res.json({ success: true, subjects });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/subjects
 * Create a new subject (admin only)
 */
router.post('/', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const { name, slug, description, icon, color, isActive, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    // Generate slug if not provided
    const subjectSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if subject already exists
    const existing = await req.prisma.subject.findFirst({
      where: {
        OR: [
          { name: name },
          { slug: subjectSlug },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Subject with this name or slug already exists' });
    }

    const subject = await req.prisma.subject.create({
      data: {
        name,
        slug: subjectSlug,
        description,
        icon,
        color,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/subjects/:id
 * Update a subject (admin only)
 */
router.put('/:id', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color, isActive, sortOrder } = req.body;

    const subject = await req.prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json({ success: true, subject });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/subjects/:id
 * Delete a subject (admin only)
 */
router.delete('/:id', authenticate, requireRole(['TABSERA_ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if any courses are using this subject
    const coursesCount = await req.prisma.course.count({
      where: { subjectId: id },
    });

    if (coursesCount > 0) {
      return res.status(400).json({
        message: `Cannot delete subject: ${coursesCount} course(s) are using it`
      });
    }

    await req.prisma.subject.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
