/**
 * Enrollments Routes
 */

const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const edxService = require('../services/edx');

const router = express.Router();

/**
 * GET /api/enrollments/check/:courseId
 * Check if current user is enrolled in a course
 */
router.get('/check/:courseId', optionalAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // If user is not authenticated, they're not enrolled
    if (!req.user) {
      return res.json({ enrolled: false });
    }

    // Check for direct course enrollment
    const courseEnrollment = await req.prisma.enrollment.findFirst({
      where: {
        userId: req.user.id,
        courseId: courseId,
        status: 'active',
      },
    });

    if (courseEnrollment) {
      return res.json({ enrolled: true, enrollmentId: courseEnrollment.id });
    }

    // Check if course is part of a learning pack the user is enrolled in
    const course = await req.prisma.course.findUnique({
      where: { id: courseId },
      select: { learningPackId: true },
    });

    if (course?.learningPackId) {
      const packEnrollment = await req.prisma.enrollment.findFirst({
        where: {
          userId: req.user.id,
          learningPackId: course.learningPackId,
          status: 'active',
        },
      });

      if (packEnrollment) {
        return res.json({ enrolled: true, enrollmentId: packEnrollment.id, enrolledViaTrack: true });
      }
    }

    return res.json({ enrolled: false });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/enrollments
 * Get user's enrollments
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status }),
    };

    const [enrollments, total] = await Promise.all([
      req.prisma.enrollment.findMany({
        where,
        include: {
          learningPack: {
            select: {
              id: true,
              title: true,
              slug: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              image: true,
              externalUrl: true,
            },
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
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/enrollments/my-learning
 * Get comprehensive learning data for the student dashboard with real edX progress
 */
router.get('/my-learning', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's edX username for fetching progress
    const user = await req.prisma.user.findUnique({
      where: { id: userId },
      select: { edxUsername: true, email: true },
    });

    const edxUsername = user?.edxUsername;

    // Get all enrollments with full details
    const allEnrollments = await req.prisma.enrollment.findMany({
      where: { userId },
      include: {
        learningPack: {
          include: {
            courses: {
              where: { isActive: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        course: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Collect all edX course IDs for batch progress fetch
    const allEdxCourseIds = [];
    allEnrollments.forEach(e => {
      if (e.learningPack?.courses) {
        e.learningPack.courses.forEach(c => {
          if (c.edxCourseId) allEdxCourseIds.push(c.edxCourseId);
        });
      }
      if (e.course?.edxCourseId) {
        allEdxCourseIds.push(e.course.edxCourseId);
      }
    });

    // Fetch progress from edX for all courses
    let edxProgressMap = {};
    if (edxUsername && allEdxCourseIds.length > 0) {
      try {
        const uniqueCourseIds = [...new Set(allEdxCourseIds)];
        edxProgressMap = await edxService.getCoursesProgress(edxUsername, uniqueCourseIds);
      } catch (err) {
        console.error('Failed to fetch edX progress:', err.message);
        // Continue without edX progress data
      }
    }

    // Separate learning pack enrollments and individual course enrollments
    const packEnrollments = allEnrollments.filter(e => e.learningPackId && e.learningPack);
    const courseOnlyEnrollments = allEnrollments.filter(e => e.courseId && !e.learningPackId && e.course);

    // Build enrolled tracks with their courses and progress
    const enrolledTracks = [];
    const processedPackIds = new Set();

    for (const enrollment of packEnrollments) {
      if (processedPackIds.has(enrollment.learningPackId)) continue;
      processedPackIds.add(enrollment.learningPackId);

      const pack = enrollment.learningPack;

      // Get course-level enrollments for this pack's courses
      const courseEnrollments = await req.prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: pack.courses.map(c => c.id) },
        },
      });

      // Map course enrollments by courseId
      const courseEnrollmentMap = {};
      courseEnrollments.forEach(ce => {
        courseEnrollmentMap[ce.courseId] = ce;
      });

      // Calculate pack progress with edX data
      const coursesWithProgress = pack.courses.map(course => {
        const courseEnrollment = courseEnrollmentMap[course.id];
        const edxProgress = course.edxCourseId ? edxProgressMap[course.edxCourseId] : null;

        // Use edX progress if available, otherwise use local progress
        const progress = edxProgress?.progress ?? courseEnrollment?.progress ?? 0;
        const hasPassingGrade = edxProgress?.hasPassingGrade || false;

        // Determine status based on progress
        let status = 'not_started';
        if (progress >= 100 || hasPassingGrade || courseEnrollment?.completedAt) {
          status = 'completed';
        } else if (progress > 0) {
          status = 'in_progress';
        }

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          image: course.image,
          duration: course.duration,
          lessons: course.lessons,
          externalUrl: course.externalUrl,
          edxCourseId: course.edxCourseId,
          progress,
          hasPassingGrade,
          completedLessons: courseEnrollment?.completedLessons || 0,
          status,
          startDate: courseEnrollment?.startDate,
          completedAt: courseEnrollment?.completedAt,
          edxEnrolled: courseEnrollment?.edxEnrolled || false,
          completionSummary: edxProgress?.completionSummary || null,
        };
      });

      const completedCourses = coursesWithProgress.filter(c => c.status === 'completed').length;
      const totalProgress = coursesWithProgress.length > 0
        ? Math.round(coursesWithProgress.reduce((sum, c) => sum + c.progress, 0) / coursesWithProgress.length)
        : 0;

      enrolledTracks.push({
        id: pack.id,
        title: pack.title,
        slug: pack.slug,
        description: pack.description,
        image: pack.image,
        duration: pack.duration,
        level: pack.level,
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.startDate,
        status: enrollment.status,
        progress: totalProgress,
        completedCourses,
        totalCourses: pack.courses.length,
        courses: coursesWithProgress,
      });
    }

    // Build individual courses list with edX progress
    const individualCourses = courseOnlyEnrollments.map(enrollment => {
      const edxProgress = enrollment.course.edxCourseId
        ? edxProgressMap[enrollment.course.edxCourseId]
        : null;

      const progress = edxProgress?.progress ?? enrollment.progress ?? 0;
      const hasPassingGrade = edxProgress?.hasPassingGrade || false;

      let status = 'not_started';
      if (progress >= 100 || hasPassingGrade || enrollment.completedAt) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in_progress';
      }

      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        description: enrollment.course.description,
        image: enrollment.course.image,
        duration: enrollment.course.duration,
        lessons: enrollment.course.lessons,
        externalUrl: enrollment.course.externalUrl,
        edxCourseId: enrollment.course.edxCourseId,
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.startDate,
        progress,
        hasPassingGrade,
        completedLessons: enrollment.completedLessons,
        status,
        completedAt: enrollment.completedAt,
        edxEnrolled: enrollment.edxEnrolled,
        completionSummary: edxProgress?.completionSummary || null,
      };
    });

    // Calculate stats
    const allCourses = [
      ...enrolledTracks.flatMap(t => t.courses),
      ...individualCourses,
    ];

    const stats = {
      totalTracks: enrolledTracks.length,
      totalCourses: allCourses.length,
      completedCourses: allCourses.filter(c => c.status === 'completed').length,
      inProgressCourses: allCourses.filter(c => c.status === 'in_progress').length,
      overallProgress: allCourses.length > 0
        ? Math.round(allCourses.reduce((sum, c) => sum + c.progress, 0) / allCourses.length)
        : 0,
    };

    res.json({
      success: true,
      tracks: enrolledTracks,
      courses: individualCourses,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/enrollments/:id
 * Get specific enrollment
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await req.prisma.enrollment.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        learningPack: true,
        course: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
