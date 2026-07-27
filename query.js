const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const visits = await prisma.sathiVisitRequest.findMany({ include: { beneficiary: true } });
  console.log(JSON.stringify(visits, null, 2));
}
main();
