/**
 * Tutor Routes
 * Handles tutor registration, profile, certifications, and management
 */

const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { upload, uploadDocument, getFileUrl, deleteFile } = require('../services/upload');
const { createMeetSession, cancelMeetSession } = require('../services/googleMeet');
const livekitService = require('../services/livekit');
const recordingPipeline = require('../services/recordingPipeline');

const router = express.Router();

// ============================================
// TUTOR REGISTRATION & PROFILE
// ============================================

/**
 * POST /api/tutors/register
 * Register as a tutor (requires authenticated student)
 */
router.post('/register', authenticate, async (req, res, next) => {
  try {
    const { bio, headline, timezone, courses } = req.body;
    const userId = req.user.id;

    // Check if user already has a tutor profile
    const existingProfile = await req.prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'You already have a tutor profile',
      });
    }

    // Create tutor profile
    const tutorProfile = await req.prisma.tutorProfile.create({
      data: {
        userId,
        bio: bio || null,
        headline: headline || null,
        timezone: timezone || 'UTC',
        status: 'PENDING',
      },
    });

    // Update user role to TUTOR
    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: { role: 'TUTOR' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
      },
    });

    // Add selected courses if provided
    if (courses && courses.length > 0) {
      await req.prisma.tutorCourse.createMany({
        data: courses.map(courseId => ({
          tutorProfileId: tutorProfile.id,
          courseId,
        })),
      });
    }

    // Fetch complete profile with relations
    const profile = await req.prisma.tutorProfile.findUnique({
      where: { id: tutorProfile.id },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
        certifications: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tutor registration submitted for review',
      profile,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/profile
 * Get current tutor's profile
 */
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
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
              select: { id: true, title: true, slug: true, image: true },
            },
          },
        },
        certifications: true,
        availability: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tutors/profile
 * Update tutor profile
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { bio, headline, timezone, hourlyRate } = req.body;

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    const updated = await req.prisma.tutorProfile.update({
      where: { id: profile.id },
      data: {
        bio: bio !== undefined ? bio : profile.bio,
        headline: headline !== undefined ? headline : profile.headline,
        timezone: timezone !== undefined ? timezone : profile.timezone,
        hourlyRate: hourlyRate !== undefined ? hourlyRate : profile.hourlyRate,
      },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
        certifications: true,
      },
    });

    res.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// CERTIFICATIONS
// ============================================

/**
 * POST /api/tutors/certifications
 * Upload a certification document
 */
router.post('/certifications', authenticate, (req, res, next) => {
  uploadDocument.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 25MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    try {
      // Get tutor profile
      const profile = await req.prisma.tutorProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        // Delete uploaded file
        deleteFile(getFileUrl('certifications', req.file.filename));
        return res.status(404).json({
          success: false,
          message: 'Tutor profile not found. Please register as a tutor first.',
        });
      }

      const { title, institution } = req.body;
      const fileUrl = getFileUrl('certifications', req.file.filename);

      // Create certification record
      const certification = await req.prisma.tutorCertification.create({
        data: {
          tutorProfileId: profile.id,
          title: title || 'Untitled Certificate',
          institution: institution || 'Unknown Institution',
          fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        },
      });

      res.status(201).json({
        success: true,
        certification,
      });
    } catch (error) {
      // Delete uploaded file on error
      deleteFile(getFileUrl('certifications', req.file.filename));
      next(error);
    }
  });
});

/**
 * DELETE /api/tutors/certifications/:id
 * Delete a certification
 */
router.delete('/certifications/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get certification with profile
    const certification = await req.prisma.tutorCertification.findUnique({
      where: { id },
      include: {
        tutorProfile: true,
      },
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found',
      });
    }

    // Verify ownership
    if (certification.tutorProfile.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this certification',
      });
    }

    // Delete file
    deleteFile(certification.fileUrl);

    // Delete record
    await req.prisma.tutorCertification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Certification deleted',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// AVATAR UPLOAD
// ============================================

/**
 * POST /api/tutors/avatar
 * Upload or update tutor avatar photo
 */
router.post('/avatar', authenticate, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    try {
      const avatarUrl = getFileUrl('avatars', req.file.filename);

      // Get current user to check for existing avatar
      const user = await req.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { avatar: true },
      });

      // Delete old avatar if exists
      if (user.avatar) {
        deleteFile(user.avatar);
      }

      // Update user's avatar
      await req.prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: avatarUrl },
      });

      res.json({
        success: true,
        avatarUrl,
        message: 'Avatar uploaded successfully',
      });
    } catch (error) {
      // Delete uploaded file on error
      deleteFile(getFileUrl('avatars', req.file.filename));
      next(error);
    }
  });
});

// ============================================
// COURSES (Tutor's assigned courses)
// ============================================

/**
 * GET /api/tutors/courses
 * Get tutor's assigned courses
 */
router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    const courses = await req.prisma.tutorCourse.findMany({
      where: { tutorProfileId: profile.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            edxCourseId: true,
          },
        },
      },
    });

    res.json({
      success: true,
      courses,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/courses
 * Add courses to tutor's profile (during registration)
 */
router.post('/courses', authenticate, async (req, res, next) => {
  try {
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({
        success: false,
        message: 'courseIds array is required',
      });
    }

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    // Only allow adding courses if pending
    if (profile.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify courses after approval. Contact admin.',
      });
    }

    // Add courses (skip duplicates)
    for (const courseId of courseIds) {
      await req.prisma.tutorCourse.upsert({
        where: {
          tutorProfileId_courseId: {
            tutorProfileId: profile.id,
            courseId,
          },
        },
        create: {
          tutorProfileId: profile.id,
          courseId,
        },
        update: {},
      });
    }

    // Fetch updated courses
    const courses = await req.prisma.tutorCourse.findMany({
      where: { tutorProfileId: profile.id },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    res.json({
      success: true,
      courses,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// AVAILABILITY
// ============================================

/**
 * GET /api/tutors/availability
 * Get tutor's availability slots
 */
router.get('/availability', authenticate, async (req, res, next) => {
  try {
    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    const availability = await req.prisma.tutorAvailability.findMany({
      where: { tutorProfileId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json({
      success: true,
      availability,
      timezone: profile.timezone,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/availability
 * Set tutor's availability slots (replaces all)
 */
router.post('/availability', authenticate, async (req, res, next) => {
  try {
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: 'slots array is required',
      });
    }

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    // Delete existing slots
    await req.prisma.tutorAvailability.deleteMany({
      where: { tutorProfileId: profile.id },
    });

    // Create new slots
    if (slots.length > 0) {
      await req.prisma.tutorAvailability.createMany({
        data: slots.map(slot => ({
          tutorProfileId: profile.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: slot.isActive !== false,
        })),
      });
    }

    // Fetch updated availability
    const availability = await req.prisma.tutorAvailability.findMany({
      where: { tutorProfileId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// SESSIONS (for tutors)
// ============================================

/**
 * GET /api/tutors/sessions
 * Get tutor's sessions
 */
router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    const where = { tutorProfileId: profile.id };

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = { gte: new Date() };
      where.status = { in: ['SCHEDULED', 'IN_PROGRESS'] };
    }

    const sessions = await req.prisma.tutorSession.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tutors/sessions/:id
 * Update session (add notes, complete, etc.)
 */
router.put('/sessions/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tutorNotes, status } = req.body;

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
    });

    if (!session || session.tutorProfileId !== profile.id) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const updateData = {};

    if (tutorNotes !== undefined) {
      updateData.tutorNotes = tutorNotes;
    }

    if (status) {
      updateData.status = status;
      if (status === 'IN_PROGRESS') {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED') {
        updateData.endedAt = new Date();
        // Increment total sessions count
        await req.prisma.tutorProfile.update({
          where: { id: profile.id },
          data: { totalSessions: { increment: 1 } },
        });
        // Move credits from reserved to used
        if (session.purchaseId && session.creditsConsumed > 0) {
          await req.prisma.tuitionPackPurchase.update({
            where: { id: session.purchaseId },
            data: {
              creditsUsed: { increment: session.creditsConsumed },
              creditsReserved: { decrement: session.creditsConsumed },
            },
          });
        }
      }
    }

    const updated = await req.prisma.tutorSession.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: { id: true, title: true },
        },
      },
    });

    res.json({
      success: true,
      session: updated,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUBLIC: Browse tutors (for students)
// ============================================

/**
 * GET /api/tutors
 * List approved tutors (public)
 */
router.get('/', async (req, res, next) => {
  try {
    const { courseId, search, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: 'APPROVED',
    };

    if (courseId) {
      where.courses = {
        some: { courseId },
      };
    }

    if (search) {
      where.OR = [
        { headline: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [tutors, total] = await Promise.all([
      req.prisma.tutorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
          _count: {
            select: { sessions: { where: { status: 'COMPLETED' } } },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: [
          { avgRating: 'desc' },
          { totalSessions: 'desc' },
        ],
      }),
      req.prisma.tutorProfile.count({ where }),
    ]);

    res.json({
      success: true,
      tutors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/:id
 * Get tutor details (public)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        courses: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, image: true },
            },
          },
        },
        availability: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        _count: {
          select: { sessions: { where: { status: 'COMPLETED' } } },
        },
      },
    });

    if (!tutor || tutor.status !== 'APPROVED') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found',
      });
    }

    res.json({
      success: true,
      tutor,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/:id/slots
 * Get available booking slots for a tutor on a specific date
 */
router.get('/:id/slots', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, studentTimezone } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date parameter is required (YYYY-MM-DD)',
      });
    }

    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        availability: {
          where: { isActive: true },
        },
      },
    });

    if (!tutor || tutor.status !== 'APPROVED') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found',
      });
    }

    // Parse date and get day of week
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get availability for this day
    const dayAvailability = tutor.availability.filter(a => a.dayOfWeek === dayOfWeek);

    if (dayAvailability.length === 0) {
      return res.json({
        success: true,
        slots: [],
        message: 'Tutor not available on this day',
      });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await req.prisma.tutorSession.findMany({
      where: {
        tutorProfileId: id,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      select: { scheduledAt: true, duration: true },
    });

    // Generate available slots (10-minute intervals)
    const slots = [];
    for (const availability of dayAvailability) {
      const [startHour, startMin] = availability.startTime.split(':').map(Number);
      const [endHour, endMin] = availability.endTime.split(':').map(Number);

      let current = new Date(date);
      current.setHours(startHour, startMin, 0, 0);

      const end = new Date(date);
      end.setHours(endHour, endMin, 0, 0);

      while (current < end) {
        const slotTime = new Date(current);
        const slotEnd = new Date(current.getTime() + 10 * 60 * 1000);

        // Check if slot is in the past
        if (slotTime > new Date()) {
          // Check if slot conflicts with existing booking
          const isBooked = existingBookings.some(booking => {
            const bookingEnd = new Date(booking.scheduledAt.getTime() + booking.duration * 60 * 1000);
            return slotTime < bookingEnd && slotEnd > booking.scheduledAt;
          });

          if (!isBooked) {
            slots.push({
              time: slotTime.toISOString(),
              available: true,
            });
          }
        }

        current = new Date(current.getTime() + 10 * 60 * 1000);
      }
    }

    res.json({
      success: true,
      slots,
      tutorTimezone: tutor.timezone,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// SESSION BOOKING (for students)
// ============================================

/**
 * POST /api/tutors/:id/book
 * Book a session with a tutor (consumes credits)
 */
router.post('/:id/book', authenticate, async (req, res, next) => {
  try {
    const { id: tutorProfileId } = req.params;
    const { scheduledAt, courseId, topic } = req.body;
    const studentId = req.user.id;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time is required',
      });
    }

    // Get tutor profile
    const tutor = await req.prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
    });

    if (!tutor || tutor.status !== 'APPROVED') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found',
      });
    }

    // Can't book yourself
    if (tutor.userId === studentId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a session with yourself',
      });
    }

    // Get course to determine credit factor
    let creditsFactor = 1;
    if (courseId) {
      const course = await req.prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        creditsFactor = course.creditsFactor || 1;
      }
    }

    // Find a valid tuition pack purchase with enough credits
    const now = new Date();
    const purchase = await req.prisma.tuitionPackPurchase.findFirst({
      where: {
        userId: studentId,
        creditsRemaining: { gte: creditsFactor },
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'asc' }, // Use the one expiring soonest
    });

    if (!purchase) {
      // Get available credits for better error message
      const totalCredits = await req.prisma.tuitionPackPurchase.aggregate({
        where: { userId: studentId, expiresAt: { gt: now } },
        _sum: { creditsRemaining: true },
      });

      return res.status(400).json({
        success: false,
        message: `Insufficient credits. This course requires ${creditsFactor} credit(s) per session.`,
        creditsRequired: creditsFactor,
        creditsAvailable: totalCredits._sum.creditsRemaining || 0,
      });
    }

    // Check if the slot is still available
    const scheduledTime = new Date(scheduledAt);
    const slotEnd = new Date(scheduledTime.getTime() + 10 * 60 * 1000);

    const conflictingSession = await req.prisma.tutorSession.findFirst({
      where: {
        tutorProfileId,
        scheduledAt: {
          gte: scheduledTime,
          lt: slotEnd,
        },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    });

    if (conflictingSession) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available',
      });
    }

    // Get student and tutor emails for meeting invite
    const student = await req.prisma.user.findUnique({
      where: { id: studentId },
      select: { email: true, firstName: true },
    });

    const tutorUser = await req.prisma.user.findUnique({
      where: { id: tutor.userId },
      select: { email: true, firstName: true },
    });

    // Reserve credits and create session
    const session = await req.prisma.$transaction(async (prisma) => {
      // Update purchase - reserve credits
      await prisma.tuitionPackPurchase.update({
        where: { id: purchase.id },
        data: {
          creditsRemaining: { decrement: creditsFactor },
          creditsReserved: { increment: creditsFactor },
        },
      });

      // Create session first to get the ID
      const newSession = await prisma.tutorSession.create({
        data: {
          tutorProfileId,
          studentId,
          purchaseId: purchase.id,
          courseId,
          scheduledAt: scheduledTime,
          duration: 10,
          status: 'SCHEDULED',
          topic,
          creditsConsumed: creditsFactor,
        },
        include: {
          tutorProfile: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          course: { select: { id: true, title: true } },
        },
      });

      return newSession;
    });

    // Generate meeting link (async, non-blocking)
    try {
      const meetingInfo = await createMeetSession({
        tutorEmail: tutorUser.email,
        studentEmail: student.email,
        scheduledAt: scheduledTime,
        duration: 10,
        topic: topic || `Tutoring with ${tutorUser.firstName}`,
        sessionId: session.id,
      });

      // Update session with meeting URL
      if (meetingInfo.meetingUrl) {
        await req.prisma.tutorSession.update({
          where: { id: session.id },
          data: {
            meetingUrl: meetingInfo.meetingUrl,
            meetingId: meetingInfo.meetingId,
          },
        });
        session.meetingUrl = meetingInfo.meetingUrl;
      }
    } catch (meetError) {
      console.error('Failed to create meeting link:', meetError.message);
      // Continue without meeting link - can be added later
    }

    res.status(201).json({
      success: true,
      session,
      creditsDeducted: creditsFactor,
      creditsRemaining: purchase.creditsRemaining - creditsFactor,
      message: 'Session booked successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/tutors/sessions/:id/cancel
 * Cancel a session and refund credits
 */
router.patch('/sessions/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      include: { purchase: true },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is the student or the tutor
    const tutorProfile = await req.prisma.tutorProfile.findUnique({
      where: { userId },
    });

    const isStudent = session.studentId === userId;
    const isTutor = tutorProfile && session.tutorProfileId === tutorProfile.id;

    if (!isStudent && !isTutor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this session',
      });
    }

    if (session.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled sessions can be cancelled',
      });
    }

    let creditsRefunded = 0;

    // Refund credits and update session
    await req.prisma.$transaction(async (prisma) => {
      // Update session status
      await prisma.tutorSession.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: isStudent ? 'student' : 'tutor',
          cancellationReason: reason,
          creditsRefunded: true,
        },
      });

      // Refund credits to purchase
      if (session.purchaseId && session.creditsConsumed > 0) {
        await prisma.tuitionPackPurchase.update({
          where: { id: session.purchaseId },
          data: {
            creditsRemaining: { increment: session.creditsConsumed },
            creditsReserved: { decrement: session.creditsConsumed },
          },
        });
        creditsRefunded = session.creditsConsumed;
      }
    });

    res.json({
      success: true,
      message: 'Session cancelled and credits refunded',
      creditsRefunded,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/student/credits
 * Get student's tuition credit summary
 */
router.get('/student/credits', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const purchases = await req.prisma.tuitionPackPurchase.findMany({
      where: { userId },
      include: {
        tuitionPack: {
          select: { name: true, creditsIncluded: true },
        },
      },
      orderBy: { expiresAt: 'asc' },
    });

    // Calculate totals
    const active = purchases.filter(p => p.creditsRemaining > 0 && p.expiresAt > now);
    const expired = purchases.filter(p => p.expiresAt <= now);

    const summary = {
      totalCreditsAvailable: active.reduce((sum, p) => sum + p.creditsRemaining, 0),
      totalCreditsReserved: active.reduce((sum, p) => sum + p.creditsReserved, 0),
      totalCreditsUsed: purchases.reduce((sum, p) => sum + p.creditsUsed, 0),
      activePurchases: active.length,
      expiredPurchases: expired.length,
    };

    res.json({
      success: true,
      summary,
      purchases: purchases.map(p => ({
        ...p,
        isExpired: p.expiresAt <= now,
        isActive: p.creditsRemaining > 0 && p.expiresAt > now,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/sessions/:id/rate
 * Rate a completed session
 */
router.post('/sessions/:id/rate', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      include: { tutorProfile: true },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Only the student can rate
    if (session.studentId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the student can rate this session',
      });
    }

    // Only completed sessions can be rated
    if (session.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Only completed sessions can be rated',
      });
    }

    // Check if already rated
    if (session.rating) {
      return res.status(400).json({
        success: false,
        message: 'Session has already been rated',
      });
    }

    // Update session with rating
    const updated = await req.prisma.tutorSession.update({
      where: { id },
      data: {
        rating: parseInt(rating),
        feedback: feedback || null,
        ratedAt: new Date(),
      },
    });

    // Recalculate tutor's average rating
    const stats = await req.prisma.tutorSession.aggregate({
      where: {
        tutorProfileId: session.tutorProfileId,
        rating: { not: null },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await req.prisma.tutorProfile.update({
      where: { id: session.tutorProfileId },
      data: {
        avgRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0,
      },
    });

    res.json({
      success: true,
      session: updated,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// LIVEKIT VIDEO SESSION ENDPOINTS
// ============================================

/**
 * POST /api/tutors/sessions/:id/join
 * Join a session - creates LiveKit room and returns access token
 */
router.post('/sessions/:id/join', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      include: {
        tutorProfile: {
          include: { user: true },
        },
        student: true,
        course: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is tutor or student of this session
    const isTutor = session.tutorProfile?.userId === userId;
    const isStudent = session.studentId === userId;

    if (!isTutor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to join this session',
      });
    }

    // Check session status
    if (session.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This session has been cancelled',
      });
    }

    if (session.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'This session has already ended',
      });
    }

    // Check if it's time to join (allow 10 minutes early)
    const now = new Date();
    const sessionStart = new Date(session.scheduledAt);
    const earlyJoinWindow = 10 * 60 * 1000; // 10 minutes

    if (now < new Date(sessionStart.getTime() - earlyJoinWindow)) {
      return res.status(400).json({
        success: false,
        message: 'Session has not started yet. You can join 10 minutes before the scheduled time.',
      });
    }

    // Create or get the room
    let roomName = session.livekitRoomName;
    let roomSid = session.livekitRoomSid;

    if (!roomName) {
      // Create new room
      const roomResult = await livekitService.createRoom({
        sessionId: id,
        tutorName: session.tutorProfile?.user?.name || 'Tutor',
        studentName: session.student?.name || 'Student',
        topic: session.topic,
      });

      roomName = roomResult.roomName;
      roomSid = roomResult.roomSid;

      // Update session with room info
      await req.prisma.tutorSession.update({
        where: { id },
        data: {
          livekitRoomName: roomName,
          livekitRoomSid: roomSid,
          status: 'IN_PROGRESS',
          startedAt: session.startedAt || new Date(),
        },
      });

      // Start recording if tutor is joining first
      if (isTutor && livekitService.LIVEKIT_ENABLED) {
        await recordingPipeline.initializeRecording(id).catch(err => {
          console.error('Failed to start recording:', err.message);
        });
      }
    }

    // Generate access token
    const user = isTutor ? session.tutorProfile.user : session.student;
    const token = livekitService.createAccessToken({
      roomName,
      participantId: userId,
      participantName: user?.name || (isTutor ? 'Tutor' : 'Student'),
      isTutor,
    });

    // Get recording status
    const updatedSession = await req.prisma.tutorSession.findUnique({
      where: { id },
      select: { recordingStatus: true },
    });

    res.json({
      success: true,
      token,
      roomName,
      wsUrl: livekitService.LIVEKIT_URL,
      isRecording: updatedSession?.recordingStatus === 'recording',
      session: {
        id: session.id,
        topic: session.topic,
        duration: session.duration,
        tutor: {
          id: session.tutorProfile?.user?.id,
          name: session.tutorProfile?.user?.name,
        },
        student: {
          id: session.student?.id,
          name: session.student?.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/sessions/:id/leave
 * Leave a session - stops recording if tutor leaves
 */
router.post('/sessions/:id/leave', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { endSession } = req.body;
    const userId = req.user.id;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      include: {
        tutorProfile: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const isTutor = session.tutorProfile?.userId === userId;

    // If tutor leaves or explicitly ends session, complete it
    if (isTutor && endSession) {
      // Stop recording
      if (session.recordingEgressId) {
        await recordingPipeline.stopSessionRecording(id).catch(err => {
          console.error('Failed to stop recording:', err.message);
        });
      }

      // Close the LiveKit room
      if (session.livekitRoomName) {
        await livekitService.closeRoom(session.livekitRoomName).catch(err => {
          console.error('Failed to close room:', err.message);
        });
      }

      // Update session status
      await req.prisma.tutorSession.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
        },
      });

      return res.json({
        success: true,
        message: 'Session ended successfully',
      });
    }

    // Non-ending leave
    res.json({
      success: true,
      message: 'Left session',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/sessions/:id/recording
 * Get recording details for a session
 */
router.get('/sessions/:id/recording', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      include: {
        tutorProfile: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check authorization (tutor, student, or admin)
    const isTutor = session.tutorProfile?.userId === userId;
    const isStudent = session.studentId === userId;
    const isAdmin = req.user.role === 'TABSERA_ADMIN';

    if (!isTutor && !isStudent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this recording',
      });
    }

    // Check if recording exists
    if (!session.vimeoVideoId && session.recordingStatus !== 'completed') {
      return res.json({
        success: true,
        recording: null,
        status: session.recordingStatus || 'not_available',
        message: 'No recording available for this session',
      });
    }

    // Get recording details
    const recording = await recordingPipeline.getRecordingDetails(id);

    res.json({
      success: true,
      recording,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/sessions/:id/whiteboard
 * Save whiteboard snapshot
 */
router.post('/sessions/:id/whiteboard', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { snapshot } = req.body;
    const userId = req.user.id;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      include: { tutorProfile: true },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Only tutor or student can save whiteboard
    const isTutor = session.tutorProfile?.userId === userId;
    const isStudent = session.studentId === userId;

    if (!isTutor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await req.prisma.tutorSession.update({
      where: { id },
      data: { whiteboardSnapshot: snapshot },
    });

    res.json({
      success: true,
      message: 'Whiteboard saved',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/sessions/:id/whiteboard
 * Get whiteboard snapshot for resuming
 */
router.get('/sessions/:id/whiteboard', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      select: {
        whiteboardSnapshot: true,
        tutorProfile: { select: { userId: true } },
        studentId: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check authorization
    const isTutor = session.tutorProfile?.userId === userId;
    const isStudent = session.studentId === userId;

    if (!isTutor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
      snapshot: session.whiteboardSnapshot,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/student/sessions
 * Get student's tutoring sessions
 */
router.get('/student/sessions', authenticate, async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;
    const userId = req.user.id;

    const where = { studentId: userId };

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = { gte: new Date() };
      where.status = { in: ['SCHEDULED', 'IN_PROGRESS'] };
    }

    const sessions = await req.prisma.tutorSession.findMany({
      where,
      include: {
        tutorProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
