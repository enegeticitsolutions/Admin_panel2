import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const updated = await prisma.volunteerVisitLog.deleteMany({
    where: { status: 'in_progress' }
  });
  console.log('Deleted stuck visits:', updated.count);
}
run().finally(() => prisma.$disconnect());
