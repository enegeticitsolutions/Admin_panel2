import https from 'https';
import { URL } from 'url';
import { NotificationType, NotificationChannel } from '@prisma/client';
import prisma from '../core/database';
import { config } from '../core/config';

export interface SendNotificationOptions {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  data?: Record<string, any>;
}

/**
 * Universal Core Notification Sender
 * Creates an in-app database Notification record and dispatches
 * an Expo Push notification (FCM / APNs) if the user has an fcmToken.
 */
export async function sendNotificationToUser(options: SendNotificationOptions): Promise<void> {
  const { userId, title, body, type = NotificationType.system, channel = NotificationChannel.push, data = {} } = options;

  if (!userId) return;

  try {
    // 1. Create In-App Notification Record in Database
    const notif = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        channel,
        data: data || {},
      },
    });

    // 2. Fetch User's Push Token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true, name: true },
    });

    if (!user?.fcmToken) {
      return;
    }

    const pushToken = user.fcmToken.trim();

    const payload = JSON.stringify({
      to: pushToken,
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
      priority: 'high',
      channelId: 'default',
    });

    return new Promise((resolve) => {
      try {
        const url = new URL(config.expoPushUrl || 'https://exp.host/--/api/v2/push/send');
        const req = https.request(
          {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let resData = '';
            res.on('data', (chunk) => (resData += chunk));
            res.on('end', async () => {
              try {
                const parsed = JSON.parse(resData);
                if (parsed?.data?.status === 'ok') {
                  await prisma.notification.update({
                    where: { id: notif.id },
                    data: { sentAt: new Date() },
                  });
                  console.log(`📱 [PushNotification] Delivered push to ${user.name || userId}: "${title}"`);
                } else if (parsed?.data?.status === 'error') {
                  await prisma.notification.update({
                    where: { id: notif.id },
                    data: { failedAt: new Date(), failReason: JSON.stringify(parsed.data) },
                  });
                }
              } catch (_) {}
              resolve();
            });
          }
        );

        req.on('error', async (err) => {
          await prisma.notification.update({
            where: { id: notif.id },
            data: { failedAt: new Date(), failReason: err.message },
          });
          resolve();
        });

        req.write(payload);
        req.end();
      } catch (err: any) {
        console.error(`❌ [PushNotification] Error initializing push:`, err.message);
        resolve();
      }
    });
  } catch (err: any) {
    console.error(`[Notification Error] Failed to process notification for user ${userId}:`, err.message);
  }
}

/**
 * Domain Service: Dispatches Push & DB Notifications for Add-on Purchases
 */
export async function sendAddonPurchaseNotifications(params: {
  subscriberId: string;
  beneficiaryUserId?: string | null;
  beneficiaryName: string;
  benefitName: string;
  unitsText: string;
  subscriptionId: string;
  benefitId: string;
}): Promise<void> {
  const { subscriberId, beneficiaryUserId, beneficiaryName, benefitName, unitsText, subscriptionId, benefitId } = params;

  try {
    // 1. Notify Subscriber (Buyer)
    sendNotificationToUser({
      userId: subscriberId,
      title: 'Add-on Purchased! 🎉',
      body: `You successfully added ${unitsText} of ${benefitName} for ${beneficiaryName}.`,
      type: NotificationType.payment_success,
      data: {
        type: 'addon_purchased',
        subscriptionId,
        benefitId,
      },
    }).catch((err) => console.error('[Push Subscriber Error]:', err.message));

    // 2. Notify Beneficiary (Recipient - if separate user account)
    if (beneficiaryUserId && beneficiaryUserId !== subscriberId) {
      sendNotificationToUser({
        userId: beneficiaryUserId,
        title: 'New Benefit Added! 🎁',
        body: `${unitsText} of ${benefitName} has been added to your care package!`,
        type: NotificationType.system,
        data: {
          type: 'addon_credited',
          subscriptionId,
          benefitId,
        },
      }).catch((err) => console.error('[Push Beneficiary Error]:', err.message));
    }
  } catch (err: any) {
    console.error('[sendAddonPurchaseNotifications Error]:', err.message);
  }
}
