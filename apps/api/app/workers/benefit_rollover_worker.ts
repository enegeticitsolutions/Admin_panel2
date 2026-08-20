import prisma from '../core/database';
import { benefitPeriodManager } from '../services/benefit/BenefitPeriodManager';
import { PeriodStatus } from '@prisma/client';

/**
 * BenefitRolloverWorker (OOP Class)
 * 
 * Scheduled daemon task that checks active subscriptions daily at midnight,
 * transitions expired monthly periods, computes 1-month non-compounding rollovers,
 * and sends reminder notifications.
 */
export class BenefitRolloverWorker {
  private static instance: BenefitRolloverWorker;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  public static getInstance(): BenefitRolloverWorker {
    if (!BenefitRolloverWorker.instance) {
      BenefitRolloverWorker.instance = new BenefitRolloverWorker();
    }
    return BenefitRolloverWorker.instance;
  }

  /**
   * Scans and processes all subscriptions requiring period transition.
   */
  public async runDailyScan(): Promise<{ processedCount: number; errors: number }> {
    console.log('[BenefitRolloverWorker] Starting daily subscription benefit rollover scan...');
    const now = new Date();
    let processedCount = 0;
    let errors = 0;

    try {
      // Find all active periods whose end date has passed
      const expiredPeriods = await prisma.benefitPeriod.findMany({
        where: {
          status: PeriodStatus.ACTIVE,
          endDate: { lt: now },
          subscription: { isActive: true }
        },
        include: {
          subscription: true
        }
      });

      console.log(`[BenefitRolloverWorker] Found ${expiredPeriods.length} active periods ready for monthly rollover.`);

      for (const period of expiredPeriods) {
        try {
          const nextPeriod = await benefitPeriodManager.transitionToNextPeriod(period.subscriptionId);
          if (nextPeriod) {
            console.log(
              `[BenefitRolloverWorker] Successfully transitioned subscription ${period.subscriptionId} to Month ${nextPeriod.periodNumber}.`
            );
          } else {
            console.log(
              `[BenefitRolloverWorker] Subscription ${period.subscriptionId} reached end of total duration and is now closed.`
            );
          }
          processedCount++;
        } catch (subErr) {
          console.error(`[BenefitRolloverWorker] Error transitioning subscription ${period.subscriptionId}:`, subErr);
          errors++;
        }
      }
    } catch (err) {
      console.error('[BenefitRolloverWorker] Fatal error during daily scan:', err);
      errors++;
    }

    console.log(`[BenefitRolloverWorker] Scan complete. Processed: ${processedCount}, Errors: ${errors}`);
    return { processedCount, errors };
  }

  /**
   * Starts recurring worker (runs check every hour in background).
   */
  public startWorker(intervalMs: number = 3600000) {
    if (this.intervalTimer) return;
    console.log('[BenefitRolloverWorker] Benefit rollover daemon started.');
    // Run initial scan on startup
    this.runDailyScan().catch(() => {});
    this.intervalTimer = setInterval(() => {
      this.runDailyScan().catch(() => {});
    }, intervalMs);
  }

  public stopWorker() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
      console.log('[BenefitRolloverWorker] Benefit rollover daemon stopped.');
    }
  }
}

export const benefitRolloverWorker = BenefitRolloverWorker.getInstance();
