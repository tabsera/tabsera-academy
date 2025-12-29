/**
 * Seed Subjects
 * Populates the subjects table with common academic subjects
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Academic subjects for IGCSE and Islamic studies
const subjects = [
  // Core Sciences
  { name: 'Mathematics', slug: 'mathematics', icon: 'Calculator', color: '#3B82F6', sortOrder: 1 },
  { name: 'Physics', slug: 'physics', icon: 'Atom', color: '#8B5CF6', sortOrder: 2 },
  { name: 'Chemistry', slug: 'chemistry', icon: 'FlaskConical', color: '#10B981', sortOrder: 3 },
  { name: 'Biology', slug: 'biology', icon: 'Leaf', color: '#22C55E', sortOrder: 4 },

  // Languages
  { name: 'English Language', slug: 'english-language', icon: 'BookOpen', color: '#EF4444', sortOrder: 10 },
  { name: 'English Literature', slug: 'english-literature', icon: 'BookText', color: '#F97316', sortOrder: 11 },
  { name: 'Arabic', slug: 'arabic', icon: 'Languages', color: '#14B8A6', sortOrder: 12 },
  { name: 'French', slug: 'french', icon: 'Languages', color: '#0EA5E9', sortOrder: 13 },

  // Islamic Studies
  { name: 'Islamic Studies', slug: 'islamic-studies', icon: 'Moon', color: '#059669', sortOrder: 20 },
  { name: 'Quran', slug: 'quran', icon: 'BookHeart', color: '#047857', sortOrder: 21 },
  { name: 'Arabic (Islamic)', slug: 'arabic-islamic', icon: 'Scroll', color: '#0D9488', sortOrder: 22 },

  // Humanities
  { name: 'History', slug: 'history', icon: 'Landmark', color: '#A855F7', sortOrder: 30 },
  { name: 'Geography', slug: 'geography', icon: 'Globe', color: '#06B6D4', sortOrder: 31 },
  { name: 'Economics', slug: 'economics', icon: 'TrendingUp', color: '#F59E0B', sortOrder: 32 },
  { name: 'Business Studies', slug: 'business-studies', icon: 'Briefcase', color: '#6366F1', sortOrder: 33 },
  { name: 'Accounting', slug: 'accounting', icon: 'Receipt', color: '#84CC16', sortOrder: 34 },

  // Technology
  { name: 'Computer Science', slug: 'computer-science', icon: 'Monitor', color: '#6B7280', sortOrder: 40 },
  { name: 'ICT', slug: 'ict', icon: 'Cpu', color: '#0284C7', sortOrder: 41 },

  // Arts
  { name: 'Art & Design', slug: 'art-design', icon: 'Palette', color: '#EC4899', sortOrder: 50 },
  { name: 'Music', slug: 'music', icon: 'Music', color: '#D946EF', sortOrder: 51 },

  // Additional Sciences
  { name: 'Environmental Science', slug: 'environmental-science', icon: 'TreePine', color: '#65A30D', sortOrder: 60 },
  { name: 'Psychology', slug: 'psychology', icon: 'Brain', color: '#DB2777', sortOrder: 61 },
  { name: 'Sociology', slug: 'sociology', icon: 'Users', color: '#7C3AED', sortOrder: 62 },
];

async function seedSubjects() {
  console.log('Seeding subjects...');

  let created = 0;
  let updated = 0;

  for (const subject of subjects) {
    try {
      const existing = await prisma.subject.findUnique({
        where: { slug: subject.slug },
      });

      if (existing) {
        await prisma.subject.update({
          where: { slug: subject.slug },
          data: subject,
        });
        updated++;
      } else {
        await prisma.subject.create({
          data: subject,
        });
        created++;
      }
    } catch (error) {
      console.error(`Error seeding subject ${subject.slug}:`, error.message);
    }
  }

  console.log(`Subjects seeded: ${created} created, ${updated} updated`);
  console.log(`Total subjects: ${created + updated}`);
}

seedSubjects()
  .catch((e) => {
    console.error('Error seeding subjects:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
