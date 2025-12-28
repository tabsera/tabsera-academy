/**
 * Fix User edX Registration and Enrollment Script
 * Registers user on edX platform and enrolls them in purchased courses
 */

const { PrismaClient } = require('@prisma/client');
const edxService = require('../src/services/edx');

const prisma = new PrismaClient();

async function fixUserEdx(email) {
  console.log('='.repeat(60));
  console.log('Fix User edX Registration and Enrollment');
  console.log('='.repeat(60));
  console.log('Email:', email);
  console.log('');

  // Step 1: Find the user
  const user = await prisma.user.findUnique({
    where: { email: email },
    include: {
      enrollments: {
        include: {
          track: { include: { courses: true } },
          course: true,
        },
      },
      orders: {
        where: { status: 'COMPLETED' },
        include: {
          items: {
            include: {
              track: { include: { courses: true } },
              course: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log('ERROR: User not found:', email);
    return;
  }

  console.log('=== USER FOUND ===');
  console.log('ID:', user.id);
  console.log('Name:', user.firstName, user.lastName);
  console.log('edX Registered:', user.edxRegistered ? 'Yes' : 'No');
  console.log('edX Username:', user.edxUsername || 'Not set');
  console.log('edX Password:', user.edxPassword ? 'Encrypted (set)' : 'Not set');
  console.log('');

  console.log('=== CURRENT ENROLLMENTS ===');
  console.log('Count:', user.enrollments.length);
  user.enrollments.forEach(function(e) {
    var name = e.track ? (e.track.title || e.track.name) : (e.course ? (e.course.title || e.course.name) : 'Unknown');
    var edxId = e.edxCourseId || (e.course ? e.course.edxCourseId : null) || 'N/A';
    console.log(' -', name, '| edX ID:', edxId, '| Status:', e.status);
  });
  console.log('');

  console.log('=== COMPLETED ORDERS ===');
  console.log('Count:', user.orders.length);
  user.orders.forEach(function(order) {
    console.log(' Order:', order.referenceId, '| Status:', order.status);
    order.items.forEach(function(item) {
      var name = item.track ? (item.track.title || item.track.name) : (item.course ? (item.course.title || item.course.name) : 'Unknown');
      console.log('   - Item:', name);
    });
  });
  console.log('');

  // Step 2: Register on edX if not registered
  var edxUsername = user.edxUsername;
  var edxPassword = null;

  if (!user.edxRegistered) {
    console.log('=== REGISTERING ON EDX ===');

    // Generate credentials
    var credentials = edxService.createEdxCredentials(user.firstName, user.lastName);
    edxPassword = credentials.password;

    console.log('Generated password for edX registration');

    try {
      var regResult = await edxService.registerUser({
        email: user.email,
        password: edxPassword,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      console.log('Registration result:', regResult.success ? 'SUCCESS' : 'FAILED');

      if (regResult.success) {
        edxUsername = regResult.username;
        console.log('edX Username:', edxUsername);

        // Update user in database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            edxRegistered: true,
            edxUsername: edxUsername,
            edxPassword: credentials.encryptedPassword,
          },
        });
        console.log('User updated in database with edX credentials');
      } else if (regResult.alreadyExists) {
        console.log('User already exists on edX platform');
        edxUsername = regResult.username;

        // Still update our database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            edxRegistered: true,
            edxUsername: edxUsername,
            edxPassword: credentials.encryptedPassword,
          },
        });
        console.log('User marked as registered in database');
      }
    } catch (err) {
      console.log('edX registration error:', err.message || err);
    }
  } else {
    console.log('User already registered on edX');
    if (user.edxPassword) {
      try {
        edxPassword = edxService.decryptPassword(user.edxPassword);
      } catch (err) {
        console.log('Could not decrypt edX password');
      }
    }
  }
  console.log('');

  // Step 3: Create missing Tabsera enrollments from completed orders
  console.log('=== CREATING MISSING TABSERA ENROLLMENTS ===');

  var existingEnrollmentIds = {};
  user.enrollments.forEach(function(e) {
    if (e.trackId) existingEnrollmentIds['track_' + e.trackId] = true;
    if (e.courseId) existingEnrollmentIds['course_' + e.courseId] = true;
  });

  var coursesToEnrollOnEdx = [];

  for (var i = 0; i < user.orders.length; i++) {
    var order = user.orders[i];

    for (var j = 0; j < order.items.length; j++) {
      var item = order.items[j];

      // Track enrollment
      if (item.trackId && item.track) {
        if (!existingEnrollmentIds['track_' + item.trackId]) {
          console.log('Creating track enrollment:', item.track.title || item.track.name);
          try {
            await prisma.enrollment.create({
              data: {
                userId: user.id,
                trackId: item.trackId,
                status: 'active',
              },
            });
            existingEnrollmentIds['track_' + item.trackId] = true;
            console.log('  Created track enrollment');
          } catch (err) {
            console.log('  Track enrollment may exist:', err.message);
          }
        }

        // Enroll in each course of the track
        var courses = item.track.courses || [];
        for (var k = 0; k < courses.length; k++) {
          var course = courses[k];
          if (!existingEnrollmentIds['course_' + course.id]) {
            console.log('Creating course enrollment:', course.title || course.name);
            try {
              await prisma.enrollment.create({
                data: {
                  userId: user.id,
                  courseId: course.id,
                  status: 'active',
                  edxCourseId: course.edxCourseId,
                },
              });
              existingEnrollmentIds['course_' + course.id] = true;
              console.log('  Created course enrollment');

              if (course.edxCourseId) {
                coursesToEnrollOnEdx.push({
                  id: course.id,
                  title: course.title || course.name,
                  edxCourseId: course.edxCourseId,
                });
              }
            } catch (err) {
              console.log('  Course enrollment may exist:', err.message);
            }
          } else if (course.edxCourseId) {
            // Already enrolled in Tabsera, but check if needs edX enrollment
            coursesToEnrollOnEdx.push({
              id: course.id,
              title: course.title || course.name,
              edxCourseId: course.edxCourseId,
            });
          }
        }
      }

      // Single course enrollment
      if (item.courseId && item.course) {
        if (!existingEnrollmentIds['course_' + item.courseId]) {
          console.log('Creating course enrollment:', item.course.title || item.course.name);
          try {
            await prisma.enrollment.create({
              data: {
                userId: user.id,
                courseId: item.courseId,
                status: 'active',
                edxCourseId: item.course.edxCourseId,
              },
            });
            existingEnrollmentIds['course_' + item.courseId] = true;
            console.log('  Created course enrollment');

            if (item.course.edxCourseId) {
              coursesToEnrollOnEdx.push({
                id: item.course.id,
                title: item.course.title || item.course.name,
                edxCourseId: item.course.edxCourseId,
              });
            }
          } catch (err) {
            console.log('  Course enrollment may exist:', err.message);
          }
        } else if (item.course.edxCourseId) {
          coursesToEnrollOnEdx.push({
            id: item.course.id,
            title: item.course.title || item.course.name,
            edxCourseId: item.course.edxCourseId,
          });
        }
      }
    }
  }
  console.log('');

  // Step 4: Enroll on edX platform
  console.log('=== ENROLLING ON EDX PLATFORM ===');
  console.log('Courses to enroll:', coursesToEnrollOnEdx.length);

  // Remove duplicates
  var uniqueCourses = [];
  var seenEdxIds = {};
  for (var m = 0; m < coursesToEnrollOnEdx.length; m++) {
    var c = coursesToEnrollOnEdx[m];
    if (!seenEdxIds[c.edxCourseId]) {
      seenEdxIds[c.edxCourseId] = true;
      uniqueCourses.push(c);
    }
  }

  console.log('Unique edX courses:', uniqueCourses.length);

  for (var n = 0; n < uniqueCourses.length; n++) {
    var courseToEnroll = uniqueCourses[n];
    console.log('Enrolling in:', courseToEnroll.title, '(' + courseToEnroll.edxCourseId + ')');

    // Try different enrollment modes
    var modes = ['audit', 'honor', 'verified'];
    var enrolled = false;

    for (var p = 0; p < modes.length && !enrolled; p++) {
      var mode = modes[p];
      console.log('  Trying mode:', mode);
      try {
        var enrollResult = await edxService.enrollUserInCourse({
          username: edxUsername,
          email: user.email,
          courseId: courseToEnroll.edxCourseId,
          mode: mode,
        });
        console.log('  Result:', enrollResult.success ? 'SUCCESS' : 'FAILED');
        enrolled = true;
      } catch (err) {
        console.log('  Mode', mode, 'failed:', err.message || 'Unknown error');
      }
    }

    if (!enrolled) {
      console.log('  Could not enroll via standard API, trying bulk enroll...');
      try {
        var bulkResult = await edxService.bulkEnroll({
          emails: [user.email],
          courseIds: [courseToEnroll.edxCourseId],
          autoEnroll: true,
        });
        console.log('  Bulk enroll result:', bulkResult.success ? 'SUCCESS' : 'FAILED');
        if (bulkResult.result) {
          console.log('  Bulk enroll details:', JSON.stringify(bulkResult.result).substring(0, 200));
        }
      } catch (bulkErr) {
        console.log('  Bulk enroll failed:', bulkErr.message || 'Unknown error');
      }
    }
  }
  console.log('');

  // Step 5: Verify final state
  var finalUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      enrollments: {
        include: {
          track: true,
          course: true,
        },
      },
    },
  });

  console.log('=== FINAL STATE ===');
  console.log('edX Registered:', finalUser.edxRegistered ? 'Yes' : 'No');
  console.log('edX Username:', finalUser.edxUsername || 'Not set');
  console.log('Total Enrollments:', finalUser.enrollments.length);
  finalUser.enrollments.forEach(function(e) {
    var name = e.track ? (e.track.title || e.track.name) : (e.course ? (e.course.title || e.course.name) : 'Unknown');
    console.log(' -', name, '| Status:', e.status);
  });
  console.log('');
  console.log('Done!');
}

var email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/fix-user-edx.js <email>');
  process.exit(1);
}

fixUserEdx(email)
  .catch(function(err) {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(function() {
    return prisma.$disconnect();
  });
