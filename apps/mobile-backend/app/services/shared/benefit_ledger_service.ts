import prisma from '../../core/database';
import { ApiError } from '../../utils/ApiError';
import { ReservationStatus, TransactionType, Prisma } from '@prisma/client';

export type TxClient = Prisma.TransactionClient;

/**
 * Core Benefit Ledger & Reservation Service
 *
 * Implements bank-account style accounting for subscription benefits:
 *  - reserveBenefit(): HELD reservation (-available, +reserved)
 *  - consumeReservation(): HELD -> CONSUMED (-reserved, +used)
 *  - releaseReservation(): HELD -> RELEASED (-reserved, +available)
 *  - adjustBalance(): Admin ledger adjustment
 */
export const benefitLedgerService = {
  /**
   * 1. Reserve benefit units (HELD) for an upcoming visit or Emergency SOS.
   * Decrements availableUnits, increments reservedUnits, creates BenefitReservation & BenefitTransaction.
   */
  async reserveBenefit(
    opts: {
      balanceId: string;
      beneficiaryId: string;
      units?: number;
      emergencyRequestId?: string;
      sathiRequestId?: string;
      visitId?: string;
      reason: string;
      performedByUserId?: string;
      expiresAt?: Date;
    },
    client: TxClient = prisma
  ) {
    const units = opts.units || 1;

    // Fetch current balance
    const balance = await client.subscriptionBenefitBalance.findUnique({
      where: { id: opts.balanceId },
    });

    if (!balance) {
      throw new ApiError(404, 'Subscription benefit balance not found');
    }

    const available = Math.max(0, balance.totalUnits - balance.reservedUnits - balance.usedUnits);
    if (available < units) {
      throw new ApiError(403, `Insufficient benefit units available. Requested: ${units}, Available: ${available}`);
    }

    const reservedBefore = balance.reservedUnits;
    const usedBefore = balance.usedUnits;
    const totalBefore = balance.totalUnits;
    const availableBefore = available;

    const reservedAfter = reservedBefore + units;
    const usedAfter = usedBefore;
    const totalAfter = totalBefore;
    const availableAfter = availableBefore - units;

    // Create reservation record (HELD)
    const reservation = await client.benefitReservation.create({
      data: {
        balanceId: opts.balanceId,
        beneficiaryId: opts.beneficiaryId,
        units,
        status: ReservationStatus.HELD,
        emergencyRequestId: opts.emergencyRequestId || null,
        sathiRequestId: opts.sathiRequestId || null,
        visitId: opts.visitId || null,
        expiresAt: opts.expiresAt || null,
      },
    });

    // Record immutable ledger transaction
    await client.benefitTransaction.create({
      data: {
        balanceId: opts.balanceId,
        reservationId: reservation.id,
        transactionType: TransactionType.RESERVED,
        units: -units, // reservation reduces available units
        totalBefore,
        totalAfter,
        reservedBefore,
        reservedAfter,
        usedBefore,
        usedAfter,
        availableBefore,
        availableAfter,
        reason: opts.reason,
        performedByUserId: opts.performedByUserId || null,
      },
    });

    // Update cached balance table
    await client.subscriptionBenefitBalance.update({
      where: { id: opts.balanceId },
      data: {
        reservedUnits: reservedAfter,
        availableUnits: availableAfter,
      },
    });

    return reservation;
  },

  /**
   * 2. Consume reservation (HELD -> CONSUMED) on visit completion or emergency resolution.
   * Decrements reservedUnits, increments usedUnits, records CONSUMED transaction.
   */
  async consumeReservation(
    opts: {
      reservationId: string;
      reason: string;
      performedByUserId?: string;
    },
    client: TxClient = prisma
  ) {
    const reservation = await client.benefitReservation.findUnique({
      where: { id: opts.reservationId },
      include: { balance: true },
    });

    if (!reservation) {
      throw new ApiError(404, 'Benefit reservation not found');
    }

    if (reservation.status === ReservationStatus.CONSUMED) {
      return reservation; // Already consumed, idempotent return
    }

    if (reservation.status !== ReservationStatus.HELD) {
      throw new ApiError(400, `Cannot consume reservation in status "${reservation.status}"`);
    }

    const units = reservation.units;
    const balance = reservation.balance;

    const reservedBefore = balance.reservedUnits;
    const usedBefore = balance.usedUnits;
    const totalBefore = balance.totalUnits;
    const availableBefore = Math.max(0, totalBefore - reservedBefore - usedBefore);

    const reservedAfter = Math.max(0, reservedBefore - units);
    const usedAfter = usedBefore + units;
    const totalAfter = totalBefore;
    const availableAfter = availableBefore; // available doesn't change when consuming reserved units

    // Update reservation status to CONSUMED
    const updatedReservation = await client.benefitReservation.update({
      where: { id: reservation.id },
      data: { status: ReservationStatus.CONSUMED },
    });

    // Record immutable ledger transaction
    await client.benefitTransaction.create({
      data: {
        balanceId: balance.id,
        reservationId: reservation.id,
        transactionType: TransactionType.CONSUMED,
        units,
        totalBefore,
        totalAfter,
        reservedBefore,
        reservedAfter,
        usedBefore,
        usedAfter,
        availableBefore,
        availableAfter,
        reason: opts.reason,
        performedByUserId: opts.performedByUserId || null,
      },
    });

    // Update cached balance table
    await client.subscriptionBenefitBalance.update({
      where: { id: balance.id },
      data: {
        reservedUnits: reservedAfter,
        usedUnits: usedAfter,
        availableUnits: availableAfter,
      },
    });

    return updatedReservation;
  },

  /**
   * 3. Release reservation (HELD -> RELEASED) on cancellation, rejection, or expired hold.
   * Decrements reservedUnits, increments availableUnits, records RELEASED transaction.
   */
  async releaseReservation(
    opts: {
      reservationId: string;
      reason: string;
      performedByUserId?: string;
    },
    client: TxClient = prisma
  ) {
    const reservation = await client.benefitReservation.findUnique({
      where: { id: opts.reservationId },
      include: { balance: true },
    });

    if (!reservation) {
      throw new ApiError(404, 'Benefit reservation not found');
    }

    if (reservation.status === ReservationStatus.RELEASED) {
      return reservation; // Already released
    }

    if (reservation.status !== ReservationStatus.HELD) {
      throw new ApiError(400, `Cannot release reservation in status "${reservation.status}"`);
    }

    const units = reservation.units;
    const balance = reservation.balance;

    const reservedBefore = balance.reservedUnits;
    const usedBefore = balance.usedUnits;
    const totalBefore = balance.totalUnits;
    const availableBefore = Math.max(0, totalBefore - reservedBefore - usedBefore);

    const reservedAfter = Math.max(0, reservedBefore - units);
    const usedAfter = usedBefore;
    const totalAfter = totalBefore;
    const availableAfter = availableBefore + units;

    // Update reservation status to RELEASED
    const updatedReservation = await client.benefitReservation.update({
      where: { id: opts.reservationId },
      data: { status: ReservationStatus.RELEASED },
    });

    // Record immutable ledger transaction
    await client.benefitTransaction.create({
      data: {
        balanceId: balance.id,
        reservationId: reservation.id,
        transactionType: TransactionType.RELEASED,
        units: +units, // release restores available units
        totalBefore,
        totalAfter,
        reservedBefore,
        reservedAfter,
        usedBefore,
        usedAfter,
        availableBefore,
        availableAfter,
        reason: opts.reason,
        performedByUserId: opts.performedByUserId || null,
      },
    });

    // Update cached balance table
    await client.subscriptionBenefitBalance.update({
      where: { id: balance.id },
      data: {
        reservedUnits: reservedAfter,
        availableUnits: availableAfter,
      },
    });

    return updatedReservation;
  },

  /**
   * 4. Admin Manual Balance Adjustment with Audit Trail
   */
  async adjustBalance(
    opts: {
      balanceId: string;
      deltaTotal?: number;
      deltaUsed?: number;
      reason: string;
      performedByUserId: string;
    },
    client: TxClient = prisma
  ) {
    const balance = await client.subscriptionBenefitBalance.findUnique({
      where: { id: opts.balanceId },
    });

    if (!balance) {
      throw new ApiError(404, 'Benefit balance not found');
    }

    const totalBefore = balance.totalUnits;
    const reservedBefore = balance.reservedUnits;
    const usedBefore = balance.usedUnits;
    const availableBefore = Math.max(0, totalBefore - reservedBefore - usedBefore);

    const totalAfter = Math.max(0, totalBefore + (opts.deltaTotal || 0));
    const usedAfter = Math.max(0, usedBefore + (opts.deltaUsed || 0));
    const reservedAfter = reservedBefore;
    const availableAfter = Math.max(0, totalAfter - reservedAfter - usedAfter);

    await client.benefitTransaction.create({
      data: {
        balanceId: opts.balanceId,
        transactionType: TransactionType.ADJUSTED,
        units: availableAfter - availableBefore,
        totalBefore,
        totalAfter,
        reservedBefore,
        reservedAfter,
        usedBefore,
        usedAfter,
        availableBefore,
        availableAfter,
        reason: opts.reason,
        performedByUserId: opts.performedByUserId,
      },
    });

    return client.subscriptionBenefitBalance.update({
      where: { id: opts.balanceId },
      data: {
        totalUnits: totalAfter,
        usedUnits: usedAfter,
        availableUnits: availableAfter,
      },
    });
  }
};
