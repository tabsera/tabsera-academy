const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const orderRef = process.argv[2] || "ORD-MJX38ND9-97E295B1";

async function addCredits() {
  const order = await prisma.order.findFirst({
    where: { referenceId: orderRef },
    include: {
      items: { include: { tuitionPack: true } },
      user: true
    }
  });

  if (!order) {
    console.log("Order not found");
    return;
  }

  console.log("Order:", order.referenceId, "User:", order.user.email);

  const existing = await prisma.tuitionPackPurchase.findFirst({
    where: { orderId: order.id }
  });

  if (existing) {
    console.log("Credits already exist for this order:", existing.creditsRemaining);
    return;
  }

  for (const item of order.items) {
    if (item.tuitionPackId && item.tuitionPack) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (item.tuitionPack.validityDays || 30));

      await prisma.tuitionPackPurchase.create({
        data: {
          userId: order.user.id,
          tuitionPackId: item.tuitionPackId,
          orderId: order.id,
          creditsTotal: item.tuitionPack.creditsIncluded,
          creditsRemaining: item.tuitionPack.creditsIncluded,
          expiresAt,
        },
      });

      console.log("Created:", item.tuitionPack.creditsIncluded, "credits, expires:", expiresAt);
    }
  }

  await prisma.$disconnect();
}

addCredits().catch(e => console.error(e));
