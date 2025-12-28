/**
 * Fix Order Enrollment Script (Node.js 12+ compatible)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOrderEnrollment(referenceId) {
  console.log('Looking for order:', referenceId);

  const order = await prisma.order.findFirst({
    where: { referenceId: referenceId },
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
    console.log('ERROR: Order not found:', referenceId);
    return;
  }

  console.log('\n=== ORDER FOUND ===');
  console.log('Reference:', order.referenceId);
  console.log('Status:', order.status);
  console.log('Payment Status:', order.paymentStatus);
  console.log('User:', order.user ? order.user.email : 'N/A');
  console.log('Items:', order.items.length);

  // Check current enrollments
  var existingEnrollments = await prisma.enrollment.findMany({
    where: { userId: order.userId },
    include: { track: true, course: true }
  });

  console.log('\n=== EXISTING ENROLLMENTS ===');
  console.log('Count:', existingEnrollments.length);
  existingEnrollments.forEach(function(e) {
    var name = e.track ? (e.track.name || e.track.title) : (e.course ? (e.course.name || e.course.title) : 'Unknown');
    console.log(' -', name, '| Status:', e.status);
  });

  // Update order status
  if (order.status !== 'COMPLETED' || order.paymentStatus !== 'APPROVED') {
    console.log('\n=== UPDATING ORDER STATUS ===');
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'APPROVED',
      }
    });
    console.log('Order marked as COMPLETED');

    var payment = order.payments[0];
    if (payment && payment.status !== 'APPROVED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          paidAt: payment.paidAt || new Date(),
        }
      });
      console.log('Payment marked as APPROVED');
    }
  }

  console.log('\n=== CREATING ENROLLMENTS ===');

  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i];

    // Track enrollment
    if (item.trackId && item.track) {
      var trackName = item.track.name || item.track.title;
      var existingTrackEnrollment = existingEnrollments.find(function(e) {
        return e.trackId === item.trackId;
      });

      if (!existingTrackEnrollment) {
        console.log('Creating track enrollment:', trackName);
        try {
          await prisma.enrollment.create({
            data: {
              userId: order.userId,
              trackId: item.trackId,
              status: 'active',
            }
          });
          console.log('  ✓ Track enrollment created');
        } catch (err) {
          console.log('  ! Track enrollment may already exist:', err.message);
        }
      } else {
        console.log('Track enrollment already exists:', trackName);
      }

      // Enroll in each course of the track
      var courses = item.track.courses || [];
      for (var j = 0; j < courses.length; j++) {
        var course = courses[j];
        var courseName = course.name || course.title;
        var existingCourseEnrollment = existingEnrollments.find(function(e) {
          return e.courseId === course.id;
        });

        if (!existingCourseEnrollment) {
          console.log('Creating course enrollment:', courseName);
          try {
            await prisma.enrollment.create({
              data: {
                userId: order.userId,
                courseId: course.id,
                status: 'active',
                edxCourseId: course.edxCourseId,
              }
            });
            console.log('  ✓ Course enrollment created');
          } catch (err) {
            console.log('  ! Course enrollment may already exist:', err.message);
          }
        } else {
          console.log('Course enrollment already exists:', courseName);
        }
      }
    }

    // Single course enrollment
    if (item.courseId && item.course) {
      var singleCourseName = item.course.name || item.course.title;
      var existingSingleEnrollment = existingEnrollments.find(function(e) {
        return e.courseId === item.courseId;
      });

      if (!existingSingleEnrollment) {
        console.log('Creating course enrollment:', singleCourseName);
        try {
          await prisma.enrollment.create({
            data: {
              userId: order.userId,
              courseId: item.courseId,
              status: 'active',
              edxCourseId: item.course.edxCourseId,
            }
          });
          console.log('  ✓ Course enrollment created');
        } catch (err) {
          console.log('  ! Course enrollment may already exist:', err.message);
        }
      } else {
        console.log('Course enrollment already exists:', singleCourseName);
      }
    }
  }

  // Verify final enrollments
  var finalEnrollments = await prisma.enrollment.findMany({
    where: { userId: order.userId },
    include: { track: true, course: true }
  });

  console.log('\n=== FINAL ENROLLMENTS ===');
  console.log('Count:', finalEnrollments.length);
  finalEnrollments.forEach(function(e) {
    var name = e.track ? (e.track.name || e.track.title) : (e.course ? (e.course.name || e.course.title) : 'Unknown');
    console.log(' -', name, '| Status:', e.status);
  });

  console.log('\n✓ Done!');
}

var referenceId = process.argv[2];

if (!referenceId) {
  console.log('Usage: node scripts/fix-order-enrollment.js <orderReferenceId>');
  process.exit(1);
}

fixOrderEnrollment(referenceId)
  .catch(function(err) {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(function() {
    return prisma.$disconnect();
  });
