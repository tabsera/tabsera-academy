/**
 * Database Seed Script
 * Run with: npm run db:seed
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: { emailVerified: true },
    create: {
      email: 'student@demo.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Student',
      phone: '+252611234567',
      country: 'SO',
      role: 'STUDENT',
      emailVerified: true,
    },
  });
  console.log('Created student:', student.email);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tabsera.com' },
    update: { emailVerified: true },
    create: {
      email: 'admin@tabsera.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'TABSERA_ADMIN',
      emailVerified: true,
    },
  });
  console.log('Created admin:', admin.email);

  // Create center admin
  const centerAdmin = await prisma.user.upsert({
    where: { email: 'center@tabsera.com' },
    update: { emailVerified: true },
    create: {
      email: 'center@tabsera.com',
      password: hashedPassword,
      firstName: 'Center',
      lastName: 'Admin',
      role: 'CENTER_ADMIN',
      emailVerified: true,
    },
  });
  console.log('Created center admin:', centerAdmin.email);

  // Create learning centers
  const center1 = await prisma.learningCenter.upsert({
    where: { slug: 'aqoonyahan-school' },
    update: {},
    create: {
      name: 'Aqoonyahan School',
      slug: 'aqoonyahan-school',
      description: 'Premier learning center in Hargeisa',
      address: '123 Education Street',
      city: 'Hargeisa',
      country: 'Somalia',
      phone: '+252634567890',
      email: 'info@aqoonyahan.edu',
    },
  });
  console.log('Created center:', center1.name);

  // Create tracks
  const tracks = [
    {
      title: 'Full-Stack Web Development',
      slug: 'full-stack-web-development',
      description: 'Master modern web development with React, Node.js, and databases.',
      price: 49.99,
      duration: '6 months',
      level: 'Beginner to Advanced',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    },
    {
      title: 'Data Science & Analytics',
      slug: 'data-science-analytics',
      description: 'Learn Python, machine learning, and data visualization.',
      price: 59.99,
      duration: '8 months',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    },
    {
      title: 'Mobile App Development',
      slug: 'mobile-app-development',
      description: 'Build iOS and Android apps with React Native.',
      price: 54.99,
      duration: '5 months',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    },
  ];

  for (const trackData of tracks) {
    const track = await prisma.track.upsert({
      where: { slug: trackData.slug },
      update: {},
      create: trackData,
    });
    console.log('Created track:', track.title);
  }

  // Create courses
  const webDevTrack = await prisma.track.findUnique({
    where: { slug: 'full-stack-web-development' },
  });

  const courses = [
    {
      title: 'HTML & CSS Fundamentals',
      slug: 'html-css-fundamentals',
      description: 'Learn the building blocks of the web.',
      price: 19.99,
      duration: '4 weeks',
      level: 'Beginner',
      lessons: 24,
      trackId: webDevTrack?.id,
      image: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800',
    },
    {
      title: 'JavaScript Essentials',
      slug: 'javascript-essentials',
      description: 'Master JavaScript from basics to advanced concepts.',
      price: 24.99,
      duration: '6 weeks',
      level: 'Beginner',
      lessons: 36,
      trackId: webDevTrack?.id,
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    },
    {
      title: 'React.js Development',
      slug: 'react-js-development',
      description: 'Build modern UIs with React.',
      price: 34.99,
      duration: '8 weeks',
      level: 'Intermediate',
      lessons: 48,
      trackId: webDevTrack?.id,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    },
    {
      title: 'Node.js Backend Development',
      slug: 'nodejs-backend-development',
      description: 'Create scalable backend services with Node.js.',
      price: 34.99,
      duration: '8 weeks',
      level: 'Intermediate',
      lessons: 42,
      trackId: webDevTrack?.id,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: courseData,
    });
    console.log('Created course:', course.title);
  }

  // Create promo codes
  const promoCodes = [
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10 },
    { code: 'SAVE20', discountType: 'percentage', discountValue: 20 },
    { code: 'STUDENT15', discountType: 'percentage', discountValue: 15 },
  ];

  for (const promoData of promoCodes) {
    const promo = await prisma.promoCode.upsert({
      where: { code: promoData.code },
      update: {},
      create: promoData,
    });
    console.log('Created promo code:', promo.code);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
