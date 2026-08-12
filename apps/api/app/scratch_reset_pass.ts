import prisma from './core/database';
import bcrypt from 'bcryptjs';

async function main() {
  const targetPhone = process.argv[2] || '9999999991';
  const newPasswordRaw = process.argv[3] || '123456';

  console.log(`Searching for user with phone containing: ${targetPhone}...`);
  const users = await prisma.user.findMany({
    where: {
      phone: { contains: targetPhone }
    }
  });

  if (users.length === 0) {
    console.log('❌ No user found matching phone:', targetPhone);
    const sampleUsers = await prisma.user.findMany({
      select: { id: true, name: true, phone: true, role: true },
      take: 10
    });
    console.log('Sample users in DB:', sampleUsers);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPasswordRaw, salt);

  for (const user of users) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log(`✅ Successfully updated password to '${newPasswordRaw}' for User ID: ${updated.id}, Name: ${updated.name || 'N/A'}, Phone: ${updated.phone}, Role: ${updated.role}`);
  }
}

main()
  .catch((err) => {
    console.error('Error resetting password:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
