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
const recordingPipeline = require('../services/recordingPipeline');
const vimeoService = require('../services/vimeo');

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
      level,
      search,
      status,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {
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
        subject: {
          select: { id: true, name: true, slug: true, color: true, icon: true },
        },
        learningPack: {
          select: { id: true, title: true },
        },
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
      isActive = true,
      subjectId,
      learningPackId,
      creditsFactor,
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
        isActive,
        subjectId: subjectId || null,
        learningPackId: learningPackId || null,
        creditsFactor: creditsFactor || 1,
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
      isActive,
      subjectId,
      learningPackId,
      creditsFactor,
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
        ...(isActive !== undefined && { isActive }),
        ...(subjectId !== undefined && { subjectId: subjectId || null }),
        ...(learningPackId !== undefined && { learningPackId: learningPackId || null }),
        ...(creditsFactor !== undefined && { creditsFactor }),
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
// LEARNING PACKS MANAGEMENT
// ============================================

/**
 * Calculate learning pack price from courses and tuition packs with discount
 */
const calculatePackPrice = (courses, tuitionPacks, discountPercentage) => {
  const coursesTotal = courses.reduce((sum, course) => sum + parseFloat(course.price || 0), 0);
  const tuitionTotal = (tuitionPacks || []).reduce((sum, tp) => {
    const packPrice = parseFloat(tp.tuitionPack?.price || 0);
    const quantity = tp.quantity || 1;
    return sum + (packPrice * quantity);
  }, 0);
  const originalPrice = coursesTotal + tuitionTotal;
  const discount = parseFloat(discountPercentage || 0);
  const discountedPrice = originalPrice * (1 - discount / 100);
  return {
    originalPrice: originalPrice.toFixed(2),
    price: discountedPrice.toFixed(2),
    savings: (originalPrice - discountedPrice).toFixed(2),
  };
};

/**
 * GET /api/admin/packs
 * Get all learning packs (including inactive) with pagination
 */
router.get('/packs', async (req, res, next) => {
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

    const [packs, total] = await Promise.all([
      req.prisma.learningPack.findMany({
        where,
        include: {
          courses: {
            select: { id: true, title: true, price: true },
          },
          tuitionPacks: {
            include: {
              tuitionPack: {
                select: { id: true, name: true, price: true, creditsIncluded: true },
              },
            },
          },
          _count: {
            select: { courses: true, enrollments: true, orderItems: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.learningPack.count({ where }),
    ]);

    // Transform to include stats and calculated prices
    const packsWithStats = packs.map(pack => {
      const pricing = calculatePackPrice(pack.courses, pack.tuitionPacks, pack.discountPercentage);
      return {
        ...pack,
        coursesCount: pack._count.courses,
        tuitionPacksCount: pack.tuitionPacks.length,
        enrollmentCount: pack._count.enrollments,
        orderCount: pack._count.orderItems,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
        courses: pack.courses.map(c => ({ id: c.id, title: c.title })),
        tuitionPacks: pack.tuitionPacks.map(tp => ({
          id: tp.tuitionPack.id,
          name: tp.tuitionPack.name,
          quantity: tp.quantity,
        })),
        _count: undefined,
      };
    });

    res.json({
      success: true,
      packs: packsWithStats,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/packs/:id
 * Get learning pack by ID with all courses and tuition packs
 */
router.get('/packs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const pack = await req.prisma.learningPack.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        courses: {
          orderBy: { createdAt: 'asc' },
        },
        tuitionPacks: {
          include: {
            tuitionPack: true,
          },
        },
        _count: {
          select: { enrollments: true, orderItems: true },
        },
      },
    });

    if (!pack) {
      return res.status(404).json({ message: 'Learning pack not found' });
    }

    // Calculate price from courses and tuition packs
    const pricing = calculatePackPrice(pack.courses, pack.tuitionPacks, pack.discountPercentage);

    res.json({
      success: true,
      pack: {
        ...pack,
        enrollmentCount: pack._count.enrollments,
        orderCount: pack._count.orderItems,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
        tuitionPacks: pack.tuitionPacks.map(tp => ({
          ...tp.tuitionPack,
          quantity: tp.quantity,
        })),
        _count: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/packs
 * Create a new learning pack
 */
router.post('/packs', async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      discountPercentage = 0,
      duration,
      level,
      image,
      isActive = true,
      tuitionPackIds = [], // Array of { tuitionPackId, quantity }
    } = req.body;

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        message: 'Title and slug are required',
      });
    }

    // Validate discount percentage
    const discount = parseFloat(discountPercentage) || 0;
    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        message: 'Discount percentage must be between 0 and 100',
      });
    }

    // Check for duplicate slug
    const existing = await req.prisma.learningPack.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({
        message: 'A learning pack with this slug already exists',
      });
    }

    const pack = await req.prisma.learningPack.create({
      data: {
        title,
        slug,
        description: sanitizeDescription(description),
        discountPercentage: discount,
        duration,
        level,
        image,
        isActive,
        tuitionPacks: {
          create: tuitionPackIds.map(tp => ({
            tuitionPackId: tp.tuitionPackId || tp.id,
            quantity: tp.quantity || 1,
          })),
        },
      },
      include: {
        courses: {
          select: { id: true, price: true },
        },
        tuitionPacks: {
          include: {
            tuitionPack: true,
          },
        },
        _count: {
          select: { courses: true },
        },
      },
    });

    const pricing = calculatePackPrice(pack.courses, pack.tuitionPacks, pack.discountPercentage);

    res.status(201).json({
      success: true,
      pack: {
        ...pack,
        coursesCount: pack._count.courses,
        tuitionPacksCount: pack.tuitionPacks.length,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
        courses: undefined,
        _count: undefined,
      },
      message: 'Learning pack created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/packs/:id
 * Update a learning pack
 */
router.put('/packs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      discountPercentage,
      duration,
      level,
      image,
      isActive,
      tuitionPackIds, // Array of { tuitionPackId, quantity }
    } = req.body;

    // Check if pack exists
    const existing = await req.prisma.learningPack.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Learning pack not found' });
    }

    // Validate discount percentage if provided
    if (discountPercentage !== undefined) {
      const discount = parseFloat(discountPercentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return res.status(400).json({
          message: 'Discount percentage must be between 0 and 100',
        });
      }
    }

    // Check for duplicate slug (if slug is being changed)
    if (slug && slug !== existing.slug) {
      const slugExists = await req.prisma.learningPack.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({
          message: 'A learning pack with this slug already exists',
        });
      }
    }

    // Update tuition packs if provided
    if (tuitionPackIds !== undefined) {
      await req.prisma.learningPackTuitionPack.deleteMany({
        where: { learningPackId: id },
      });
      if (tuitionPackIds.length > 0) {
        await req.prisma.learningPackTuitionPack.createMany({
          data: tuitionPackIds.map(tp => ({
            learningPackId: id,
            tuitionPackId: tp.tuitionPackId || tp.id,
            quantity: tp.quantity || 1,
          })),
        });
      }
    }

    const pack = await req.prisma.learningPack.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: sanitizeDescription(description) }),
        ...(discountPercentage !== undefined && { discountPercentage: parseFloat(discountPercentage) }),
        ...(duration !== undefined && { duration }),
        ...(level !== undefined && { level }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        courses: true,
        tuitionPacks: {
          include: {
            tuitionPack: true,
          },
        },
        _count: {
          select: { enrollments: true, orderItems: true },
        },
      },
    });

    const pricing = calculatePackPrice(pack.courses, pack.tuitionPacks, pack.discountPercentage);

    res.json({
      success: true,
      pack: {
        ...pack,
        coursesCount: pack.courses.length,
        tuitionPacksCount: pack.tuitionPacks.length,
        enrollmentCount: pack._count.enrollments,
        orderCount: pack._count.orderItems,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        savings: pricing.savings,
        _count: undefined,
      },
      message: 'Learning pack updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/packs/:id
 * Delete a learning pack
 */
router.delete('/packs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if pack exists
    const existing = await req.prisma.learningPack.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true, enrollments: true, orderItems: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Learning pack not found' });
    }

    // Check for dependencies
    if (existing._count.enrollments > 0 || existing._count.orderItems > 0) {
      return res.status(400).json({
        message: 'Cannot delete learning pack with existing enrollments or orders. Consider deactivating instead.',
      });
    }

    // Remove pack association from courses first
    if (existing._count.courses > 0) {
      await req.prisma.course.updateMany({
        where: { learningPackId: id },
        data: { learningPackId: null },
      });
    }

    // Delete tuition pack associations
    await req.prisma.learningPackTuitionPack.deleteMany({
      where: { learningPackId: id },
    });

    await req.prisma.learningPack.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Learning pack deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/packs/:id/courses
 * Update courses assigned to a learning pack
 */
router.put('/packs/:id/courses', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseIds } = req.body;

    // Check if pack exists
    const existing = await req.prisma.learningPack.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Learning pack not found' });
    }

    // Remove pack from all courses currently in this pack
    await req.prisma.course.updateMany({
      where: { learningPackId: id },
      data: { learningPackId: null },
    });

    // Assign new courses to the pack
    if (courseIds && courseIds.length > 0) {
      await req.prisma.course.updateMany({
        where: { id: { in: courseIds } },
        data: { learningPackId: id },
      });
    }

    // Fetch updated pack with courses
    const pack = await req.prisma.learningPack.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { createdAt: 'asc' },
        },
        tuitionPacks: {
          include: {
            tuitionPack: true,
          },
        },
      },
    });

    res.json({
      success: true,
      pack,
      message: 'Learning pack courses updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/packs/:id/tuition-packs
 * Update tuition packs assigned to a learning pack
 */
router.put('/packs/:id/tuition-packs', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tuitionPackIds } = req.body; // Array of { tuitionPackId, quantity }

    // Check if pack exists
    const existing = await req.prisma.learningPack.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Learning pack not found' });
    }

    // Remove all current tuition pack associations
    await req.prisma.learningPackTuitionPack.deleteMany({
      where: { learningPackId: id },
    });

    // Add new tuition pack associations
    if (tuitionPackIds && tuitionPackIds.length > 0) {
      await req.prisma.learningPackTuitionPack.createMany({
        data: tuitionPackIds.map(tp => ({
          learningPackId: id,
          tuitionPackId: tp.tuitionPackId || tp.id,
          quantity: tp.quantity || 1,
        })),
      });
    }

    // Fetch updated pack
    const pack = await req.prisma.learningPack.findUnique({
      where: { id },
      include: {
        courses: true,
        tuitionPacks: {
          include: {
            tuitionPack: true,
          },
        },
      },
    });

    res.json({
      success: true,
      pack,
      message: 'Learning pack tuition packs updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/packs/:id/duplicate
 * Duplicate a learning pack
 */
router.post('/packs/:id/duplicate', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await req.prisma.learningPack.findUnique({
      where: { id },
      include: {
        tuitionPacks: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Learning pack not found' });
    }

    // Generate unique slug
    let newSlug = `${existing.slug}-copy`;
    let counter = 1;
    while (await req.prisma.learningPack.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${existing.slug}-copy-${counter}`;
      counter++;
    }

    const pack = await req.prisma.learningPack.create({
      data: {
        title: `${existing.title} (Copy)`,
        slug: newSlug,
        description: existing.description,
        discountPercentage: existing.discountPercentage,
        duration: existing.duration,
        level: existing.level,
        image: existing.image,
        isActive: false, // Start as inactive
        tuitionPacks: {
          create: existing.tuitionPacks.map(tp => ({
            tuitionPackId: tp.tuitionPackId,
            quantity: tp.quantity,
          })),
        },
      },
    });

    res.status(201).json({
      success: true,
      pack,
      message: 'Learning pack duplicated successfully',
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
      totalPacks,
      activePacks,
      totalEnrollments,
      totalOrders,
      totalRevenue,
      recentEnrollments,
    ] = await Promise.all([
      req.prisma.course.count(),
      req.prisma.course.count({ where: { isActive: true } }),
      req.prisma.learningPack.count(),
      req.prisma.learningPack.count({ where: { isActive: true } }),
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
        packs: {
          total: totalPacks,
          active: activePacks,
          inactive: totalPacks - activePacks,
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

// ============================================
// ORDER ENROLLMENT FIX
// ============================================

/**
 * POST /api/admin/orders/:referenceId/fix-enrollment
 * Fix missing enrollments for a completed order
 */
router.post('/orders/:referenceId/fix-enrollment', async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    // Find the order with all related data
    const order = await req.prisma.order.findFirst({
      where: { referenceId },
      include: {
        items: {
          include: {
            course: true,
            track: { include: { courses: true } }
          }
        },
        payments: true,
        user: true,
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const results = {
      orderId: order.id,
      referenceId: order.referenceId,
      userId: order.userId,
      userEmail: order.user?.email,
      previousStatus: order.status,
      previousPaymentStatus: order.paymentStatus,
      enrollmentsCreated: [],
      enrollmentsExisted: [],
    };

    // Update order status to COMPLETED if needed
    if (order.status !== 'COMPLETED' || order.paymentStatus !== 'APPROVED') {
      await req.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'APPROVED',
        }
      });
      results.orderUpdated = true;

      // Update payment if exists
      const payment = order.payments[0];
      if (payment && payment.status !== 'APPROVED') {
        await req.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'APPROVED',
            paidAt: payment.paidAt || new Date(),
          }
        });
        results.paymentUpdated = true;
      }
    }

    // Get existing enrollments
    const existingEnrollments = await req.prisma.enrollment.findMany({
      where: { userId: order.userId },
    });

    // Create enrollments for each order item
    for (const item of order.items) {
      // Track enrollment
      if (item.trackId && item.track) {
        const existingTrackEnrollment = existingEnrollments.find(
          e => e.trackId === item.trackId
        );

        if (!existingTrackEnrollment) {
          await req.prisma.enrollment.create({
            data: {
              userId: order.userId,
              trackId: item.trackId,
              status: 'active',
            }
          });
          results.enrollmentsCreated.push({ type: 'track', name: item.track.name || item.track.title });
        } else {
          results.enrollmentsExisted.push({ type: 'track', name: item.track.name || item.track.title });
        }

        // Enroll in each course of the track
        if (item.track.courses && item.track.courses.length > 0) {
          for (const course of item.track.courses) {
            const existingCourseEnrollment = existingEnrollments.find(
              e => e.courseId === course.id
            );

            if (!existingCourseEnrollment) {
              await req.prisma.enrollment.create({
                data: {
                  userId: order.userId,
                  courseId: course.id,
                  status: 'active',
                  edxCourseId: course.edxCourseId,
                }
              });
              results.enrollmentsCreated.push({ type: 'course', name: course.name || course.title });
            } else {
              results.enrollmentsExisted.push({ type: 'course', name: course.name || course.title });
            }
          }
        }
      }

      // Single course enrollment
      if (item.courseId && item.course) {
        const existingCourseEnrollment = existingEnrollments.find(
          e => e.courseId === item.courseId
        );

        if (!existingCourseEnrollment) {
          await req.prisma.enrollment.create({
            data: {
              userId: order.userId,
              courseId: item.courseId,
              status: 'active',
              edxCourseId: item.course.edxCourseId,
            }
          });
          results.enrollmentsCreated.push({ type: 'course', name: item.course.name || item.course.title });
        } else {
          results.enrollmentsExisted.push({ type: 'course', name: item.course.name || item.course.title });
        }
      }
    }

    // Get final enrollment count
    const finalEnrollments = await req.prisma.enrollment.count({
      where: { userId: order.userId }
    });

    results.totalEnrollments = finalEnrollments;
    results.success = true;

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// ============================================
// TUTOR MANAGEMENT
// ============================================

/**
 * GET /api/admin/tutors
 * Get all tutor applications with filtering
 */
router.get('/tutors', async (req, res, next) => {
  try {
    const {
      status,
      search,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {
      ...(status && { status: status.toUpperCase() }),
      ...(search && {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { headline: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [tutors, total] = await Promise.all([
      req.prisma.tutorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
            },
          },
          courses: {
            include: {
              course: {
                select: { id: true, title: true, slug: true },
              },
            },
          },
          certifications: true,
          _count: {
            select: { sessions: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.tutorProfile.count({ where }),
    ]);

    res.json({
      success: true,
      tutors,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/tutors/:id
 * Get tutor details
 */
router.get('/tutors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            country: true,
            avatar: true,
            edxUsername: true,
            edxRegistered: true,
            createdAt: true,
          },
        },
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                edxCourseId: true,
              },
            },
          },
        },
        certifications: true,
        availability: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        sessions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            student: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json({ success: true, tutor });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tutors/:id/approve
 * Approve a tutor application
 */
router.post('/tutors/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enrollInEdx = true } = req.body;

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: true,
        courses: {
          include: {
            course: {
              select: { id: true, title: true, edxCourseId: true },
            },
          },
        },
      },
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.status !== 'PENDING') {
      return res.status(400).json({
        message: `Tutor is already ${tutor.status.toLowerCase()}`,
      });
    }

    // Update tutor profile status
    const updated = await req.prisma.tutorProfile.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: req.user.id,
      },
    });

    // Update user role to TUTOR
    await req.prisma.user.update({
      where: { id: tutor.userId },
      data: { role: 'TUTOR' },
    });

    // Enroll as staff in edX for each course (if configured)
    if (enrollInEdx && tutor.courses.length > 0) {
      const edxService = require('../services/edx');

      for (const tc of tutor.courses) {
        if (tc.course.edxCourseId) {
          try {
            // Enroll as staff using edX API
            const result = await edxService.enrollAsStaff(
              tutor.user.email,
              tc.course.edxCourseId
            );

            if (result.success) {
              await req.prisma.tutorCourse.update({
                where: { id: tc.id },
                data: {
                  edxStaffEnrolled: true,
                  edxEnrolledAt: new Date(),
                  canGrade: true,
                },
              });
            }
          } catch (edxError) {
            console.error(`Failed to enroll tutor as staff in ${tc.course.edxCourseId}:`, edxError);
          }
        }
      }
    }

    // Send approval email
    try {
      const { sendTemplatedEmail } = require('../services/email');
      await sendTemplatedEmail('tutorApproved', tutor.user.email, {
        firstName: tutor.user.firstName,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      });
    } catch (emailError) {
      console.error('Failed to send tutor approval email:', emailError);
    }

    res.json({
      success: true,
      message: 'Tutor approved successfully',
      tutor: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tutors/:id/reject
 * Reject a tutor application
 */
router.post('/tutors/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.status !== 'PENDING') {
      return res.status(400).json({
        message: `Tutor is already ${tutor.status.toLowerCase()}`,
      });
    }

    const updated = await req.prisma.tutorProfile.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Application did not meet our requirements',
      },
    });

    // Send rejection email
    try {
      const { sendTemplatedEmail } = require('../services/email');
      await sendTemplatedEmail('tutorRejected', tutor.user.email, {
        firstName: tutor.user.firstName,
        reason: reason || 'Application did not meet our requirements',
      });
    } catch (emailError) {
      console.error('Failed to send tutor rejection email:', emailError);
    }

    res.json({
      success: true,
      message: 'Tutor application rejected',
      tutor: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tutors/:id/suspend
 * Suspend an active tutor
 */
router.post('/tutors/:id/suspend', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.status !== 'APPROVED') {
      return res.status(400).json({
        message: 'Can only suspend approved tutors',
      });
    }

    const updated = await req.prisma.tutorProfile.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        rejectionReason: reason || 'Account suspended by admin',
      },
    });

    // Revert user role to STUDENT
    await req.prisma.user.update({
      where: { id: tutor.userId },
      data: { role: 'STUDENT' },
    });

    // Cancel all upcoming sessions
    await req.prisma.tutorSession.updateMany({
      where: {
        tutorProfileId: id,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'admin',
        cancellationReason: 'Tutor account suspended',
      },
    });

    res.json({
      success: true,
      message: 'Tutor suspended',
      tutor: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tutors/:id/reactivate
 * Reactivate a suspended tutor
 */
router.post('/tutors/:id/reactivate', async (req, res, next) => {
  try {
    const { id } = req.params;

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.status !== 'SUSPENDED') {
      return res.status(400).json({
        message: 'Can only reactivate suspended tutors',
      });
    }

    const updated = await req.prisma.tutorProfile.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
      },
    });

    // Restore user role to TUTOR
    await req.prisma.user.update({
      where: { id: tutor.userId },
      data: { role: 'TUTOR' },
    });

    res.json({
      success: true,
      message: 'Tutor reactivated',
      tutor: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tutors/:id/courses
 * Add courses to a tutor
 */
router.post('/tutors/:id/courses', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseIds, enrollInEdx = true } = req.body;

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ message: 'courseIds array is required' });
    }

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    const results = [];

    for (const courseId of courseIds) {
      // Check if course exists
      const course = await req.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        results.push({ courseId, success: false, error: 'Course not found' });
        continue;
      }

      // Upsert tutor course
      const tutorCourse = await req.prisma.tutorCourse.upsert({
        where: {
          tutorProfileId_courseId: {
            tutorProfileId: id,
            courseId,
          },
        },
        create: {
          tutorProfileId: id,
          courseId,
        },
        update: {},
      });

      // Enroll as staff in edX if tutor is approved
      if (enrollInEdx && tutor.status === 'APPROVED' && course.edxCourseId) {
        try {
          const edxService = require('../services/edx');
          const result = await edxService.enrollAsStaff(
            tutor.user.email,
            course.edxCourseId
          );

          if (result.success) {
            await req.prisma.tutorCourse.update({
              where: { id: tutorCourse.id },
              data: {
                edxStaffEnrolled: true,
                edxEnrolledAt: new Date(),
                canGrade: true,
              },
            });
          }

          results.push({
            courseId,
            success: true,
            edxEnrolled: result.success,
          });
        } catch (edxError) {
          results.push({
            courseId,
            success: true,
            edxEnrolled: false,
            edxError: edxError.message,
          });
        }
      } else {
        results.push({ courseId, success: true });
      }
    }

    res.json({
      success: true,
      message: 'Courses added to tutor',
      results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/tutors/:id/courses/:courseId
 * Remove a course from a tutor
 */
router.delete('/tutors/:id/courses/:courseId', async (req, res, next) => {
  try {
    const { id, courseId } = req.params;

    const tutorCourse = await req.prisma.tutorCourse.findUnique({
      where: {
        tutorProfileId_courseId: {
          tutorProfileId: id,
          courseId,
        },
      },
    });

    if (!tutorCourse) {
      return res.status(404).json({ message: 'Tutor course assignment not found' });
    }

    await req.prisma.tutorCourse.delete({
      where: { id: tutorCourse.id },
    });

    res.json({
      success: true,
      message: 'Course removed from tutor',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/tutors/stats
 * Get tutor statistics
 */
router.get('/tutors/stats', async (req, res, next) => {
  try {
    const [
      totalTutors,
      pendingTutors,
      approvedTutors,
      suspendedTutors,
      totalSessions,
      completedSessions,
    ] = await Promise.all([
      req.prisma.tutorProfile.count(),
      req.prisma.tutorProfile.count({ where: { status: 'PENDING' } }),
      req.prisma.tutorProfile.count({ where: { status: 'APPROVED' } }),
      req.prisma.tutorProfile.count({ where: { status: 'SUSPENDED' } }),
      req.prisma.tutorSession.count(),
      req.prisma.tutorSession.count({ where: { status: 'COMPLETED' } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalTutors,
        pendingTutors,
        approvedTutors,
        suspendedTutors,
        totalSessions,
        completedSessions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// TUITION PACKS MANAGEMENT
// ============================================

/**
 * GET /api/admin/tuition-packs
 * Get all tuition packs with credit statistics
 */
router.get('/tuition-packs', async (req, res, next) => {
  try {
    const packs = await req.prisma.tuitionPack.findMany({
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate credit statistics for each pack
    const packsWithStats = await Promise.all(packs.map(async (pack) => {
      const stats = await req.prisma.tuitionPackPurchase.aggregate({
        where: { tuitionPackId: pack.id },
        _sum: {
          creditsTotal: true,
          creditsUsed: true,
          creditsRemaining: true,
        },
      });

      return {
        ...pack,
        purchaseCount: pack._count.purchases,
        totalCreditsSold: stats._sum.creditsTotal || 0,
        totalCreditsUsed: stats._sum.creditsUsed || 0,
        totalCreditsRemaining: stats._sum.creditsRemaining || 0,
        _count: undefined,
      };
    }));

    res.json({
      success: true,
      packs: packsWithStats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tuition-packs
 * Create a tuition pack
 */
router.post('/tuition-packs', async (req, res, next) => {
  try {
    const { name, description, creditsIncluded, validityDays = 365, price, isActive = true } = req.body;

    if (!name || !creditsIncluded || price === undefined) {
      return res.status(400).json({
        message: 'Name, creditsIncluded, and price are required',
      });
    }

    const pack = await req.prisma.tuitionPack.create({
      data: {
        name,
        description,
        creditsIncluded,
        validityDays,
        price,
        isActive,
      },
    });

    res.status(201).json({
      success: true,
      pack,
      message: 'Tuition pack created',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/tuition-packs/:id
 * Update a tuition pack
 */
router.put('/tuition-packs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, creditsIncluded, validityDays, price, isActive } = req.body;

    const pack = await req.prisma.tuitionPack.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(creditsIncluded !== undefined && { creditsIncluded }),
        ...(validityDays !== undefined && { validityDays }),
        ...(price !== undefined && { price }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      pack,
      message: 'Tuition pack updated',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/tuition-packs/:id
 * Delete a tuition pack
 */
router.delete('/tuition-packs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const pack = await req.prisma.tuitionPack.findUnique({
      where: { id },
      include: {
        _count: { select: { purchases: true } },
      },
    });

    if (!pack) {
      return res.status(404).json({ message: 'Tuition pack not found' });
    }

    if (pack._count.purchases > 0) {
      return res.status(400).json({
        message: 'Cannot delete pack with existing purchases. Deactivate instead.',
      });
    }

    await req.prisma.tuitionPack.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Tuition pack deleted',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/tuition-packs/:id/assign
 * Manually assign a tuition pack to a student
 */
router.post('/tuition-packs/:id/assign', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get tuition pack
    const pack = await req.prisma.tuitionPack.findUnique({ where: { id } });
    if (!pack) {
      return res.status(404).json({ message: 'Tuition pack not found' });
    }

    if (!pack.isActive) {
      return res.status(400).json({ message: 'Cannot assign inactive tuition pack' });
    }

    // Get user
    const user = await req.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pack.validityDays);

    // Create purchase record
    const purchase = await req.prisma.tuitionPackPurchase.create({
      data: {
        userId,
        tuitionPackId: id,
        creditsTotal: pack.creditsIncluded,
        creditsUsed: 0,
        creditsRemaining: pack.creditsIncluded,
        creditsReserved: 0,
        expiresAt,
        assignedBy: req.user.id,
        assignedAt: new Date(),
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        tuitionPack: { select: { name: true, creditsIncluded: true } },
      },
    });

    res.status(201).json({
      success: true,
      purchase,
      message: `Assigned ${pack.creditsIncluded} credits to ${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/tuition-purchases
 * Get all tuition pack purchases with filtering
 */
router.get('/tuition-purchases', async (req, res, next) => {
  try {
    const { userId, tuitionPackId, status, search, limit = 50, offset = 0 } = req.query;

    const now = new Date();
    const where = {
      ...(userId && { userId }),
      ...(tuitionPackId && { tuitionPackId }),
      ...(status === 'active' && { creditsRemaining: { gt: 0 }, expiresAt: { gt: now } }),
      ...(status === 'expired' && { expiresAt: { lte: now } }),
      ...(status === 'depleted' && { creditsRemaining: 0 }),
      ...(search && {
        user: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [purchases, total] = await Promise.all([
      req.prisma.tuitionPackPurchase.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          tuitionPack: { select: { id: true, name: true, creditsIncluded: true, price: true } },
          order: { select: { id: true, referenceId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      req.prisma.tuitionPackPurchase.count({ where }),
    ]);

    res.json({ success: true, purchases, total });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/tuition-purchases/stats
 * Get tuition credit statistics
 */
router.get('/tuition-purchases/stats', async (req, res, next) => {
  try {
    const now = new Date();

    const [totalPurchases, activePurchases, expiredPurchases, creditStats] = await Promise.all([
      req.prisma.tuitionPackPurchase.count(),
      req.prisma.tuitionPackPurchase.count({
        where: { creditsRemaining: { gt: 0 }, expiresAt: { gt: now } },
      }),
      req.prisma.tuitionPackPurchase.count({
        where: { expiresAt: { lte: now } },
      }),
      req.prisma.tuitionPackPurchase.aggregate({
        _sum: {
          creditsTotal: true,
          creditsUsed: true,
          creditsRemaining: true,
          creditsReserved: true,
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalPurchases,
        activePurchases,
        expiredPurchases,
        totalCredits: creditStats._sum.creditsTotal || 0,
        usedCredits: creditStats._sum.creditsUsed || 0,
        remainingCredits: creditStats._sum.creditsRemaining || 0,
        reservedCredits: creditStats._sum.creditsReserved || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// RECORDINGS MANAGEMENT
// ============================================

/**
 * GET /api/admin/recordings
 * List all session recordings with filters
 */
router.get('/recordings', async (req, res, next) => {
  try {
    const {
      status,
      tutorId,
      studentId,
      dateFrom,
      dateTo,
      search,
      limit = 50,
      offset = 0,
    } = req.query;

    const where = {
      // Only sessions that have recording info
      OR: [
        { recordingStatus: { not: null } },
        { vimeoVideoId: { not: null } },
      ],
    };

    if (status) {
      where.recordingStatus = status;
    }

    if (tutorId) {
      where.tutorProfileId = tutorId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) {
        where.scheduledAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.scheduledAt.lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [
        { topic: { contains: search, mode: 'insensitive' } },
        { tutorProfile: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { student: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [recordings, total] = await Promise.all([
      req.prisma.tutorSession.findMany({
        where,
        include: {
          tutorProfile: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          student: {
            select: { id: true, name: true, email: true },
          },
          course: {
            select: { id: true, title: true },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit),
      }),
      req.prisma.tutorSession.count({ where }),
    ]);

    res.json({
      success: true,
      recordings: recordings.map(r => ({
        sessionId: r.id,
        scheduledAt: r.scheduledAt,
        topic: r.topic,
        duration: r.duration,
        recordingStatus: r.recordingStatus,
        recordingDuration: r.recordingDuration,
        vimeoVideoId: r.vimeoVideoId,
        vimeoVideoUrl: r.vimeoVideoUrl,
        tutor: r.tutorProfile?.user,
        student: r.student,
        course: r.course,
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/recordings/:sessionId
 * Get recording details for a specific session
 */
router.get('/recordings/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const recording = await recordingPipeline.getRecordingDetails(sessionId);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found',
      });
    }

    // If recording is on Vimeo, get additional details
    if (recording.vimeoVideoId) {
      try {
        const vimeoStatus = await vimeoService.getVideoStatus(recording.vimeoVideoId);
        recording.vimeoStatus = vimeoStatus.status;
        recording.videoDimensions = {
          width: vimeoStatus.width,
          height: vimeoStatus.height,
        };
      } catch (e) {
        // Vimeo details not available
      }
    }

    res.json({
      success: true,
      recording,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/recordings/:sessionId
 * Delete a recording (from Vimeo and database)
 */
router.delete('/recordings/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const result = await recordingPipeline.deleteRecording(sessionId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to delete recording',
      });
    }

    res.json({
      success: true,
      message: 'Recording deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/recordings/:sessionId/retry
 * Retry failed recording upload to Vimeo
 */
router.post('/recordings/:sessionId/retry', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.recordingStatus !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed recordings can be retried',
      });
    }

    // Reset status to pending for retry
    await req.prisma.tutorSession.update({
      where: { id: sessionId },
      data: { recordingStatus: 'pending' },
    });

    // Note: In production, you would need to re-trigger the S3 to Vimeo upload
    // This would require storing the S3 URL or having a way to locate the file

    res.json({
      success: true,
      message: 'Recording marked for retry',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/recordings/stats
 * Get recording statistics
 */
router.get('/recordings/stats', async (req, res, next) => {
  try {
    const [
      totalRecordings,
      completedRecordings,
      failedRecordings,
      processingRecordings,
      totalDuration,
    ] = await Promise.all([
      req.prisma.tutorSession.count({
        where: { recordingStatus: { not: null } },
      }),
      req.prisma.tutorSession.count({
        where: { recordingStatus: 'completed' },
      }),
      req.prisma.tutorSession.count({
        where: { recordingStatus: 'failed' },
      }),
      req.prisma.tutorSession.count({
        where: { recordingStatus: { in: ['recording', 'processing', 'pending'] } },
      }),
      req.prisma.tutorSession.aggregate({
        where: { recordingStatus: 'completed' },
        _sum: { recordingDuration: true },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalRecordings,
        completedRecordings,
        failedRecordings,
        processingRecordings,
        totalDurationSeconds: totalDuration._sum.recordingDuration || 0,
        totalDurationHours: Math.round((totalDuration._sum.recordingDuration || 0) / 3600 * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
