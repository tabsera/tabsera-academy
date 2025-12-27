/**
 * Admin Routes
 * CRUD operations for courses and tracks management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authenticate, requireRole } = require('../middleware/auth');
const { sanitizeDescription } = require('../utils/sanitize');
const { sendTemplatedEmail } = require('../services/email');

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
        description: sanitizeDescription(description),
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
        ...(description !== undefined && { description: sanitizeDescription(description) }),
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

/**
 * POST /api/admin/courses/sync-edx
 * Sync missing courses from edX platform
 */
router.post('/courses/sync-edx', async (req, res, next) => {
  try {
    const EDX_BASE_URL = process.env.EDX_BASE_URL || 'https://cambridge.tabsera.com';
    const EDX_CLIENT_ID = process.env.EDX_OAUTH_CLIENT_ID;
    const EDX_CLIENT_SECRET = process.env.EDX_OAUTH_CLIENT_SECRET;

    if (!EDX_CLIENT_ID || !EDX_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'edX OAuth credentials not configured',
      });
    }

    // Get OAuth token
    const tokenResponse = await fetch(`${EDX_BASE_URL}/oauth2/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: EDX_CLIENT_ID,
        client_secret: EDX_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate with edX platform',
        error,
      });
    }

    const { access_token } = await tokenResponse.json();

    // Fetch courses from edX
    let allCourses = [];
    let nextUrl = `${EDX_BASE_URL}/api/courses/v1/courses/?page_size=100`;

    while (nextUrl) {
      const coursesResponse = await fetch(nextUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!coursesResponse.ok) {
        break;
      }

      const data = await coursesResponse.json();
      const courses = data.results || data;

      if (Array.isArray(courses)) {
        allCourses = allCourses.concat(courses);
      }

      nextUrl = data.pagination?.next || data.next || null;
    }

    // Sync only missing courses
    const results = { created: 0, skipped: 0, courses: [] };

    for (const edxCourse of allCourses) {
      const courseId = edxCourse.id || edxCourse.course_id;
      const title = edxCourse.name || edxCourse.title || 'Untitled Course';

      // Check if course already exists
      const existing = await req.prisma.course.findFirst({
        where: { edxCourseId: courseId },
      });

      if (existing) {
        results.skipped++;
        continue;
      }

      // Generate slug
      const keyMatch = courseId?.match(/\+([^+]+)\+/);
      const keySuffix = keyMatch ? keyMatch[1].toLowerCase() : '';
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
      let slug = keySuffix ? `${baseSlug}-${keySuffix}` : baseSlug;

      // Ensure unique slug
      let counter = 1;
      while (await req.prisma.course.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }

      // Determine level
      const name = title.toLowerCase();
      let level = 'All Levels';
      if (name.includes('advanced') || name.includes('expert')) level = 'Advanced';
      else if (name.includes('intermediate')) level = 'Intermediate';
      else if (name.includes('beginner') || name.includes('introduction')) level = 'Beginner';

      // Create course
      const course = await req.prisma.course.create({
        data: {
          title,
          slug,
          description: edxCourse.short_description || edxCourse.overview || '',
          price: 0,
          duration: edxCourse.effort || 'Self-paced',
          level,
          lessons: edxCourse.blocks_count || 0,
          image: edxCourse.media?.image?.large || edxCourse.media?.course_image?.uri || null,
          externalUrl: `${EDX_BASE_URL}/courses/${courseId}/about`,
          edxCourseId: courseId,
          isActive: true,
        },
      });

      results.created++;
      results.courses.push({ id: course.id, title: course.title, edxCourseId: courseId });
    }

    res.json({
      success: true,
      message: `Synced ${results.created} new courses from edX. ${results.skipped} courses already exist.`,
      totalFromEdx: allCourses.length,
      created: results.created,
      skipped: results.skipped,
      newCourses: results.courses,
    });
  } catch (error) {
    console.error('edX sync error:', error);
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
        description: sanitizeDescription(description),
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
        ...(description !== undefined && { description: sanitizeDescription(description) }),
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

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * Get all users with filtering and pagination
 */
router.get('/users', async (req, res, next) => {
  try {
    const {
      role,
      status,
      centerId,
      search,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {
      ...(role && { role: role.toUpperCase() }),
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
      ...(status === 'pending' && { emailVerified: false }),
      ...(centerId && { centerId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      req.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          centerId: true,
          createdAt: true,
          updatedAt: true,
          center: {
            select: { id: true, name: true },
          },
          _count: {
            select: { enrollments: true, orders: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.user.count({ where }),
    ]);

    // Transform users to include counts
    const usersWithStats = users.map(user => ({
      ...user,
      enrollmentCount: user._count.enrollments,
      orderCount: user._count.orders,
      _count: undefined,
    }));

    res.json({
      success: true,
      users: usersWithStats,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user by ID
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await req.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        role: true,
        isActive: true,
        emailVerified: true,
        centerId: true,
        createdAt: true,
        updatedAt: true,
        center: {
          select: { id: true, name: true },
        },
        enrollments: {
          include: {
            course: { select: { id: true, title: true } },
            track: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          select: {
            id: true,
            referenceId: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/users
 * Create a new user
 */
router.post('/users', async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = 'STUDENT',
      centerId,
      isActive = true,
      sendWelcomeEmail = true,
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Email, first name, and last name are required',
      });
    }

    // Check for existing user
    const existing = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({
        message: 'A user with this email already exists',
      });
    }

    // Generate password if not provided
    const userPassword = password || crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const user = await req.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role.toUpperCase(),
        centerId: centerId || null,
        isActive,
        emailVerified: true, // Admin-created users are verified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        centerId: true,
        createdAt: true,
        center: {
          select: { id: true, name: true },
        },
      },
    });

    // Send welcome email with credentials if requested
    if (sendWelcomeEmail) {
      try {
        await sendTemplatedEmail('welcome', user.email, {
          ...user,
          password: userPassword,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      user,
      message: 'User created successfully',
      ...(password ? {} : { temporaryPassword: userPassword }),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/users/:id
 * Update a user
 */
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      phone,
      role,
      centerId,
      isActive,
    } = req.body;

    // Check if user exists
    const existing = await req.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for duplicate email
    if (email && email.toLowerCase() !== existing.email) {
      const emailExists = await req.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailExists) {
        return res.status(400).json({
          message: 'A user with this email already exists',
        });
      }
    }

    const user = await req.prisma.user.update({
      where: { id },
      data: {
        ...(email && { email: email.toLowerCase() }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(role && { role: role.toUpperCase() }),
        ...(centerId !== undefined && { centerId: centerId || null }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        centerId: true,
        createdAt: true,
        updatedAt: true,
        center: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      success: true,
      user,
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await req.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true, enrollments: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't delete users with orders
    if (existing._count.orders > 0) {
      return res.status(400).json({
        message: 'Cannot delete user with existing orders. Deactivate instead.',
      });
    }

    // Delete enrollments first
    await req.prisma.enrollment.deleteMany({
      where: { userId: id },
    });

    // Delete user
    await req.prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/users/:id/reset-password
 * Send password reset email to a user
 */
router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await req.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await req.prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendTemplatedEmail('passwordReset', user.email, {
      ...user,
      resetLink,
    });

    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/users/bulk-reset-password
 * Send password reset emails to multiple users
 */
router.post('/users/bulk-reset-password', async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: 'User IDs array is required',
      });
    }

    const users = await req.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    const results = [];

    for (const user of users) {
      try {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await req.prisma.user.update({
          where: { id: user.id },
          data: {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
          },
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendTemplatedEmail('passwordReset', user.email, {
          ...user,
          resetLink,
        });

        results.push({ userId: user.id, email: user.email, success: true });
      } catch (err) {
        results.push({ userId: user.id, email: user.email, success: false, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Password reset emails sent to ${results.filter(r => r.success).length} of ${users.length} users`,
      results,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ENROLLMENT MANAGEMENT
// ============================================

/**
 * GET /api/admin/enrollments
 * Get all enrollments with filtering
 */
router.get('/enrollments', async (req, res, next) => {
  try {
    const {
      userId,
      trackId,
      courseId,
      status,
      search,
      limit = 50,
      offset = 0,
    } = req.query;

    const where = {
      ...(userId && { userId }),
      ...(trackId && { trackId }),
      ...(courseId && { courseId }),
      ...(status && { status }),
    };

    // If search is provided, we need to search in user fields
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [enrollments, total] = await Promise.all([
      req.prisma.enrollment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              center: { select: { id: true, name: true } },
            },
          },
          course: {
            select: { id: true, title: true, slug: true },
          },
          track: {
            select: { id: true, title: true, slug: true },
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
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/enrollments
 * Create a single enrollment
 */
router.post('/enrollments', async (req, res, next) => {
  try {
    const { userId, trackId, courseId, status = 'active' } = req.body;

    if (!userId || (!trackId && !courseId)) {
      return res.status(400).json({
        message: 'User ID and either track ID or course ID are required',
      });
    }

    // Check if enrollment already exists
    const existing = await req.prisma.enrollment.findFirst({
      where: {
        userId,
        ...(trackId && { trackId }),
        ...(courseId && { courseId }),
      },
    });

    if (existing) {
      return res.status(400).json({
        message: 'User is already enrolled in this track/course',
      });
    }

    const enrollment = await req.prisma.enrollment.create({
      data: {
        userId,
        trackId: trackId || null,
        courseId: courseId || null,
        status,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        course: { select: { id: true, title: true } },
        track: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({
      success: true,
      enrollment,
      message: 'Enrollment created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/enrollments/bulk
 * Bulk enroll students from CSV data
 */
router.post('/enrollments/bulk', async (req, res, next) => {
  try {
    const { students, trackId, centerId, createUsers = true } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: 'Students array is required',
      });
    }

    if (!trackId) {
      return res.status(400).json({
        message: 'Track ID is required',
      });
    }

    // Get track with courses
    const track = await req.prisma.track.findUnique({
      where: { id: trackId },
      include: { courses: true },
    });

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const results = [];
    const createdUsers = [];
    const enrolledUsers = [];

    for (const student of students) {
      try {
        const { firstName, lastName, email, guardianName, guardianPhone, classroom } = student;

        if (!firstName || !lastName || !email) {
          results.push({
            email: email || 'unknown',
            success: false,
            error: 'Missing required fields (firstName, lastName, email)',
          });
          continue;
        }

        // Find or create user
        let user = await req.prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user && createUsers) {
          // Generate password
          const password = crypto.randomBytes(8).toString('hex');
          const hashedPassword = await bcrypt.hash(password, 10);

          user = await req.prisma.user.create({
            data: {
              email: email.toLowerCase(),
              password: hashedPassword,
              firstName,
              lastName,
              phone: guardianPhone,
              role: 'STUDENT',
              centerId: centerId || null,
              isActive: true,
              emailVerified: true,
            },
          });

          createdUsers.push({ ...user, temporaryPassword: password });
        } else if (!user) {
          results.push({
            email,
            success: false,
            error: 'User not found and createUsers is false',
          });
          continue;
        }

        // Check if already enrolled in track
        const existingEnrollment = await req.prisma.enrollment.findFirst({
          where: { userId: user.id, trackId },
        });

        if (existingEnrollment) {
          results.push({
            email,
            success: true,
            message: 'Already enrolled',
            userId: user.id,
          });
          continue;
        }

        // Create track enrollment
        await req.prisma.enrollment.create({
          data: {
            userId: user.id,
            trackId,
            status: 'active',
          },
        });

        // Create course enrollments for all courses in track
        for (const course of track.courses) {
          await req.prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId: course.id,
              status: 'active',
              edxCourseId: course.edxCourseId,
            },
          });
        }

        enrolledUsers.push(user);
        results.push({
          email,
          success: true,
          userId: user.id,
          isNewUser: createdUsers.some(u => u.id === user.id),
        });
      } catch (err) {
        results.push({
          email: student.email || 'unknown',
          success: false,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Enrolled ${enrolledUsers.length} students. Created ${createdUsers.length} new users.`,
      stats: {
        total: students.length,
        enrolled: enrolledUsers.length,
        created: createdUsers.length,
        failed: results.filter(r => !r.success).length,
      },
      results,
      createdUsers: createdUsers.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        temporaryPassword: u.temporaryPassword,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/enrollments/:id
 * Delete an enrollment
 */
router.delete('/enrollments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await req.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    await req.prisma.enrollment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Enrollment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// LEARNING CENTERS
// ============================================

/**
 * GET /api/admin/centers
 * Get all learning centers
 */
router.get('/centers', async (req, res, next) => {
  try {
    const centers = await req.prisma.learningCenter.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        country: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      centers: centers.map(c => ({
        ...c,
        userCount: c._count.users,
        _count: undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ORDERS MANAGEMENT
// ============================================

/**
 * GET /api/admin/orders
 * Get all orders with filtering and pagination
 */
router.get('/orders', async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      paymentMethod,
      centerId,
      search,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(paymentMethod && { paymentMethod }),
      ...(centerId && { centerId }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { ...where?.createdAt, lte: new Date(endDate) } }),
      ...(search && {
        OR: [
          { referenceId: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      req.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              track: { select: { id: true, title: true } },
              course: { select: { id: true, title: true } },
            },
          },
          center: {
            select: { id: true, name: true },
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      orders,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/orders/stats
 * Get order statistics
 */
router.get('/orders/stats', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
    };

    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
      totalRevenue,
      ordersByMethod,
    ] = await Promise.all([
      req.prisma.order.count({ where: dateFilter }),
      req.prisma.order.count({ where: { ...dateFilter, status: 'COMPLETED' } }),
      req.prisma.order.count({ where: { ...dateFilter, status: 'PENDING_PAYMENT' } }),
      req.prisma.order.count({ where: { ...dateFilter, status: { in: ['FAILED', 'CANCELLED'] } } }),
      req.prisma.order.aggregate({
        where: { ...dateFilter, status: 'COMPLETED' },
        _sum: { total: true },
      }),
      req.prisma.order.groupBy({
        by: ['paymentMethod'],
        where: { ...dateFilter, status: 'COMPLETED' },
        _count: true,
        _sum: { total: true },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        failedOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        ordersByMethod: ordersByMethod.map(m => ({
          method: m.paymentMethod,
          count: m._count,
          revenue: m._sum.total || 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/orders/:id
 * Get single order details
 */
router.get('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await req.prisma.order.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            track: true,
            course: true,
          },
        },
        center: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Update order status
 */
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const order = await req.prisma.order.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
      include: {
        items: {
          include: {
            track: { include: { courses: true } },
            course: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updateData = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(notes && { notes }),
    };

    // If marking as completed, process enrollments
    if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
      // Create enrollments for each item
      for (const item of order.items) {
        if (item.track) {
          // Enroll in track
          const existingTrackEnrollment = await req.prisma.enrollment.findFirst({
            where: { userId: order.userId, trackId: item.trackId },
          });

          if (!existingTrackEnrollment) {
            await req.prisma.enrollment.create({
              data: {
                userId: order.userId,
                trackId: item.trackId,
                status: 'active',
              },
            });
          }

          // Enroll in all courses in track
          for (const course of item.track.courses) {
            const existingCourseEnrollment = await req.prisma.enrollment.findFirst({
              where: { userId: order.userId, courseId: course.id },
            });

            if (!existingCourseEnrollment) {
              await req.prisma.enrollment.create({
                data: {
                  userId: order.userId,
                  courseId: course.id,
                  status: 'active',
                  edxCourseId: course.edxCourseId,
                },
              });
            }
          }
        } else if (item.course) {
          // Enroll in individual course
          const existingEnrollment = await req.prisma.enrollment.findFirst({
            where: { userId: order.userId, courseId: item.courseId },
          });

          if (!existingEnrollment) {
            await req.prisma.enrollment.create({
              data: {
                userId: order.userId,
                courseId: item.courseId,
                status: 'active',
                edxCourseId: item.course.edxCourseId,
              },
            });
          }
        }
      }
    }

    const updatedOrder = await req.prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: {
          include: {
            track: { select: { id: true, title: true } },
            course: { select: { id: true, title: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/orders/:id/refund
 * Process refund for an order
 */
router.post('/orders/:id/refund', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const order = await req.prisma.order.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
      include: { payments: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Can only refund completed orders' });
    }

    const refundAmount = amount || order.total;

    // Create refund payment record
    const payment = await req.prisma.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        amount: -refundAmount,
        status: 'REFUNDED',
        paymentMethod: order.paymentMethod,
        notes: reason || 'Admin refund',
      },
    });

    // Update order status
    await req.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
      },
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PAYMENTS MANAGEMENT
// ============================================

/**
 * GET /api/admin/payments
 * Get all payments with filtering
 */
router.get('/payments', async (req, res, next) => {
  try {
    const {
      status,
      paymentMethod,
      search,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = req.query;

    const where = {
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      ...(search && {
        OR: [
          { order: { referenceId: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { waafipayOrderId: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [payments, total] = await Promise.all([
      req.prisma.payment.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          order: {
            select: { id: true, referenceId: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      payments,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/payments/stats
 * Get payment statistics
 */
router.get('/payments/stats', async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalPayments,
      approvedPayments,
      monthlyRevenue,
      yearlyRevenue,
      recentPayments,
    ] = await Promise.all([
      req.prisma.payment.count(),
      req.prisma.payment.count({ where: { status: 'APPROVED' } }),
      req.prisma.payment.aggregate({
        where: {
          status: 'APPROVED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      req.prisma.payment.aggregate({
        where: {
          status: 'APPROVED',
          createdAt: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      req.prisma.payment.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalPayments,
        approvedPayments,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        yearlyRevenue: yearlyRevenue._sum.amount || 0,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
