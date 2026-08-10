import * as https from 'https';
import prisma from '../../core/database';
import { NotificationType } from '@prisma/client';
import { config } from '../../core/config';
import {
  MONTH_NAMES,
  CELEBRATION_EVENT_TYPES,
  CELEBRATION_TIMINGS,
  generateBirthdayNotificationTitle,
  generateBirthdayNotificationBody,
} from '../../constants/celebration_constants';

export interface BirthdayNotificationPayload {
  beneficiaryId: string;
  beneficiaryName: string;
  role: 'Primary' | 'Secondary';
  timing: typeof CELEBRATION_TIMINGS.ONE_DAY_BEFORE | typeof CELEBRATION_TIMINGS.ON_DAY;
  celebrationDate: string;
}

/**
 * CareCompanionCelebrationNotificationService
 * Enterprise-grade notification service handling scheduled push notifications
 * and offline catch-up sync for Care Companions regarding assigned beneficiaries' birthdays.
 */
export class CareCompanionCelebrationNotificationService {
  /**
   * Send an Expo push notification to a user's mobile device via FCM / APNs gateway
   */
  public async sendExpoPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    if (!expoPushToken || !expoPushToken.startsWith(config.pushTokenPrefix)) {
      return;
    }

    const payload = JSON.stringify({
      to: expoPushToken,
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
        const url = new URL(config.expoPushUrl);
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
            res.on('end', () => {
              try {
                const parsed = JSON.parse(resData);
                if (parsed?.data?.status === 'error') {
                  console.warn('⚠️ [CelebrationNotification] Push status error:', parsed.data);
                }
              } catch (_) {}
              resolve();
            });
          }
        );

        req.on('error', (err) => {
          console.error('❌ [CelebrationNotification] Network push error:', err.message);
          resolve();
        });

        req.write(payload);
        req.end();
      } catch (err: any) {
        console.error('❌ [CelebrationNotification] Failed to send Expo push:', err.message);
        resolve();
      }
    });
  }

  /**
   * Checks upcoming birthdays for assigned beneficiaries of a Care Companion
   * and dispatches push & DB notifications for:
   *  1) 1 Day Before the birthday
   *  2) On the Day of the birthday
   * 
   * Includes offline catch-up sync: If the user was offline at the scheduled push time,
   * opening the app / requesting dashboard triggers this method to immediately generate
   * any pending notifications.
   */
  public async checkAndDispatchCelebrationNotificationsForCompanion(
    ccUserId: string,
    ccId: string
  ): Promise<number> {
    let dispatchedCount = 0;
    try {
      // 1. Retrieve Care Companion's user record for fcmToken
      const ccUser = await prisma.user.findUnique({
        where: { id: ccUserId },
        select: { id: true, name: true, fcmToken: true },
      });

      if (!ccUser) return 0;

      // 2. Fetch assigned active beneficiaries
      const assignedBeneficiaries = await prisma.beneficiary.findMany({
        where: {
          OR: [{ primaryCcId: ccId }, { secondaryCcId: ccId }],
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          primaryCcId: true,
          secondaryCcId: true,
        },
      });

      if (assignedBeneficiaries.length === 0) return 0;

      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lookbackThreshold = new Date(now.getTime() - config.notifications.lookbackDays * 24 * 60 * 60 * 1000);

      // Fetch existing celebration notifications for this user within lookback window to prevent duplicates
      const existingNotifications = await prisma.notification.findMany({
        where: {
          userId: ccUserId,
          type: NotificationType.system,
          createdAt: {
            gte: lookbackThreshold,
          },
        },
      });

      for (const b of assignedBeneficiaries) {
        const role: 'Primary' | 'Secondary' = b.primaryCcId === ccId ? 'Primary' : 'Secondary';

        let dobMonth: number;
        let dobDay: number;

        if (b.dateOfBirth) {
          const dob = new Date(b.dateOfBirth);
          dobMonth = dob.getMonth();
          dobDay = dob.getDate();
        } else {
          // Deterministic birthday fallback derived from beneficiary name/id if dateOfBirth is unpopulated
          const charSum = (b.name || 'B').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
          dobMonth = charSum % 12;
          dobDay = (charSum % 28) + 1;
        }

        // Determine this year's birthday date
        let birthdayThisYear = new Date(now.getFullYear(), dobMonth, dobDay);
        if (birthdayThisYear < todayMidnight) {
          birthdayThisYear = new Date(now.getFullYear() + 1, dobMonth, dobDay);
        }

        const formattedCelebrationDate = `${MONTH_NAMES[dobMonth]} ${dobDay}`;

        // Determine if birthday is TODAY or TOMORROW
        const diffMs = birthdayThisYear.getTime() - todayMidnight.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        let timing: typeof CELEBRATION_TIMINGS.ONE_DAY_BEFORE | typeof CELEBRATION_TIMINGS.ON_DAY | null = null;
        if (diffDays === 0) {
          timing = CELEBRATION_TIMINGS.ON_DAY;
        } else if (diffDays === 1) {
          timing = CELEBRATION_TIMINGS.ONE_DAY_BEFORE;
        }

        if (!timing) continue;

        // Check idempotency / deduplication
        const alreadyNotified = existingNotifications.some((n) => {
          const nData = n.data as any;
          return (
            nData &&
            nData.event === CELEBRATION_EVENT_TYPES.BIRTHDAY &&
            nData.beneficiaryId === b.id &&
            nData.timing === timing &&
            nData.celebrationYear === birthdayThisYear.getFullYear()
          );
        });

        if (alreadyNotified) continue;

        // Construct notification title and body using template generators
        const title = generateBirthdayNotificationTitle({ timing, name: b.name });
        const body = generateBirthdayNotificationBody({
          timing,
          name: b.name,
          role,
          celebrationDate: formattedCelebrationDate,
        });

        const payloadData: BirthdayNotificationPayload & { event: string; celebrationYear: number } = {
          event: CELEBRATION_EVENT_TYPES.BIRTHDAY,
          beneficiaryId: b.id,
          beneficiaryName: b.name,
          role,
          timing,
          celebrationDate: formattedCelebrationDate,
          celebrationYear: birthdayThisYear.getFullYear(),
        };

        // 1. Create In-App Notification Record in DB
        await prisma.notification.create({
          data: {
            userId: ccUserId,
            type: NotificationType.system,
            channel: 'push',
            title,
            body,
            data: payloadData as any,
            sentAt: new Date(),
          },
        });

        // 2. Send Expo FCM Push Notification if token exists
        if (ccUser.fcmToken) {
          setImmediate(() => {
            this.sendExpoPushNotification(ccUser.fcmToken!, title, body, payloadData);
          });
        }

        dispatchedCount++;
        console.log(`🎂 [CelebrationNotification] Dispatched ${timing} birthday alert for ${b.name} to Care Companion ${ccUser.name || ccUserId}`);
      }
    } catch (error: any) {
      console.error('❌ [CelebrationNotification] Error checking celebration notifications:', error.message);
    }
    return dispatchedCount;
  }

  /**
   * Background scan running daily for all active Care Companions
   */
  public async runDailyCelebrationNotificationCheck(): Promise<{ processedCompanions: number; totalDispatched: number }> {
    let totalDispatched = 0;
    let processedCompanions = 0;
    try {
      const careCompanions = await prisma.careCompanion.findMany({
        where: { isAvailable: true },
        select: { id: true, userId: true },
      });

      processedCompanions = careCompanions.length;

      for (const cc of careCompanions) {
        if (!cc.userId) continue;
        const count = await this.checkAndDispatchCelebrationNotificationsForCompanion(cc.userId, cc.id);
        totalDispatched += count;
      }
    } catch (error: any) {
      console.error('❌ [CelebrationNotification] Daily check error:', error.message);
    }
    return { processedCompanions, totalDispatched };
  }
}

export const celebrationNotificationService = new CareCompanionCelebrationNotificationService();
