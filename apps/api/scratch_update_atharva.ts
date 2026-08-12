import prisma from './app/core/database';

async function main() {
  await prisma.beneficiary.updateMany({
    where: { name: { contains: 'Atharva' } },
    data: { latitude: 28.4975, longitude: 77.0655 }
  });
  console.log("Updated Atharva's coordinates.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
