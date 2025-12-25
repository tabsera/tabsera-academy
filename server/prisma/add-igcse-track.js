/**
 * Add Cambridge IGCSE O Level Track
 * Run with: node prisma/add-igcse-track.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Adding Cambridge IGCSE O Level Track...');

  // Create the track
  const track = await prisma.track.upsert({
    where: { slug: 'cambridge-igcse-o-level' },
    update: {},
    create: {
      title: 'Cambridge IGCSE O Level',
      slug: 'cambridge-igcse-o-level',
      description: 'Comprehensive preparation for Cambridge IGCSE O Level examinations. Master core subjects with expert-led courses designed to help you excel in your exams.',
      price: 99.99,
      duration: '12 months',
      level: 'Secondary (Ages 14-16)',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    },
  });
  console.log('Created track:', track.title);

  // Define the courses
  const courses = [
    {
      title: 'IGCSE Mathematics',
      slug: 'igcse-mathematics',
      description: 'Master mathematical concepts including algebra, geometry, statistics, and calculus. Develop problem-solving skills essential for IGCSE success.',
      price: 29.99,
      duration: '10 weeks',
      level: 'O Level',
      lessons: 48,
      trackId: track.id,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    },
    {
      title: 'IGCSE English as a Second Language',
      slug: 'igcse-english-second-language',
      description: 'Develop reading, writing, listening, and speaking skills. Build vocabulary and grammar proficiency for effective English communication.',
      price: 29.99,
      duration: '10 weeks',
      level: 'O Level',
      lessons: 42,
      trackId: track.id,
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    },
    {
      title: 'IGCSE Business Studies',
      slug: 'igcse-business-studies',
      description: 'Understand business concepts, operations, marketing, finance, and human resources. Learn how businesses operate in the modern economy.',
      price: 29.99,
      duration: '10 weeks',
      level: 'O Level',
      lessons: 36,
      trackId: track.id,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    },
    {
      title: 'IGCSE Computer Science',
      slug: 'igcse-computer-science',
      description: 'Learn programming fundamentals, algorithms, data structures, and computer systems. Develop computational thinking and coding skills.',
      price: 29.99,
      duration: '10 weeks',
      level: 'O Level',
      lessons: 44,
      trackId: track.id,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    },
    {
      title: 'IGCSE Chemistry',
      slug: 'igcse-chemistry',
      description: 'Explore atomic structure, chemical bonding, reactions, organic chemistry, and laboratory techniques. Build a strong foundation in chemistry.',
      price: 29.99,
      duration: '10 weeks',
      level: 'O Level',
      lessons: 40,
      trackId: track.id,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    },
    {
      title: 'IGCSE Physics',
      slug: 'igcse-physics',
      description: 'Study mechanics, electricity, waves, energy, and modern physics. Understand the fundamental laws governing the physical world.',
      price: 29.99,
      duration: '10 weeks',
      level: 'O Level',
      lessons: 42,
      trackId: track.id,
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800',
    },
  ];

  // Create each course
  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: courseData,
    });
    console.log('Created course:', course.title);
  }

  console.log('\nCambridge IGCSE O Level Track created successfully!');
  console.log(`Track ID: ${track.id}`);
  console.log(`Total courses: ${courses.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
