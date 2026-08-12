import prisma from './app/core/database';

async function main() {
  const volunteers = await prisma.volunteer.findMany({
    where: { name: 'Anirudh' },
    select: { name: true, latitude: true, longitude: true, id: true }
  });
  console.log("Volunteers Anirudh:", volunteers);
  
  const beneficiaries = await prisma.beneficiary.findMany({
    where: { name: { contains: 'Atharva' } },
    select: { name: true, latitude: true, longitude: true, id: true }
  });
  console.log("Beneficiaries Atharva:", beneficiaries);
}

main().catch(console.error).finally(() => prisma.$disconnect());
