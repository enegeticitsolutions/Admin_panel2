import prisma from '../app/core/database';

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: '69ec0d19-9f41-4fdd-9d53-835f7706b125' }
  });

  console.log('--- USER FOR BIJOY KEJRIWAL ---');
  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
