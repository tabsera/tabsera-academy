/**
 * Fix credits for completed sessions
 * This script finds all completed sessions that have creditsConsumed > 0
 * but whose purchase.creditsUsed wasn't updated, and fixes them.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCompletedSessionsCredits() {
  console.log('Starting to fix completed sessions credits...\n');

  // Find all completed sessions with credits consumed
  const completedSessions = await prisma.tutorSession.findMany({
    where: {
      status: 'COMPLETED',
      purchaseId: { not: null },
      creditsConsumed: { gt: 0 },
    },
    include: {
      purchase: true,
      student: { select: { firstName: true, lastName: true } },
    },
  });

  console.log(`Found ${completedSessions.length} completed sessions with credits consumed.\n`);

  let fixedCount = 0;
  let alreadyCorrectCount = 0;

  for (const session of completedSessions) {
    const purchase = session.purchase;

    if (!purchase) {
      console.log(`Session ${session.id}: No purchase found, skipping`);
      continue;
    }

    // Check if credits are still in reserved (bug case)
    // The credits should be in "used", not in "reserved"
    if (purchase.creditsReserved >= session.creditsConsumed) {
      // Credits are still reserved - need to move to used
      console.log(`Session ${session.id}: Moving ${session.creditsConsumed} credits from reserved to used`);
      console.log(`  Student: ${session.student?.firstName} ${session.student?.lastName}`);
      console.log(`  Before: reserved=${purchase.creditsReserved}, used=${purchase.creditsUsed}`);

      await prisma.tuitionPackPurchase.update({
        where: { id: purchase.id },
        data: {
          creditsUsed: { increment: session.creditsConsumed },
          creditsReserved: { decrement: session.creditsConsumed },
        },
      });

      const updatedPurchase = await prisma.tuitionPackPurchase.findUnique({
        where: { id: purchase.id },
      });
      console.log(`  After:  reserved=${updatedPurchase.creditsReserved}, used=${updatedPurchase.creditsUsed}\n`);

      fixedCount++;
    } else {
      // Credits already moved - correct state
      alreadyCorrectCount++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Fixed: ${fixedCount} sessions`);
  console.log(`Already correct: ${alreadyCorrectCount} sessions`);
  console.log(`Total: ${completedSessions.length} sessions`);
}

fixCompletedSessionsCredits()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
