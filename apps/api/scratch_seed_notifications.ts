import { NotificationType, NotificationChannel } from '@prisma/client';
import prisma from './app/core/database';

async function main() {
  console.log('Seeding notifications...');
  
  // Find Puneet's user or any care companion user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('User Puneet not found!');
    return;
  }

  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: 'visit_reminder' as NotificationType,
        channel: 'push' as NotificationChannel,
        title: 'Upcoming Visit Reminder',
        body: 'Your companion visit with Mrs. Sharma starts in 1 hour.',
        isRead: false,
        sentAt: new Date(),
      },
      {
        userId: user.id,
        type: 'appointment_confirmed' as NotificationType,
        channel: 'push' as NotificationChannel,
        title: 'New Visit Requested',
        body: 'You have received a new visit request from Mr. Kapoor.',
        isRead: false,
        sentAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        userId: user.id,
        type: 'emergency_alert' as NotificationType,
        channel: 'push' as NotificationChannel,
        title: 'Welcome to Saathi Network',
        body: 'Thank you for joining as a companion volunteer. We are excited to have you!',
        isRead: true,
        readAt: new Date(Date.now() - 86400000), // 1 day ago
        sentAt: new Date(Date.now() - 86400000),
      }
    ]
  });

  console.log('Notifications seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
