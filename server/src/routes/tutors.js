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
// SESSION TIMING CONSTANTS
// ============================================
const SESSION_DURATION = 10;  // minutes per session
const PREP_TIME = 10;         // minutes between sessions (for slot scheduling only)
const SLOT_INTERVAL = 20;     // total slot time (session + prep)
const MAX_SLOTS = 6;          // maximum consecutive slots (60 min total)

/**
 * Calculate total session duration for multiple slots
 * 1 slot = 10 min, 2 slots = 20 min, 4 slots = 40 min, 6 slots = 60 min
 */
function calculateTotalDuration(slotCount) {
  return slotCount * SESSION_DURATION;
}

/**
 * Get timezone offset in minutes for a given timezone and date
 * Returns positive for timezones ahead of UTC (e.g., +180 for UTC+3)
 */
function getTimezoneOffset(timezone, date) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate - utcDate) / 60000; // Convert ms to minutes
}

// ============================================
// TUTOR REGISTRATION & PROFILE
// ============================================

/**
 * POST /api/tutors/register
 * Register as a tutor (requires authenticated student)
 *
 * Request body:
 * - bio: (optional) tutor bio
 * - headline: (optional) short headline
 * - timezone: (optional) tutor timezone
 * - courses: (optional) array of course IDs
 * - tutorType: 'FULLTIME' or 'FREELANCE' (default: 'FULLTIME')
 * - hourlyRate: (required for FREELANCE) desired hourly rate in USD
 */
router.post('/register', authenticate, async (req, res, next) => {
  try {
    const { bio, headline, timezone, courses, tutorType = 'FULLTIME', hourlyRate } = req.body;
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

    // Validate tutor type
    if (!['FULLTIME', 'FREELANCE'].includes(tutorType)) {
      return res.status(400).json({
        success: false,
        message: 'tutorType must be FULLTIME or FREELANCE',
      });
    }

    // For freelance tutors, validate and calculate credit factor
    let creditFactor = 1;
    let validatedHourlyRate = null;

    if (tutorType === 'FREELANCE') {
      if (!hourlyRate || hourlyRate <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Hourly rate is required for freelance tutors',
        });
      }

      // Get system settings for validation
      const settings = await req.prisma.systemSettings.findMany({
        where: { key: { in: ['baseCreditPrice', 'minHourlyRate', 'maxHourlyRate'] } },
      });

      const settingsMap = {};
      settings.forEach(s => { settingsMap[s.key] = parseFloat(s.value); });

      const minRate = settingsMap.minHourlyRate || 3;
      const maxRate = settingsMap.maxHourlyRate || 100;
      const baseCreditPrice = settingsMap.baseCreditPrice || 1;
      const sessionsPerHour = 3;
      const baseHourlyRate = baseCreditPrice * sessionsPerHour;

      if (hourlyRate < minRate || hourlyRate > maxRate) {
        return res.status(400).json({
          success: false,
          message: `Hourly rate must be between $${minRate} and $${maxRate}`,
        });
      }

      // Validate that hourly rate is an exact multiple of base hourly rate
      const parsedRate = parseFloat(hourlyRate);
      if (parsedRate % baseHourlyRate !== 0) {
        // Calculate the nearest valid rates
        const lowerRate = Math.floor(parsedRate / baseHourlyRate) * baseHourlyRate;
        const upperRate = Math.ceil(parsedRate / baseHourlyRate) * baseHourlyRate;

        // Generate a few valid rate examples
        const validRates = [];
        for (let i = 1; i <= 5; i++) {
          const rate = baseHourlyRate * i;
          if (rate >= minRate && rate <= maxRate) {
            validRates.push(`$${rate}`);
          }
        }

        return res.status(400).json({
          success: false,
          message: `Hourly rate must be a multiple of $${baseHourlyRate} (the base hourly rate). ` +
                   `Valid rates near $${parsedRate}: $${lowerRate} or $${upperRate}. ` +
                   `Examples: ${validRates.join(', ')}, etc.`,
          suggestedRates: { lower: lowerRate, upper: upperRate },
          baseHourlyRate,
        });
      }

      validatedHourlyRate = parsedRate;
      creditFactor = validatedHourlyRate / baseHourlyRate;
    }

    // Create tutor profile
    const tutorProfile = await req.prisma.tutorProfile.create({
      data: {
        userId,
        bio: bio || null,
        headline: headline || null,
        timezone: timezone || 'UTC',
        status: 'PENDING',
        tutorType,
        hourlyRate: validatedHourlyRate,
        creditFactor,
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
        emailVerified: true,
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
            country: true,
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
    const { bio, headline, timezone, tutorType, hourlyRate } = req.body;

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    // Prepare update data
    const updateData = {
      bio: bio !== undefined ? bio : profile.bio,
      headline: headline !== undefined ? headline : profile.headline,
      timezone: timezone !== undefined ? timezone : profile.timezone,
    };

    // Handle tutor type change
    if (tutorType !== undefined) {
      if (!['FULLTIME', 'FREELANCE'].includes(tutorType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tutor type. Must be FULLTIME or FREELANCE.',
        });
      }
      updateData.tutorType = tutorType;

      // If changing to FULLTIME, reset hourly rate and credit factor
      if (tutorType === 'FULLTIME') {
        updateData.hourlyRate = null;
        updateData.creditFactor = 1;
      }
    }

    // Handle hourly rate change for freelance tutors
    const effectiveTutorType = tutorType !== undefined ? tutorType : profile.tutorType;
    if (effectiveTutorType === 'FREELANCE' && hourlyRate !== undefined) {
      // Get system settings for validation
      const settings = await req.prisma.systemSettings.findMany({
        where: { key: { in: ['baseCreditPrice', 'minHourlyRate', 'maxHourlyRate'] } },
      });

      const settingsMap = {};
      settings.forEach(s => { settingsMap[s.key] = parseFloat(s.value); });

      const minRate = settingsMap.minHourlyRate || 3;
      const maxRate = settingsMap.maxHourlyRate || 100;
      const baseCreditPrice = settingsMap.baseCreditPrice || 1;
      const sessionsPerHour = 3;
      const baseHourlyRate = baseCreditPrice * sessionsPerHour;

      const parsedRate = parseFloat(hourlyRate);

      if (isNaN(parsedRate) || parsedRate < minRate || parsedRate > maxRate) {
        return res.status(400).json({
          success: false,
          message: `Hourly rate must be between $${minRate} and $${maxRate}`,
        });
      }

      // Validate that hourly rate is an exact multiple of base hourly rate
      if (parsedRate % baseHourlyRate !== 0) {
        const lowerRate = Math.floor(parsedRate / baseHourlyRate) * baseHourlyRate;
        const upperRate = Math.ceil(parsedRate / baseHourlyRate) * baseHourlyRate;

        return res.status(400).json({
          success: false,
          message: `Hourly rate must be a multiple of $${baseHourlyRate}. Valid rates near $${parsedRate}: $${lowerRate} or $${upperRate}.`,
          suggestedRates: { lower: lowerRate, upper: upperRate },
          baseHourlyRate,
        });
      }

      updateData.hourlyRate = parsedRate;
      updateData.creditFactor = parsedRate / baseHourlyRate;
    }

    const updated = await req.prisma.tutorProfile.update({
      where: { id: profile.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            country: true,
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

    // Validate slots - ensure endTime is after startTime
    const validatedSlots = slots.filter(slot => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (endMinutes <= startMinutes) {
        console.warn(`Invalid availability slot: ${slot.startTime} to ${slot.endTime} - endTime must be after startTime`);
        return false;
      }
      return true;
    });

    // Delete existing slots
    await req.prisma.tutorAvailability.deleteMany({
      where: { tutorProfileId: profile.id },
    });

    // Create new slots
    if (validatedSlots.length > 0) {
      await req.prisma.tutorAvailability.createMany({
        data: validatedSlots.map(slot => ({
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
// UNAVAILABILITY (temporary time-off)
// ============================================

/**
 * GET /api/tutors/unavailability
 * Get tutor's current and upcoming unavailability periods
 */
router.get('/unavailability', authenticate, async (req, res, next) => {
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

    const now = new Date();

    // Get current active unavailability (now is between start and end)
    const current = await req.prisma.tutorUnavailability.findFirst({
      where: {
        tutorProfileId: profile.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Get upcoming unavailability periods (starts in the future)
    const upcoming = await req.prisma.tutorUnavailability.findMany({
      where: {
        tutorProfileId: profile.id,
        isActive: true,
        startDate: { gt: now },
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({
      success: true,
      current,
      upcoming,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/unavailability
 * Set a new unavailability period (auto-cancels affected sessions)
 */
router.post('/unavailability', authenticate, async (req, res, next) => {
  try {
    const { preset, startDate, endDate, reason } = req.body;

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    // Calculate dates based on preset or use provided dates
    let start, end;
    const now = new Date();

    if (preset) {
      switch (preset) {
        case 'today':
          start = now;
          end = new Date(now);
          end.setHours(23, 59, 59, 999);
          break;
        case 'tomorrow':
          start = new Date(now);
          start.setDate(start.getDate() + 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setHours(23, 59, 59, 999);
          break;
        case 'this_week':
          start = now;
          end = new Date(now);
          // Set to end of week (Saturday)
          const daysUntilSaturday = 6 - now.getDay();
          end.setDate(end.getDate() + daysUntilSaturday);
          end.setHours(23, 59, 59, 999);
          break;
        case 'this_month':
          start = now;
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid preset value',
          });
      }
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either preset or startDate/endDate is required',
      });
    }

    // Create unavailability record
    const unavailability = await req.prisma.tutorUnavailability.create({
      data: {
        tutorProfileId: profile.id,
        startDate: start,
        endDate: end,
        reason: reason || 'personal',
        isActive: true,
      },
    });

    // Find and cancel affected sessions
    const affectedSessions = await req.prisma.tutorSession.findMany({
      where: {
        tutorProfileId: profile.id,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    const cancelledSessions = [];

    // Cancel each session and refund credits
    for (const session of affectedSessions) {
      // Update session status
      await req.prisma.tutorSession.update({
        where: { id: session.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'Tutor unavailable',
          cancelledAt: new Date(),
        },
      });

      // Refund credits if applicable
      if (session.creditsConsumed > 0 && session.purchaseId) {
        await req.prisma.tuitionPackPurchase.update({
          where: { id: session.purchaseId },
          data: {
            creditsRemaining: { increment: session.creditsConsumed },
            creditsReserved: { decrement: session.creditsConsumed },
          },
        });
      }

      cancelledSessions.push({
        id: session.id,
        studentName: `${session.student.firstName} ${session.student.lastName}`,
        studentEmail: session.student.email,
        scheduledAt: session.scheduledAt,
        creditsRefunded: session.creditsConsumed,
      });

      // TODO: Send cancellation email to student
    }

    res.json({
      success: true,
      unavailability,
      cancelledSessions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tutors/unavailability/:id
 * Cancel/end an unavailability period (resume availability)
 */
router.delete('/unavailability/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    // Find the unavailability record
    const unavailability = await req.prisma.tutorUnavailability.findFirst({
      where: {
        id,
        tutorProfileId: profile.id,
      },
    });

    if (!unavailability) {
      return res.status(404).json({
        success: false,
        message: 'Unavailability period not found',
      });
    }

    // Soft delete by setting isActive to false
    await req.prisma.tutorUnavailability.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Availability resumed',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/sessions/affected
 * Get sessions that would be affected by a date range (preview before setting unavailable)
 */
router.get('/sessions/affected', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const sessions = await req.prisma.tutorSession.findMany({
      where: {
        tutorProfileId: profile.id,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        studentName: `${s.student.firstName} ${s.student.lastName}`,
        scheduledAt: s.scheduledAt,
        creditsConsumed: s.creditsConsumed,
      })),
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

    // Sort completed sessions descending (latest first), others ascending (earliest first)
    const sortOrder = status === 'COMPLETED' ? 'desc' : 'asc';

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
      orderBy: { scheduledAt: sortOrder },
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

        // Stop recording and close LiveKit room to avoid unnecessary billing
        if (session.recordingEgressId) {
          await livekitService.stopRecording(session.recordingEgressId).catch(err => {
            console.error('Failed to stop recording:', err.message);
          });
          updateData.recordingStatus = 'processing';
        }
        if (session.livekitRoomName) {
          await livekitService.closeRoom(session.livekitRoomName).catch(err => {
            console.error('Failed to close LiveKit room:', err.message);
          });
        }

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

    // Transform tutors to include sessionsCompleted and flatten courses
    const transformedTutors = tutors.map(tutor => ({
      ...tutor,
      sessionsCompleted: tutor._count?.sessions || 0,
      // Flatten courses array: [{ course: { id, title } }] -> [{ id, title }]
      courses: tutor.courses?.map(tc => tc.course) || [],
    }));

    res.json({
      success: true,
      tutors: transformedTutors,
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

    // Check if tutor is unavailable on this date
    const unavailability = await req.prisma.tutorUnavailability.findFirst({
      where: {
        tutorProfileId: id,
        isActive: true,
        startDate: { lte: requestedDate },
        endDate: { gte: requestedDate },
      },
    });

    if (unavailability) {
      return res.json({
        success: true,
        slots: [],
        blocked: true,
        blockedUntil: unavailability.endDate,
        blockedReason: unavailability.reason,
        message: 'Tutor is temporarily unavailable',
      });
    }

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

    // Generate available slots at 20-minute intervals (for 10-min sessions + 10-min prep)
    // Slots start at :00, :20, and :40
    // Convert tutor's local availability times to UTC
    const tutorTz = tutor.timezone || 'UTC';
    const slots = [];

    for (const availability of dayAvailability) {
      const [startHour, startMin] = availability.startTime.split(':').map(Number);
      const [endHour, endMin] = availability.endTime.split(':').map(Number);

      // Create date string in tutor's timezone and convert to UTC
      // Format: "2025-12-31T08:00:00" in tutor's timezone
      const startDateStr = `${date}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`;
      const endDateStr = `${date}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`;

      // Parse as tutor's local time and get UTC equivalent
      let current = new Date(new Date(startDateStr).toLocaleString('en-US', { timeZone: tutorTz }));
      const end = new Date(new Date(endDateStr).toLocaleString('en-US', { timeZone: tutorTz }));

      // Calculate timezone offset to convert tutor's local time to UTC
      const tutorOffset = getTimezoneOffset(tutorTz, new Date(date));
      current = new Date(startDateStr);
      current = new Date(current.getTime() - tutorOffset * 60 * 1000);
      const endUtc = new Date(new Date(endDateStr).getTime() - tutorOffset * 60 * 1000);

      // Round start time to nearest :00, :20, or :40
      const currentMinutes = current.getMinutes();
      if (currentMinutes !== 0 && currentMinutes !== 20 && currentMinutes !== 40) {
        // Round up to next valid slot time
        const nextSlot = currentMinutes < 20 ? 20 : currentMinutes < 40 ? 40 : 60;
        current.setMinutes(nextSlot === 60 ? 0 : nextSlot, 0, 0);
        if (nextSlot === 60) current.setHours(current.getHours() + 1);
      }

      while (current < endUtc) {
        const slotTime = new Date(current);
        const slotEnd = new Date(current.getTime() + SLOT_INTERVAL * 60 * 1000);

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

        current = new Date(current.getTime() + SLOT_INTERVAL * 60 * 1000);
      }
    }

    res.json({
      success: true,
      slots,
      tutorTimezone: tutorTz,
      studentTimezone: studentTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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
 *
 * Request body:
 * - scheduledAt: ISO date string for session start
 * - courseId: (optional) course being tutored
 * - topic: (optional) session topic
 * - slotCount: (optional, default 1) number of consecutive slots (1, 2, 4, or 6)
 *   - 1 slot = 10 min session
 *   - 2 slots = 20 min session
 *   - 4 slots = 40 min session
 *   - 6 slots = 60 min session
 */
router.post('/:id/book', authenticate, async (req, res, next) => {
  try {
    const { id: tutorProfileId } = req.params;
    const { scheduledAt, courseId, topic, slotCount = 1 } = req.body;
    const studentId = req.user.id;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time is required',
      });
    }

    // Validate slotCount - only 1, 2, 4, or 6 allowed
    const slots = parseInt(slotCount);
    const validSlotCounts = [1, 2, 4, 6];
    if (isNaN(slots) || !validSlotCounts.includes(slots)) {
      return res.status(400).json({
        success: false,
        message: 'slotCount must be 1, 2, 4, or 6',
      });
    }

    // Get tutor profile with creditFactor
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

    // Calculate credit requirements
    // Total credits = slotCount * tutor.creditFactor * course.creditsFactor
    let courseCreditsFactor = 1;
    if (courseId) {
      const course = await req.prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        courseCreditsFactor = course.creditsFactor || 1;
      }
    }

    const tutorCreditFactor = tutor.creditFactor || 1;
    const creditsPerSlot = tutorCreditFactor * courseCreditsFactor;
    const totalCreditsRequired = slots * creditsPerSlot;

    // Find valid tuition pack purchases with enough total credits
    const now = new Date();

    // Get all valid purchases ordered by expiry (FIFO)
    const purchases = await req.prisma.tuitionPackPurchase.findMany({
      where: {
        userId: studentId,
        creditsRemaining: { gt: 0 },
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'asc' },
    });

    // Calculate total available credits
    const totalAvailable = purchases.reduce((sum, p) => sum + p.creditsRemaining, 0);

    if (totalAvailable < totalCreditsRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. This session requires ${totalCreditsRequired} credit(s).`,
        creditsRequired: totalCreditsRequired,
        creditsAvailable: totalAvailable,
        breakdown: {
          slotCount: slots,
          tutorCreditFactor,
          courseCreditsFactor,
          creditsPerSlot,
        },
      });
    }

    // Check if all consecutive slots are available
    const scheduledTime = new Date(scheduledAt);
    const totalDuration = calculateTotalDuration(slots);
    const sessionEnd = new Date(scheduledTime.getTime() + totalDuration * 60 * 1000);

    // Check each 20-min slot for conflicts
    for (let i = 0; i < slots; i++) {
      const slotStart = new Date(scheduledTime.getTime() + (i * SLOT_INTERVAL * 60 * 1000));
      const slotEnd = new Date(slotStart.getTime() + SLOT_INTERVAL * 60 * 1000);

      const conflictingSession = await req.prisma.tutorSession.findFirst({
        where: {
          tutorProfileId,
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          OR: [
            // Existing session starts during this slot
            {
              scheduledAt: {
                gte: slotStart,
                lt: slotEnd,
              },
            },
            // Existing session ends during this slot
            {
              AND: [
                { scheduledAt: { lt: slotStart } },
                // Check if session extends into this slot
              ],
            },
          ],
        },
      });

      if (conflictingSession) {
        // Double-check with duration
        const existingEnd = new Date(
          conflictingSession.scheduledAt.getTime() + conflictingSession.duration * 60 * 1000
        );
        if (slotStart < existingEnd && slotEnd > conflictingSession.scheduledAt) {
          return res.status(400).json({
            success: false,
            message: `Time slot ${i + 1} is no longer available`,
            conflictAt: slotStart.toISOString(),
          });
        }
      }
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

    // Reserve credits from purchases (FIFO) and create session
    const session = await req.prisma.$transaction(async (prisma) => {
      let creditsToDeduct = totalCreditsRequired;
      const purchaseUpdates = [];

      // Deduct credits from purchases in FIFO order
      for (const purchase of purchases) {
        if (creditsToDeduct <= 0) break;

        const deductFromThis = Math.min(purchase.creditsRemaining, creditsToDeduct);
        purchaseUpdates.push({
          purchaseId: purchase.id,
          amount: deductFromThis,
        });
        creditsToDeduct -= deductFromThis;
      }

      // Apply all purchase updates
      for (const update of purchaseUpdates) {
        await prisma.tuitionPackPurchase.update({
          where: { id: update.purchaseId },
          data: {
            creditsRemaining: { decrement: update.amount },
            creditsReserved: { increment: update.amount },
          },
        });
      }

      // Create session with total duration
      const newSession = await prisma.tutorSession.create({
        data: {
          tutorProfileId,
          studentId,
          purchaseId: purchases[0].id, // Primary purchase for tracking
          courseId,
          scheduledAt: scheduledTime,
          duration: totalDuration,
          status: 'SCHEDULED',
          topic,
          creditsConsumed: totalCreditsRequired,
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
        duration: totalDuration,
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
      creditsDeducted: totalCreditsRequired,
      sessionDuration: totalDuration,
      slotCount: slots,
      breakdown: {
        tutorCreditFactor,
        courseCreditsFactor,
        creditsPerSlot,
      },
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
    }

    // Start recording when tutor joins (if not already recording)
    if (isTutor && livekitService.LIVEKIT_ENABLED && !session.recordingEgressId) {
      console.log(`Starting recording for session ${id}`);
      await recordingPipeline.initializeRecording(id).catch(err => {
        console.error('Failed to start recording:', err.message);
      });
    }

    // Generate access token
    const user = isTutor ? session.tutorProfile.user : session.student;
    const token = await livekitService.createAccessToken({
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

      // Move credits from reserved to used
      if (session.purchaseId && session.creditsConsumed > 0) {
        await req.prisma.tuitionPackPurchase.update({
          where: { id: session.purchaseId },
          data: {
            creditsUsed: { increment: session.creditsConsumed },
            creditsReserved: { decrement: session.creditsConsumed },
          },
        });
        console.log(`Moved ${session.creditsConsumed} credits from reserved to used for session ${id}`);
      }

      // Increment tutor's total sessions count
      await req.prisma.tutorProfile.update({
        where: { id: session.tutorProfileId },
        data: { totalSessions: { increment: 1 } },
      });

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
 * POST /api/tutors/sessions/:id/recording/check
 * Check and update recording status from Vimeo
 * This is called by frontend when a session shows "Processing" to check if ready
 */
router.post('/sessions/:id/recording/check', authenticate, async (req, res, next) => {
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
        message: 'You are not authorized to check this recording',
      });
    }

    // Calculate session end time (use endedAt if available, otherwise scheduledAt + duration)
    const sessionEndTime = session.endedAt
      ? new Date(session.endedAt).getTime()
      : new Date(session.scheduledAt).getTime() + (session.duration || 20) * 60 * 1000;
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const isExpired = sessionEndTime < oneHourAgo;

    // If no vimeoVideoId and 1 hour has passed, mark as not available
    if (!session.vimeoVideoId) {
      if (isExpired && session.recordingStatus !== 'not_available') {
        await req.prisma.tutorSession.update({
          where: { id },
          data: { recordingStatus: 'not_available' },
        });
      }
      return res.json({
        success: true,
        status: isExpired ? 'not_available' : (session.recordingStatus || 'processing'),
        vimeoVideoUrl: null,
        message: isExpired ? 'Recording not available' : 'No Vimeo video ID found',
      });
    }

    // If we already have the URL, just return it
    if (session.vimeoVideoUrl) {
      return res.json({
        success: true,
        status: 'available',
        vimeoVideoUrl: session.vimeoVideoUrl,
      });
    }

    // Check Vimeo status and try to get embed URL
    const vimeoService = require('../services/vimeo');

    try {
      const videoStatus = await vimeoService.getVideoStatus(session.vimeoVideoId);

      if (videoStatus.status === 'available') {
        // Video is ready, get embed URL
        const embedUrl = await vimeoService.getEmbedUrl(session.vimeoVideoId);

        if (embedUrl) {
          // Update database
          await req.prisma.tutorSession.update({
            where: { id },
            data: { vimeoVideoUrl: embedUrl },
          });

          return res.json({
            success: true,
            status: 'available',
            vimeoVideoUrl: embedUrl,
          });
        }
      }

      // Check if 1 hour has passed - mark as not available
      if (isExpired) {
        await req.prisma.tutorSession.update({
          where: { id },
          data: { recordingStatus: 'not_available' },
        });
        return res.json({
          success: true,
          status: 'not_available',
          vimeoVideoUrl: null,
          message: 'Recording not available - processing timeout',
        });
      }

      // Still processing
      return res.json({
        success: true,
        status: videoStatus.status || 'processing',
        vimeoVideoUrl: null,
        message: 'Video is still being processed by Vimeo',
      });
    } catch (vimeoError) {
      console.error('Vimeo check failed:', vimeoError.message);

      // If 1 hour has passed and we can't check Vimeo, mark as not available
      if (isExpired) {
        await req.prisma.tutorSession.update({
          where: { id },
          data: { recordingStatus: 'not_available' },
        });
        return res.json({
          success: true,
          status: 'not_available',
          vimeoVideoUrl: null,
          message: 'Recording not available',
        });
      }

      return res.json({
        success: true,
        status: 'error',
        vimeoVideoUrl: null,
        message: 'Failed to check video status',
      });
    }
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
 * GET /api/tutors/sessions/:id/whiteboard/public
 * Public endpoint for LiveKit egress to read whiteboard state
 * No authentication required - only for active sessions during recording
 */
router.get('/sessions/:id/whiteboard/public', async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await req.prisma.tutorSession.findUnique({
      where: { id },
      select: {
        whiteboardSnapshot: true,
        status: true,
        recordingStatus: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Only allow access for sessions that are currently active or being recorded
    const isActive = session.status === 'in_progress' || session.status === 'scheduled';
    const isRecording = session.recordingStatus === 'recording';

    if (!isActive && !isRecording) {
      return res.status(403).json({
        success: false,
        message: 'Session is not active',
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
 * POST /api/tutors/sessions/:id/whiteboard/images
 * Upload an image for the whiteboard
 * Returns a URL that can be used in Excalidraw
 */
router.post('/sessions/:id/whiteboard/images', authenticate, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
        });
      }
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    try {
      const sessionId = req.params.id;
      const userId = req.user.id;

      // Verify session exists and user is participant
      const session = await req.prisma.tutorSession.findUnique({
        where: { id: sessionId },
        include: {
          tutorProfile: { select: { userId: true } },
        },
      });

      if (!session) {
        deleteFile(getFileUrl('whiteboard-images', req.file.filename));
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      // Check if user is tutor or student
      const isTutor = session.tutorProfile?.userId === userId;
      const isStudent = session.studentId === userId;

      if (!isTutor && !isStudent) {
        deleteFile(getFileUrl('whiteboard-images', req.file.filename));
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      // Generate the public URL
      const imageUrl = getFileUrl('whiteboard-images', req.file.filename);
      const fullUrl = `${process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:8000'}${imageUrl}`;

      res.json({
        success: true,
        url: fullUrl,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });
    } catch (error) {
      deleteFile(getFileUrl('whiteboard-images', req.file.filename));
      next(error);
    }
  });
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

    // Sort completed sessions descending (latest first), others ascending (earliest first)
    const sortOrder = status === 'COMPLETED' ? 'desc' : 'asc';

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
      orderBy: { scheduledAt: sortOrder },
    });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// RECURRING SESSION CONTRACTS
// ============================================

/**
 * POST /api/tutors/:id/recurring-contract
 * Create a recurring session contract request
 */
router.post('/:id/recurring-contract', authenticate, async (req, res, next) => {
  try {
    const { id: tutorProfileId } = req.params;
    const {
      startDate,
      endDate,
      daysOfWeek,
      timeSlot,
      slotCount = 1,
      courseId,
      topic,
    } = req.body;
    const studentId = req.user.id;

    // Validate required fields
    if (!startDate || !endDate || !daysOfWeek || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'startDate, endDate, daysOfWeek, and timeSlot are required',
      });
    }

    // Validate daysOfWeek array (0-6, where 0 is Sunday)
    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'daysOfWeek must be a non-empty array of day numbers (0-6)',
      });
    }

    // Validate slotCount - only 1, 2, 4, or 6 allowed
    const slots = parseInt(slotCount);
    const validSlotCounts = [1, 2, 4, 6];
    if (isNaN(slots) || !validSlotCounts.includes(slots)) {
      return res.status(400).json({
        success: false,
        message: 'slotCount must be 1, 2, 4, or 6',
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

    // Can't contract yourself
    if (tutor.userId === studentId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a contract with yourself',
      });
    }

    // Calculate total sessions in date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'endDate must be after startDate',
      });
    }

    // Count sessions by iterating through date range
    let sessionCount = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        sessionCount++;
      }
      current.setDate(current.getDate() + 1);
    }

    if (sessionCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No sessions found in the specified date range and days',
      });
    }

    // Calculate credits required
    let courseCreditsFactor = 1;
    if (courseId) {
      const course = await req.prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        courseCreditsFactor = course.creditsFactor || 1;
      }
    }

    const tutorCreditFactor = tutor.creditFactor || 1;
    const creditsPerSession = slots * tutorCreditFactor * courseCreditsFactor;
    const totalCredits = sessionCount * creditsPerSession;

    // Check if student has enough credits (but don't reserve yet)
    const now = new Date();
    const totalAvailable = await req.prisma.tuitionPackPurchase.aggregate({
      where: {
        userId: studentId,
        creditsRemaining: { gt: 0 },
        expiresAt: { gt: now },
      },
      _sum: { creditsRemaining: true },
    });

    const availableCredits = totalAvailable._sum.creditsRemaining || 0;

    // Create contract with PENDING status
    const contract = await req.prisma.recurringSessionContract.create({
      data: {
        studentId,
        tutorProfileId,
        courseId,
        startDate: start,
        endDate: end,
        daysOfWeek,
        timeSlot,
        slotCount: slots,
        topic,
        status: 'PENDING',
        totalCredits,
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tutorProfile: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        course: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({
      success: true,
      contract,
      summary: {
        totalSessions: sessionCount,
        totalCredits,
        creditsPerSession,
        availableCredits,
        sufficientCredits: availableCredits >= totalCredits,
      },
      message: 'Contract request created. Waiting for tutor approval.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/contracts
 * Get contracts for current tutor with optional status filter
 */
router.get('/contracts', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;

    const tutorProfile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    const where = {
      tutorProfileId: tutorProfile.id,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    const contracts = await req.prisma.recurringSessionContract.findMany({
      where,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        course: { select: { id: true, title: true } },
        sessions: {
          where: { status: 'SCHEDULED' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      contracts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/contracts/pending
 * Get pending contracts for current tutor
 */
router.get('/contracts/pending', authenticate, async (req, res, next) => {
  try {
    const tutorProfile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found',
      });
    }

    const contracts = await req.prisma.recurringSessionContract.findMany({
      where: {
        tutorProfileId: tutorProfile.id,
        status: 'PENDING',
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      contracts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/contracts/:id
 * Get contract details
 */
router.get('/contracts/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const contract = await req.prisma.recurringSessionContract.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tutorProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        course: { select: { id: true, title: true } },
        sessions: {
          orderBy: { scheduledAt: 'asc' },
          select: {
            id: true,
            scheduledAt: true,
            duration: true,
            status: true,
          },
        },
      },
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    // Check access
    const tutorProfile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    const isTutor = tutorProfile && tutorProfile.id === contract.tutorProfileId;
    const isStudent = req.user.id === contract.studentId;

    if (!isTutor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this contract',
      });
    }

    res.json({
      success: true,
      contract,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tutors/contracts/:id
 * Update a pending contract (student only, before tutor accepts)
 */
router.put('/contracts/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, daysOfWeek, timeSlot, slotCount, topic } = req.body;

    const contract = await req.prisma.recurringSessionContract.findUnique({
      where: { id },
      include: {
        tutorProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        course: { select: { id: true, title: true } },
      },
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    // Only the student who created the contract can update it
    if (req.user.id !== contract.studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contract',
      });
    }

    // Only pending contracts can be updated
    if (contract.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending contracts can be updated',
      });
    }

    // Validate slot count
    const validSlotCounts = [1, 2, 4, 6];
    if (slotCount && !validSlotCounts.includes(slotCount)) {
      return res.status(400).json({
        success: false,
        message: 'slotCount must be 1, 2, 4, or 6',
      });
    }

    // Calculate new total sessions and credits
    let totalSessions = 0;
    const start = new Date(startDate || contract.startDate);
    const end = new Date(endDate || contract.endDate);
    const days = daysOfWeek || contract.daysOfWeek;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (days.includes(d.getDay())) totalSessions++;
    }

    const slots = slotCount || contract.slotCount;
    const creditFactor = contract.tutorProfile.creditFactor || 1;
    const courseCreditFactor = contract.course?.creditsFactor || 1;
    const totalCredits = totalSessions * slots * creditFactor * courseCreditFactor;

    // Update contract
    const updatedContract = await req.prisma.recurringSessionContract.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        daysOfWeek: daysOfWeek || undefined,
        timeSlot: timeSlot || undefined,
        slotCount: slotCount || undefined,
        topic: topic !== undefined ? topic : undefined,
        totalCredits,
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tutorProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        course: { select: { id: true, title: true } },
      },
    });

    res.json({
      success: true,
      message: 'Contract updated successfully',
      contract: updatedContract,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/contracts/:id/respond
 * Tutor responds to contract (accept/reject)
 */
router.post('/contracts/:id/respond', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accept, reason } = req.body;

    const contract = await req.prisma.recurringSessionContract.findUnique({
      where: { id },
      include: {
        tutorProfile: true,
        course: true,
      },
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    // Verify tutor owns this contract
    const tutorProfile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutorProfile || tutorProfile.id !== contract.tutorProfileId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this contract',
      });
    }

    if (contract.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Contract has already been responded to',
      });
    }

    if (accept === false) {
      // Reject the contract
      const updatedContract = await req.prisma.recurringSessionContract.update({
        where: { id },
        data: {
          status: 'REJECTED',
          respondedAt: new Date(),
          rejectionReason: reason || null,
        },
      });

      return res.json({
        success: true,
        contract: updatedContract,
        message: 'Contract rejected',
      });
    }

    // Accept the contract - reserve credits and create sessions
    const now = new Date();

    // Get student's credit purchases (FIFO)
    const purchases = await req.prisma.tuitionPackPurchase.findMany({
      where: {
        userId: contract.studentId,
        creditsRemaining: { gt: 0 },
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'asc' },
    });

    const totalAvailable = purchases.reduce((sum, p) => sum + p.creditsRemaining, 0);

    if (totalAvailable < contract.totalCredits) {
      return res.status(400).json({
        success: false,
        message: 'Student no longer has sufficient credits for this contract',
        required: contract.totalCredits,
        available: totalAvailable,
      });
    }

    // Calculate session dates
    const sessionDates = [];
    const current = new Date(contract.startDate);
    const end = new Date(contract.endDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (contract.daysOfWeek.includes(dayOfWeek)) {
        // Create scheduled time from date and timeSlot
        const [hours, minutes] = contract.timeSlot.split(':').map(Number);
        const sessionTime = new Date(current);
        sessionTime.setHours(hours, minutes, 0, 0);
        sessionDates.push(new Date(sessionTime));
      }
      current.setDate(current.getDate() + 1);
    }

    const sessionDuration = calculateTotalDuration(contract.slotCount);
    const courseCreditsFactor = contract.course?.creditsFactor || 1;
    const tutorCreditFactor = contract.tutorProfile.creditFactor || 1;
    const creditsPerSession = contract.slotCount * tutorCreditFactor * courseCreditsFactor;

    // Create all sessions and reserve credits in a transaction
    const result = await req.prisma.$transaction(async (prisma) => {
      let creditsToReserve = contract.totalCredits;
      const purchaseUpdates = [];

      // Reserve credits from purchases (FIFO)
      for (const purchase of purchases) {
        if (creditsToReserve <= 0) break;
        const reserveFromThis = Math.min(purchase.creditsRemaining, creditsToReserve);
        purchaseUpdates.push({
          purchaseId: purchase.id,
          amount: reserveFromThis,
        });
        creditsToReserve -= reserveFromThis;
      }

      // Apply purchase updates
      for (const update of purchaseUpdates) {
        await prisma.tuitionPackPurchase.update({
          where: { id: update.purchaseId },
          data: {
            creditsRemaining: { decrement: update.amount },
            creditsReserved: { increment: update.amount },
          },
        });
      }

      // Create all sessions
      const sessions = [];
      for (const sessionDate of sessionDates) {
        const session = await prisma.tutorSession.create({
          data: {
            tutorProfileId: contract.tutorProfileId,
            studentId: contract.studentId,
            purchaseId: purchases[0].id,
            courseId: contract.courseId,
            contractId: contract.id,
            scheduledAt: sessionDate,
            duration: sessionDuration,
            status: 'SCHEDULED',
            topic: contract.topic,
            creditsConsumed: creditsPerSession,
          },
        });
        sessions.push(session);
      }

      // Update contract
      const updatedContract = await prisma.recurringSessionContract.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          reservedCredits: contract.totalCredits,
        },
      });

      return { contract: updatedContract, sessions };
    });

    res.json({
      success: true,
      contract: result.contract,
      sessionsCreated: result.sessions.length,
      message: `Contract accepted. ${result.sessions.length} sessions scheduled.`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors/contracts/:id/cancel
 * Cancel an entire contract (refund remaining sessions)
 */
router.post('/contracts/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const contract = await req.prisma.recurringSessionContract.findUnique({
      where: { id },
      include: {
        tutorProfile: true,
        sessions: {
          where: { status: 'SCHEDULED' },
        },
      },
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    // Check access
    const tutorProfile = await req.prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    const isTutor = tutorProfile && tutorProfile.id === contract.tutorProfileId;
    const isStudent = req.user.id === contract.studentId;

    if (!isTutor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this contract',
      });
    }

    if (!['PENDING', 'ACCEPTED'].includes(contract.status)) {
      return res.status(400).json({
        success: false,
        message: 'Contract cannot be cancelled in current status',
      });
    }

    // Cancel all scheduled sessions and refund credits
    const result = await req.prisma.$transaction(async (prisma) => {
      let totalRefunded = 0;

      for (const session of contract.sessions) {
        // Refund credits for this session
        if (session.purchaseId) {
          await prisma.tuitionPackPurchase.update({
            where: { id: session.purchaseId },
            data: {
              creditsReserved: { decrement: session.creditsConsumed },
              creditsRemaining: { increment: session.creditsConsumed },
            },
          });
          totalRefunded += session.creditsConsumed;
        }

        // Cancel the session
        await prisma.tutorSession.update({
          where: { id: session.id },
          data: { status: 'CANCELLED' },
        });
      }

      // Update contract
      const updatedContract = await prisma.recurringSessionContract.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: req.user.id,
          cancellationReason: reason || null,
          refundedCredits: { increment: totalRefunded },
        },
      });

      return { contract: updatedContract, refunded: totalRefunded, sessionsCancelled: contract.sessions.length };
    });

    res.json({
      success: true,
      contract: result.contract,
      sessionsCancelled: result.sessionsCancelled,
      creditsRefunded: result.refunded,
      message: 'Contract cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/student/contracts
 * Get student's contracts
 */
router.get('/student/contracts', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {
      studentId: req.user.id,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    const contracts = await req.prisma.recurringSessionContract.findMany({
      where,
      include: {
        tutorProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
        course: { select: { id: true, title: true } },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      contracts,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUBLIC SETTINGS (for tutor signup)
// ============================================

/**
 * GET /api/tutors/settings/pricing
 * Get public tutor pricing settings for signup form
 * No authentication required
 */
router.get('/settings/pricing', async (req, res, next) => {
  try {
    const settingKeys = [
      'baseCreditPrice',
      'freelanceCommissionPercent',
      'minHourlyRate',
      'maxHourlyRate',
    ];

    const settings = await req.prisma.systemSettings.findMany({
      where: { key: { in: settingKeys } },
    });

    // Convert to object with parsed values
    const result = {};
    settings.forEach(s => {
      result[s.key] = parseFloat(s.value);
    });

    // Add calculated values for UI
    const baseCreditPrice = result.baseCreditPrice || 1;
    const sessionsPerHour = 3; // 60 min / 20 min per session
    const baseHourlyRate = baseCreditPrice * sessionsPerHour;

    res.json({
      success: true,
      settings: {
        baseCreditPrice: result.baseCreditPrice || 1,
        commissionPercent: result.freelanceCommissionPercent || 40,
        minHourlyRate: result.minHourlyRate || 3,
        maxHourlyRate: result.maxHourlyRate || 100,
        baseHourlyRate,
        sessionsPerHour,
        sessionDuration: SESSION_DURATION,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Calculate credit factor from hourly rate
 * creditFactor = hourlyRate / (baseCreditPrice * sessionsPerHour)
 */
function calculateCreditFactor(hourlyRate, baseCreditPrice) {
  const sessionsPerHour = 3;
  const baseHourlyRate = baseCreditPrice * sessionsPerHour;
  return Math.ceil(hourlyRate / baseHourlyRate);
}

module.exports = router;
