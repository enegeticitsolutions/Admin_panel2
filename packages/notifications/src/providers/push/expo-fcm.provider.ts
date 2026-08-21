import https from 'https';
import { IPushProvider, PushNotificationMessage, PushNotificationResponse } from '../../interfaces/IPushProvider';

/**
 * Expo FCM Push Notification Provider
 * Delivers push notifications to Android (FCM) and iOS (APNs) via the Expo Push API.
 */
export class ExpoFcmPushProvider implements IPushProvider {
  public readonly name = 'expo-fcm';
  private readonly expoPushUrl: string;

  constructor(customPushUrl?: string) {
    this.expoPushUrl = customPushUrl || process.env.EXPO_PUSH_URL || 'https://exp.host/--/api/v2/push/send';
  }

  public async send(message: PushNotificationMessage): Promise<PushNotificationResponse> {
    if (!message.to || !message.to.trim()) {
      return { success: false, error: 'Push token is empty' };
    }

    const token = message.to.trim();
    if (!token.startsWith('ExponentPushToken') && !token.startsWith('ExpoPushToken')) {
      return { success: false, error: `Invalid Expo Push token format: ${token}` };
    }

    const payload = JSON.stringify({
      to: token,
      title: message.title,
      body: message.body,
      data: message.data || {},
      sound: message.sound !== undefined ? message.sound : 'default',
      badge: message.badge ?? 1,
      priority: message.priority || 'high',
      channelId: message.channelId || 'default',
      ttl: message.ttl || 86400, // 24 hours default TTL
    });

    return new Promise<PushNotificationResponse>((resolve) => {
      try {
        const url = new URL(this.expoPushUrl);
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
            let responseData = '';
            res.on('data', (chunk) => (responseData += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(responseData);
                const ticket = parsed?.data;

                if (Array.isArray(ticket) && ticket[0]?.status === 'ok') {
                  return resolve({
                    success: true,
                    ticketId: ticket[0].id,
                    messageId: ticket[0].id,
                  });
                } else if (ticket?.status === 'ok') {
                  return resolve({
                    success: true,
                    ticketId: ticket.id,
                    messageId: ticket.id,
                  });
                } else {
                  const errorMsg = ticket?.message || ticket?.[0]?.message || 'Unknown Expo push error';
                  console.warn(`[ExpoFcmPushProvider] Push rejected for token ${token}:`, errorMsg);
                  return resolve({
                    success: false,
                    error: errorMsg,
                    details: parsed,
                  });
                }
              } catch (parseErr: any) {
                return resolve({
                  success: false,
                  error: `Failed to parse response: ${parseErr.message}`,
                });
              }
            });
          }
        );

        req.on('error', (err) => {
          console.error('[ExpoFcmPushProvider] Network error:', err.message);
          resolve({ success: false, error: err.message });
        });

        req.setTimeout(8000, () => {
          req.destroy(new Error('Push notification request timed out'));
          resolve({ success: false, error: 'Request timeout' });
        });

        req.write(payload);
        req.end();
      } catch (err: any) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  public async sendBatch(messages: PushNotificationMessage[]): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    errors?: any[];
  }> {
    if (!messages || messages.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 };
    }

    const validMessages = messages.filter(
      (m) => m.to && (m.to.startsWith('ExponentPushToken') || m.to.startsWith('ExpoPushToken'))
    );

    if (validMessages.length === 0) {
      return { success: false, sentCount: 0, failedCount: messages.length, errors: ['No valid Expo push tokens found'] };
    }

    const payload = JSON.stringify(
      validMessages.map((m) => ({
        to: m.to.trim(),
        title: m.title,
        body: m.body,
        data: m.data || {},
        sound: m.sound ?? 'default',
        badge: m.badge ?? 1,
        priority: m.priority || 'high',
        channelId: m.channelId || 'default',
        ttl: m.ttl || 86400,
      }))
    );

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
              'Accept': 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let responseData = '';
            res.on('data', (chunk) => (responseData += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(responseData);
                const tickets = Array.isArray(parsed?.data) ? parsed.data : [];
                let sentCount = 0;
                let failedCount = 0;
                const errors: any[] = [];

                tickets.forEach((t: any, idx: number) => {
                  if (t.status === 'ok') {
                    sentCount++;
                  } else {
                    failedCount++;
                    errors.push({ index: idx, error: t.message || t.details });
                  }
                });

                resolve({
                  success: failedCount === 0,
                  sentCount,
                  failedCount,
                  errors: errors.length > 0 ? errors : undefined,
                });
              } catch (e: any) {
                resolve({
                  success: false,
                  sentCount: 0,
                  failedCount: messages.length,
                  errors: [e.message],
                });
              }
            });
          }
        );

        req.on('error', (err) => {
          resolve({
            success: false,
            sentCount: 0,
            failedCount: messages.length,
            errors: [err.message],
          });
        });

        req.setTimeout(12000, () => {
          req.destroy(new Error('Batch push timed out'));
          resolve({
            success: false,
            sentCount: 0,
            failedCount: messages.length,
            errors: ['Batch push request timeout'],
          });
        });

        req.write(payload);
        req.end();
      } catch (err: any) {
        resolve({
          success: false,
          sentCount: 0,
          failedCount: messages.length,
          errors: [err.message],
        });
      }
    });
  }
}
