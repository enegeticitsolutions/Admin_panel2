import prisma from '../../core/database';
import { Prisma, UsageType } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { generateUUID } from '../../utils/helpers';

export type TxClient = Prisma.TransactionClient;

/**
 * BenefitLedgerEngine (OOP Class)
 * 
 * Manages immutable audit ledger records (BenefitUsage) and updates
 * real-time period balances with strict validation and FIFO consumption priority.
 */
export class BenefitLedgerEngine {
  private static instance: BenefitLedgerEngine;

  private constructor() {}

  public static getInstance(): BenefitLedgerEngine {
    if (!BenefitLedgerEngine.instance) {
      BenefitLedgerEngine.instance = new BenefitLedgerEngine();
    }
    return BenefitLedgerEngine.instance;
  }

  /**
   * Deducts units from the active benefit period balance and logs immutable ledger entry.
   */
  public async deductUnits(
    opts: {
      subscriptionId: string;
      periodId: string;
      benefitId: string;
      quantity: number;
      usageType: UsageType;
      referenceId?: string;
      notes?: string;
      performedByUserId?: string;
    },
    client: TxClient = prisma
  ): Promise<any> {
    const qty = Math.max(1, Math.floor(opts.quantity || 1));

    const balance = await client.benefitPeriodBalance.findUnique({
      where: {
        periodId_benefitId: {
          periodId: opts.periodId,
          benefitId: opts.benefitId,
        }
      }
    });

    if (!balance) {
      throw new ApiError(404, 'Benefit balance for the active period not found');
    }

    if (balance.remainingQuantity < qty) {
      throw new ApiError(
        403,
        `Insufficient balance for ${balance.snapshotName}. Requested: ${qty}, Remaining in current period: ${balance.remainingQuantity}`
      );
    }

    const balanceBefore = balance.remainingQuantity;
    const balanceAfter = balanceBefore - qty;
    const usedAfter = balance.usedQuantity + qty;

    // 1. Record immutable usage ledger entry
    const usage = await client.benefitUsage.create({
      data: {
        id: generateUUID(),
        subscriptionId: opts.subscriptionId,
        periodId: opts.periodId,
        benefitId: opts.benefitId,
        quantity: qty,
        usageType: opts.usageType,
        referenceId: opts.referenceId || null,
        balanceBefore,
        balanceAfter,
        notes: opts.notes || null,
        performedByUserId: opts.performedByUserId || null,
      }
    });

    // 2. Update period balance
    const updatedBalance = await client.benefitPeriodBalance.update({
      where: { id: balance.id },
      data: {
        usedQuantity: usedAfter,
        remainingQuantity: balanceAfter,
      }
    });

    return { usage, updatedBalance };
  }

  /**
   * Refunds/restores units back to the period balance (e.g. on visit cancellation).
   */
  public async refundUnits(
    opts: {
      subscriptionId: string;
      periodId: string;
      benefitId: string;
      quantity: number;
      referenceId?: string;
      notes?: string;
      performedByUserId?: string;
    },
    client: TxClient = prisma
  ): Promise<any> {
    const qty = Math.max(1, Math.floor(opts.quantity || 1));

    const balance = await client.benefitPeriodBalance.findUnique({
      where: {
        periodId_benefitId: {
          periodId: opts.periodId,
          benefitId: opts.benefitId,
        }
      }
    });

    if (!balance) {
      throw new ApiError(404, 'Benefit balance for the active period not found');
    }

    const balanceBefore = balance.remainingQuantity;
    const balanceAfter = Math.min(balance.totalAllocation, balanceBefore + qty);
    const usedAfter = Math.max(0, balance.usedQuantity - qty);

    // 1. Record refund in usage ledger
    const usage = await client.benefitUsage.create({
      data: {
        id: generateUUID(),
        subscriptionId: opts.subscriptionId,
        periodId: opts.periodId,
        benefitId: opts.benefitId,
        quantity: -qty, // negative indicates restore
        usageType: UsageType.CANCELLATION_REFUND,
        referenceId: opts.referenceId || null,
        balanceBefore,
        balanceAfter,
        notes: opts.notes || 'Restored units from cancelled activity',
        performedByUserId: opts.performedByUserId || null,
      }
    });

    // 2. Update period balance
    const updatedBalance = await client.benefitPeriodBalance.update({
      where: { id: balance.id },
      data: {
        usedQuantity: usedAfter,
        remainingQuantity: balanceAfter,
      }
    });

    return { usage, updatedBalance };
  }

  /**
   * Retrieves full usage ledger history for a subscription.
   */
  public async getSubscriptionLedger(
    subscriptionId: string,
    client: TxClient = prisma
  ): Promise<any[]> {
    return await client.benefitUsage.findMany({
      where: { subscriptionId },
      include: {
        period: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const benefitLedgerEngine = BenefitLedgerEngine.getInstance();
