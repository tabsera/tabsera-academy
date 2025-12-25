/**
 * Admin Routes
 * CRUD operations for courses and tracks management
 */

const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('TABSERA_ADMIN', 'CENTER_ADMIN', 'tabsera_admin', 'center_admin'));

// ============================================
// COURSES MANAGEMENT
// ============================================

/**
 * GET /api/admin/courses
 * Get all courses (including inactive) with pagination
 */
router.get('/courses', async (req, res, next) => {
  try {
    const {
      trackId,
      level,
      search,
      status,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {
      ...(trackId && { trackId }),
      ...(level && { level }),
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
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
          _count: {
            select: { enrollments: true, orderItems: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.course.count({ where }),
    ]);

    // Transform to include enrollment count
    const coursesWithStats = courses.map(course => ({
      ...course,
      enrollmentCount: course._count.enrollments,
      orderCount: course._count.orderItems,
      _count: undefined,
    }));

    res.json({
      success: true,
      courses: coursesWithStats,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/courses/:id
 * Get course by ID (admin view with all details)
 */
router.get('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await req.prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        track: true,
        _count: {
          select: { enrollments: true, orderItems: true },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      success: true,
      course: {
        ...course,
        enrollmentCount: course._count.enrollments,
        orderCount: course._count.orderItems,
        _count: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/courses
 * Create a new course
 */
router.post('/courses', async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      price,
      duration,
      level,
      lessons,
      image,
      externalUrl,
      trackId,
      isActive = true,
    } = req.body;

    // Validate required fields
    if (!title || !slug || price === undefined) {
      return res.status(400).json({
        message: 'Title, slug, and price are required',
      });
    }

    // Check for duplicate slug
    const existing = await req.prisma.course.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({
        message: 'A course with this slug already exists',
      });
    }

    const course = await req.prisma.course.create({
      data: {
        title,
        slug,
        description,
        price,
        duration,
        level,
        lessons: lessons || 0,
        image,
        externalUrl,
        trackId: trackId || null,
        isActive,
      },
      include: {
        track: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      course,
      message: 'Course created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/courses/:id
 * Update a course
 */
router.put('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      price,
      duration,
      level,
      lessons,
      image,
      externalUrl,
      trackId,
      isActive,
    } = req.body;

    // Check if course exists
    const existing = await req.prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check for duplicate slug (if slug is being changed)
    if (slug && slug !== existing.slug) {
      const slugExists = await req.prisma.course.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({
          message: 'A course with this slug already exists',
        });
      }
    }

    const course = await req.prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(duration !== undefined && { duration }),
        ...(level !== undefined && { level }),
        ...(lessons !== undefined && { lessons }),
        ...(image !== undefined && { image }),
        ...(externalUrl !== undefined && { externalUrl }),
        ...(trackId !== undefined && { trackId: trackId || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        track: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    res.json({
      success: true,
      course,
      message: 'Course updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/courses/:id
 * Delete a course
 */
router.delete('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existing = await req.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true, orderItems: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check for dependencies
    if (existing._count.enrollments > 0 || existing._count.orderItems > 0) {
      return res.status(400).json({
        message: 'Cannot delete course with existing enrollments or orders. Consider deactivating instead.',
      });
    }

    await req.prisma.course.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/courses/:id/duplicate
 * Duplicate a course
 */
router.post('/courses/:id/duplicate', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await req.prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Generate unique slug
    let newSlug = `${existing.slug}-copy`;
    let counter = 1;
    while (await req.prisma.course.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${existing.slug}-copy-${counter}`;
      counter++;
    }

    const course = await req.prisma.course.create({
      data: {
        title: `${existing.title} (Copy)`,
        slug: newSlug,
        description: existing.description,
        price: existing.price,
        duration: existing.duration,
        level: existing.level,
        lessons: existing.lessons,
        image: existing.image,
        externalUrl: existing.externalUrl,
        trackId: existing.trackId,
        isActive: false, // Start as inactive
      },
      include: {
        track: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      course,
      message: 'Course duplicated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/courses/bulk-action
 * Perform bulk actions on courses
 */
router.post('/courses/bulk-action', async (req, res, next) => {
  try {
    const { action, courseIds } = req.body;

    if (!action || !courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({
        message: 'Action and courseIds array are required',
      });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await req.prisma.course.updateMany({
          where: { id: { in: courseIds } },
          data: { isActive: true },
        });
        break;
      case 'deactivate':
        result = await req.prisma.course.updateMany({
          where: { id: { in: courseIds } },
          data: { isActive: false },
        });
        break;
      case 'delete':
        // Only delete courses without enrollments/orders
        result = await req.prisma.course.deleteMany({
          where: {
            id: { in: courseIds },
            enrollments: { none: {} },
            orderItems: { none: {} },
          },
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({
      success: true,
      count: result.count,
      message: `${result.count} courses updated`,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// TRACKS MANAGEMENT
// ============================================

/**
 * GET /api/admin/tracks
 * Get all tracks (including inactive) with pagination
 */
router.get('/tracks', async (req, res, next) => {
  try {
    const {
      search,
      status,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const where = {
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [tracks, total] = await Promise.all([
      req.prisma.track.findMany({
        where,
        include: {
          _count: {
            select: { courses: true, enrollments: true, orderItems: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.track.count({ where }),
    ]);

    // Transform to include stats
    const tracksWithStats = tracks.map(track => ({
      ...track,
      coursesCount: track._count.courses,
      enrollmentCount: track._count.enrollments,
      orderCount: track._count.orderItems,
      _count: undefined,
    }));

    res.json({
      success: true,
      tracks: tracksWithStats,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/tracks/:id
 * Get track by ID with all courses
 */
router.get('/tracks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const track = await req.prisma.track.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        courses: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { enrollments: true, orderItems: true },
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
        enrollmentCount: track._count.enrollments,
        orderCount: track._count.orderItems,
        _count: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tracks
 * Create a new track
 */
router.post('/tracks', async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      price,
      duration,
      level,
      image,
      isActive = true,
    } = req.body;

    // Validate required fields
    if (!title || !slug || price === undefined) {
      return res.status(400).json({
        message: 'Title, slug, and price are required',
      });
    }

    // Check for duplicate slug
    const existing = await req.prisma.track.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({
        message: 'A track with this slug already exists',
      });
    }

    const track = await req.prisma.track.create({
      data: {
        title,
        slug,
        description,
        price,
        duration,
        level,
        image,
        isActive,
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      track: {
        ...track,
        coursesCount: track._count.courses,
        _count: undefined,
      },
      message: 'Track created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/tracks/:id
 * Update a track
 */
router.put('/tracks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      price,
      duration,
      level,
      image,
      isActive,
    } = req.body;

    // Check if track exists
    const existing = await req.prisma.track.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check for duplicate slug (if slug is being changed)
    if (slug && slug !== existing.slug) {
      const slugExists = await req.prisma.track.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({
          message: 'A track with this slug already exists',
        });
      }
    }

    const track = await req.prisma.track.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(duration !== undefined && { duration }),
        ...(level !== undefined && { level }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        courses: true,
        _count: {
          select: { enrollments: true, orderItems: true },
        },
      },
    });

    res.json({
      success: true,
      track: {
        ...track,
        coursesCount: track.courses.length,
        enrollmentCount: track._count.enrollments,
        orderCount: track._count.orderItems,
        _count: undefined,
      },
      message: 'Track updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/tracks/:id
 * Delete a track
 */
router.delete('/tracks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if track exists
    const existing = await req.prisma.track.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true, enrollments: true, orderItems: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check for dependencies
    if (existing._count.enrollments > 0 || existing._count.orderItems > 0) {
      return res.status(400).json({
        message: 'Cannot delete track with existing enrollments or orders. Consider deactivating instead.',
      });
    }

    // Remove track association from courses first
    if (existing._count.courses > 0) {
      await req.prisma.course.updateMany({
        where: { trackId: id },
        data: { trackId: null },
      });
    }

    await req.prisma.track.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Track deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/tracks/:id/courses
 * Update courses assigned to a track
 */
router.put('/tracks/:id/courses', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseIds } = req.body;

    // Check if track exists
    const existing = await req.prisma.track.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Remove track from all courses currently in this track
    await req.prisma.course.updateMany({
      where: { trackId: id },
      data: { trackId: null },
    });

    // Assign new courses to the track
    if (courseIds && courseIds.length > 0) {
      await req.prisma.course.updateMany({
        where: { id: { in: courseIds } },
        data: { trackId: id },
      });
    }

    // Fetch updated track with courses
    const track = await req.prisma.track.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json({
      success: true,
      track,
      message: 'Track courses updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tracks/:id/duplicate
 * Duplicate a track
 */
router.post('/tracks/:id/duplicate', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await req.prisma.track.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Generate unique slug
    let newSlug = `${existing.slug}-copy`;
    let counter = 1;
    while (await req.prisma.track.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${existing.slug}-copy-${counter}`;
      counter++;
    }

    const track = await req.prisma.track.create({
      data: {
        title: `${existing.title} (Copy)`,
        slug: newSlug,
        description: existing.description,
        price: existing.price,
        duration: existing.duration,
        level: existing.level,
        image: existing.image,
        isActive: false, // Start as inactive
      },
    });

    res.status(201).json({
      success: true,
      track,
      message: 'Track duplicated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalCourses,
      activeCourses,
      totalTracks,
      activeTracks,
      totalEnrollments,
      totalOrders,
      totalRevenue,
      recentEnrollments,
    ] = await Promise.all([
      req.prisma.course.count(),
      req.prisma.course.count({ where: { isActive: true } }),
      req.prisma.track.count(),
      req.prisma.track.count({ where: { isActive: true } }),
      req.prisma.enrollment.count(),
      req.prisma.order.count({ where: { status: 'COMPLETED' } }),
      req.prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { total: true },
      }),
      req.prisma.enrollment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          course: {
            select: { title: true },
          },
          track: {
            select: { title: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        courses: {
          total: totalCourses,
          active: activeCourses,
          inactive: totalCourses - activeCourses,
        },
        tracks: {
          total: totalTracks,
          active: activeTracks,
          inactive: totalTracks - activeTracks,
        },
        enrollments: totalEnrollments,
        orders: totalOrders,
        revenue: totalRevenue._sum.total || 0,
        recentEnrollments,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
