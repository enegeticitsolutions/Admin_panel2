import prisma from './app/core/database';
async function main() {
  const users = await prisma.user.findMany({ where: { name: { contains: 'Puneet', mode: 'insensitive' } } });
  for (const u of users) {
    console.log('User:', u.id, u.name, u.phone);
    const bens = await prisma.beneficiary.findMany({ where: { subscriberId: u.id } });
    console.log('  Beneficiaries:', bens.map((b: any) => ({ id: b.id, name: b.name, status: b.status })));
    const subs = await prisma.subscription.findMany({ where: { subscriberId: u.id } });
    console.log('  Subscriptions:', subs.map((s: any) => ({ id: s.id, packageType: s.packageType, isActive: s.isActive, benId: s.beneficiaryId })));
  }
}
main().catch(console.error).finally(() => process.exit(0));
