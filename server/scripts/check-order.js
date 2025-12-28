const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrder() {
  const referenceId = process.argv[2] || 'ORD-MJOGQR41-72A5CFE3';

  const order = await prisma.order.findFirst({
    where: { referenceId },
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
    console.log('Order not found:', referenceId);
    await prisma.$disconnect();
    return;
  }

  console.log('=== ORDER DETAILS ===');
  console.log('Reference:', order.referenceId);
  console.log('Status:', order.status);
  console.log('Payment Status:', order.paymentStatus);
  console.log('User ID:', order.userId);
  console.log('User Email:', order.user?.email);
  console.log('User Name:', order.user?.firstName, order.user?.lastName);
  console.log('Total:', order.total);
  console.log('Created:', order.createdAt);

  console.log('\n=== ORDER ITEMS ===');
  order.items.forEach(item => {
    console.log(' - Name:', item.name);
    console.log('   Type:', item.type);
    console.log('   Track ID:', item.trackId);
    console.log('   Course ID:', item.courseId);
    if (item.track) {
      console.log('   Track Courses:', item.track.courses?.length || 0);
      item.track.courses?.forEach(c => console.log('     *', c.name));
    }
  });

  console.log('\n=== PAYMENTS ===');
  order.payments.forEach(p => {
    console.log(' - Status:', p.status);
    console.log('   Amount:', p.amount);
    console.log('   Paid At:', p.paidAt);
    console.log('   Transaction ID:', p.transactionId);
  });

  // Check enrollments for this user
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: order.userId },
    include: { track: true, course: true }
  });

  console.log('\n=== USER ENROLLMENTS ===');
  console.log('Total:', enrollments.length);
  enrollments.forEach(e => {
    console.log(' -', e.track?.name || e.course?.name || 'Unknown');
    console.log('   Status:', e.status);
    console.log('   Track ID:', e.trackId);
    console.log('   Course ID:', e.courseId);
    console.log('   Created:', e.createdAt);
  });

  await prisma.$disconnect();
}

checkOrder().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
