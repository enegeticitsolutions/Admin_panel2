import https from 'https';
import { URL } from 'url';
import prisma from '../../core/database';
import { config } from '../../core/config';
import { NotificationType, NotificationChannel } from '@prisma/client';

export interface PushMessageOptions {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

export interface PushResult {
  success: boolean;
  notificationId?: string;
  ticketId?: string;
  error?: string;
}

/**
 * Object-Oriented Push Notification Dispatcher
 * Dispatches push notifications to iOS (APNs) and Android (FCM) devices
 * via Expo Push HTTP API using the user's registered push token.
 */
export class PushNotificationDispatcher {
  private static instance: PushNotificationDispatcher;
  private expoPushUrl: string;

  private constructor() {
    this.expoPushUrl = config.expoPushUrl || 'https://exp.host/--/api/v2/push/send';
  }

  public static getInstance(): PushNotificationDispatcher {
    if (!PushNotificationDispatcher.instance) {
      PushNotificationDispatcher.instance = new PushNotificationDispatcher();
    }
    return PushNotificationDispatcher.instance;
  }

  /**
   * Sends an in-app database notification and dispatches a remote push notification
   * to the user's active device if an fcmToken / pushToken is registered.
   */
  public async send(options: PushMessageOptions): Promise<PushResult> {
    const {
      userId,
      title,
      body,
      type = NotificationType.system,
      channel = NotificationChannel.push,
      data = {},
      sound = 'default',
      badge = 1,
      priority = 'high',
      channelId = 'default',
    } = options;

    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      // 1. Persist notification in database
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

      // 2. Fetch User's Device Push Token (FCM / APNs Expo Token)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true, name: true },
      });

      if (!user?.fcmToken || !user.fcmToken.trim()) {
        // No push token registered (e.g. user hasn't logged in on physical device yet)
        return { success: true, notificationId: notif.id };
      }

      const pushToken = user.fcmToken.trim();

      // Check for valid Expo push token format
      if (!this.isValidPushToken(pushToken)) {
        console.warn(`⚠️ [PushDispatcher] Invalid push token format for user ${userId}: ${pushToken}`);
        return { success: true, notificationId: notif.id, error: 'Invalid token format' };
      }

      // 3. Prepare payload for Expo Push Service
      const payload = JSON.stringify({
        to: pushToken,
        title,
        body,
        data: {
          ...data,
          notificationId: notif.id,
          type,
        },
        sound,
        badge,
        priority,
        channelId,
      });

      // 4. Send via HTTPS to Expo Push API
      const dispatchResult = await this.postToExpo(payload);

      if (dispatchResult.success) {
        await prisma.notification.update({
          where: { id: notif.id },
          data: { sentAt: new Date() },
        });
        console.log(`📱 [PushDispatcher] Sent "${title}" to ${user.name || userId}`);
        return { success: true, notificationId: notif.id, ticketId: dispatchResult.ticketId };
      } else {
        await prisma.notification.update({
          where: { id: notif.id },
          data: { failedAt: new Date(), failReason: dispatchResult.error },
        });
        console.warn(`⚠️ [PushDispatcher] Failed delivering to ${user.name || userId}: ${dispatchResult.error}`);
        return { success: false, notificationId: notif.id, error: dispatchResult.error };
      }
    } catch (err: any) {
      console.error(`❌ [PushDispatcher] Unexpected error sending notification:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Helper to validate Expo push token format (ExponentPushToken[...] or ExpoPushToken[...])
   */
  private isValidPushToken(token: string): boolean {
    return (
      (typeof token === 'string' &&
        (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['))) ||
      /^[a-zA-Z0-9_-]{20,}$/.test(token)
    );
  }

  /**
   * Internal HTTP POST to Expo Push API
   */
  private postToExpo(payload: string): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    return new Promise((resolve) => {
      try {
        const url = new URL(this.expoPushUrl);
        const req = https.request(
          {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let resData = '';
            res.on('data', (chunk) => (resData += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(resData);
                const data = parsed?.data;

                if (Array.isArray(data) && data.length > 0) {
                  const firstTicket = data[0];
                  if (firstTicket.status === 'ok') {
                    return resolve({ success: true, ticketId: firstTicket.id });
                  } else {
                    return resolve({
                      success: false,
                      error: firstTicket.message || firstTicket.details?.error || 'Push delivery rejected',
                    });
                  }
                } else if (data?.status === 'ok') {
                  return resolve({ success: true, ticketId: data.id });
                } else {
                  return resolve({ success: false, error: parsed?.errors?.[0]?.message || 'Unknown push error' });
                }
              } catch (parseErr: any) {
                return resolve({ success: false, error: parseErr.message });
              }
            });
          }
        );

        req.on('error', (reqErr) => {
          return resolve({ success: false, error: reqErr.message });
        });

        req.write(payload);
        req.end();
      } catch (err: any) {
        return resolve({ success: false, error: err.message });
      }
    });
  }
}
