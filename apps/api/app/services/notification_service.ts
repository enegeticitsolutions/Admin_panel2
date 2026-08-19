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
import { PushNotificationDispatcher } from './notifications/PushNotificationDispatcher';

export async function sendNotificationToUser(options: SendNotificationOptions): Promise<void> {
  const dispatcher = PushNotificationDispatcher.getInstance();
  await dispatcher.send(options);
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
