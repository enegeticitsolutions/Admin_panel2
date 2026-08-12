import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const beneficiaryId = 'some-id';
  const requests = await prisma.sathiVisitRequest.findMany({
    take: 1,
    include: {
      beneficiary: {
        select: {
          id: true,
          _count: { select: { volunteerVisits: true } }
        }
      }
    }
  });
  console.log(JSON.stringify(requests, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
