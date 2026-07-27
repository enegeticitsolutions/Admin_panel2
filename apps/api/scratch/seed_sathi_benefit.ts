import prisma from '../app/core/database';

async function seedSathiBenefit() {
  console.log('🌱 Seeding Sathi Companion BenefitType...');

  const benefitType = await prisma.benefitType.upsert({
    where: { name: 'Sathi Companion' },
    update: {
      description: 'Volunteer companionship services',
      iconCode: '🤝',
      isSystem: true,
    },
    create: {
      name: 'Sathi Companion',
      description: 'Volunteer companionship services',
      iconCode: '🤝',
      displayOrder: 8,
      isActive: true,
      isSystem: true,
    },
  });
  console.log(`✅ BenefitType seeded: ${benefitType.name} (id: ${benefitType.id})`);

  console.log('🌱 Seeding Sathi Companion Benefit...');
  const benefit = await prisma.benefit.upsert({
    where: { id: 'sathi-companion-benefit' }, // Hardcode an ID for easy referencing
    update: {
      name: 'Sathi Companion Hours',
      description: 'Companionship hours from Sathi network volunteers',
      benefitTypeId: benefitType.id,
      unitLabel: 'hours',
      defaultUnits: 10,
    },
    create: {
      id: 'sathi-companion-benefit',
      name: 'Sathi Companion Hours',
      description: 'Companionship hours from Sathi network volunteers',
      benefitTypeId: benefitType.id,
      unitLabel: 'hours',
      defaultUnits: 10,
      isActive: true,
    },
  });
  console.log(`✅ Benefit seeded: ${benefit.name} (id: ${benefit.id})`);

  console.log('🌱 Seeding System Config key SATHI_CREDIT_RATE...');
  const systemConfig = await prisma.systemConfig.upsert({
    where: { key: 'SATHI_CREDIT_RATE' },
    update: {
      value: '10', // 10 points per hour
    },
    create: {
      key: 'SATHI_CREDIT_RATE',
      value: '10',
      group: 'sathi',
      description: 'Credit points earned per hour of volunteering',
    },
  });
  console.log(`✅ SystemConfig seeded: ${systemConfig.key} = ${systemConfig.value}`);

  console.log('🌱 Seeding System Config key SATHI_MIN_BILLING_MINUTES...');
  const billingConfig = await prisma.systemConfig.upsert({
    where: { key: 'SATHI_MIN_BILLING_MINUTES' },
    update: {
      value: '60',
    },
    create: {
      key: 'SATHI_MIN_BILLING_MINUTES',
      value: '60',
      group: 'sathi',
      description: 'Minimum duration for a volunteer visit check-out in minutes',
    },
  });
  console.log(`✅ SystemConfig seeded: ${billingConfig.key} = ${billingConfig.value}`);

  console.log('✨ Seeding Completed successfully!');
}

seedSathiBenefit()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
