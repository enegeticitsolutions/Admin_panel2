const prisma = require('./core/database').default;
async function main() {
  const users = await prisma.user.findMany({ where: { name: { contains: 'Puneet', mode: 'insensitive' } } });
  for (const u of users) {
    console.log('User:', u.id, u.name, u.phone);
    const bens = await prisma.beneficiary.findMany({ where: { subscriberId: u.id } });
    console.log('  Beneficiaries:', bens.map(b => ({ id: b.id, name: b.name, status: b.status })));
    const subs = await prisma.subscription.findMany({ where: { subscriberId: u.id } });
    console.log('  Subscriptions:', subs.map(s => ({ id: s.id, packageType: s.packageType, isActive: s.isActive, benId: s.beneficiaryId })));
  }
}
main().catch(console.error).finally(() => process.exit(0));
