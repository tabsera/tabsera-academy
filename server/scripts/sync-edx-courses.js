/**
 * Sync Courses from Open edX Platform (cambridge.tabsera.com)
 *
 * This script fetches all available courses from the edX platform
 * and populates them into the local database.
 *
 * Usage: node server/scripts/sync-edx-courses.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const EDX_BASE_URL = process.env.EDX_BASE_URL || 'https://cambridge.tabsera.com';
const EDX_CLIENT_ID = process.env.EDX_OAUTH_CLIENT_ID;
const EDX_CLIENT_SECRET = process.env.EDX_OAUTH_CLIENT_SECRET;

let accessToken = null;

/**
 * Get OAuth2 access token
 */
async function getAccessToken() {
  if (accessToken) return accessToken;

  console.log('Getting OAuth access token...');

  const response = await fetch(`${EDX_BASE_URL}/oauth2/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: EDX_CLIENT_ID,
      client_secret: EDX_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  console.log('✓ OAuth token obtained');
  return accessToken;
}

/**
 * Fetch all courses from edX API
 */
async function fetchEdxCourses() {
  const token = await getAccessToken();

  console.log('\nFetching courses from edX...');

  let allCourses = [];
  let nextUrl = `${EDX_BASE_URL}/api/courses/v1/courses/?page_size=100`;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch courses: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const courses = data.results || data;

    if (Array.isArray(courses)) {
      allCourses = allCourses.concat(courses);
      console.log(`  Fetched ${courses.length} courses (total: ${allCourses.length})`);
    }

    // Handle pagination
    nextUrl = data.pagination?.next || data.next || null;
  }

  console.log(`✓ Total courses fetched: ${allCourses.length}`);
  return allCourses;
}

/**
 * Generate URL-friendly slug from course title
 */
function generateSlug(title, courseId) {
  // Extract course key from course ID (e.g., "course-v1:TabseraX+CS101+2024" -> "cs101")
  const keyMatch = courseId?.match(/\+([^+]+)\+/);
  const keySuffix = keyMatch ? keyMatch[1].toLowerCase() : '';

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  return keySuffix ? `${baseSlug}-${keySuffix}` : baseSlug;
}

/**
 * Extract level from course data
 */
function extractLevel(course) {
  // Check effort or name for level hints
  const name = (course.name || course.title || '').toLowerCase();
  const effort = (course.effort || '').toLowerCase();

  if (name.includes('advanced') || name.includes('expert')) return 'Advanced';
  if (name.includes('intermediate')) return 'Intermediate';
  if (name.includes('beginner') || name.includes('introduction') || name.includes('fundamentals')) return 'Beginner';
  if (effort.includes('advanced')) return 'Advanced';

  return 'All Levels';
}

/**
 * Parse duration from course data
 */
function parseDuration(course) {
  // Try to get duration from course_runs or direct fields
  if (course.course_runs && course.course_runs.length > 0) {
    const run = course.course_runs[0];
    if (run.weeks) return `${run.weeks} weeks`;
    if (run.min_effort && run.max_effort) {
      return `${run.min_effort}-${run.max_effort} hours/week`;
    }
  }

  if (course.effort) return course.effort;

  // Default
  return 'Self-paced';
}

/**
 * Map edX course to our database schema
 */
function mapEdxCourse(edxCourse) {
  const courseId = edxCourse.id || edxCourse.course_id;
  const title = edxCourse.name || edxCourse.title || 'Untitled Course';

  return {
    title,
    slug: generateSlug(title, courseId),
    description: edxCourse.short_description || edxCourse.overview || edxCourse.description || '',
    price: 0, // Free by default, can be updated manually
    duration: parseDuration(edxCourse),
    level: extractLevel(edxCourse),
    lessons: edxCourse.blocks_count || 0,
    image: edxCourse.media?.image?.large || edxCourse.media?.course_image?.uri || edxCourse.image?.src || null,
    externalUrl: `${EDX_BASE_URL}/courses/${courseId}/about`,
    edxCourseId: courseId,
    isActive: true,
  };
}

/**
 * Sync courses to database (only adds missing courses)
 */
async function syncToDatabase(courses) {
  console.log('\nSyncing missing courses to database...');

  let created = 0;
  let skipped = 0;

  for (const edxCourse of courses) {
    try {
      const courseData = mapEdxCourse(edxCourse);

      // Check if course already exists by edxCourseId
      const existing = await prisma.course.findFirst({
        where: { edxCourseId: courseData.edxCourseId },
      });

      if (existing) {
        // Skip existing courses
        skipped++;
        console.log(`  ○ Skipped (exists): ${courseData.title}`);
      } else {
        // Ensure unique slug
        let slug = courseData.slug;
        let counter = 1;
        while (await prisma.course.findUnique({ where: { slug } })) {
          slug = `${courseData.slug}-${counter++}`;
        }
        courseData.slug = slug;

        // Create new course
        await prisma.course.create({
          data: courseData,
        });
        created++;
        console.log(`  + Created: ${courseData.title}`);
      }
    } catch (error) {
      console.error(`  ✗ Error syncing course: ${edxCourse.name || edxCourse.id}`, error.message);
      skipped++;
    }
  }

  console.log(`\n✓ Sync complete!`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);

  return { created, skipped };
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Open edX Course Sync');
  console.log(`Platform: ${EDX_BASE_URL}`);
  console.log('='.repeat(60));

  try {
    // Fetch courses from edX
    const edxCourses = await fetchEdxCourses();

    if (edxCourses.length === 0) {
      console.log('\nNo courses found on edX platform.');
      return;
    }

    // Display course summary
    console.log('\n--- Courses Found ---');
    edxCourses.forEach((course, i) => {
      const id = course.id || course.course_id;
      const name = course.name || course.title;
      console.log(`${i + 1}. ${name} (${id})`);
    });

    // Sync to database
    await syncToDatabase(edxCourses);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
