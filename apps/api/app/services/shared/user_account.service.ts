import prisma from '../../core/database';
import { ApiError } from '../../utils/ApiError';

export interface DeleteAccountResult {
  success: boolean;
  message: string;
}

/**
 * UserAccountService — Object-Oriented Service for managing user lifecycle,
 * account status, and account deactivation/deletion.
 */
export class UserAccountService {
  private static instance: UserAccountService;

  public static getInstance(): UserAccountService {
    if (!UserAccountService.instance) {
      UserAccountService.instance = new UserAccountService();
    }
    return UserAccountService.instance;
  }

  /**
   * Soft-deletes a user's account by marking them inactive.
   * Clears FCM push token and refresh tokens so the user is signed out across all devices.
   */
  public async deleteAccount(userId: string): Promise<DeleteAccountResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User account not found.');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Soft-delete the user with explicit 'deleted' status and deletedAt timestamp
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          status: 'deleted',
          deletedAt: new Date(),
          fcmToken: null,
          refreshToken: null,
        },
      });

      // 2. If this user has a linked Beneficiary record, mark it as deleted
      const beneficiary = await tx.beneficiary.findFirst({
        where: {
          OR: [{ userId }, { id: userId }],
        },
      });

      if (beneficiary) {
        await tx.beneficiary.update({
          where: { id: beneficiary.id },
          data: {
            isActive: false,
            status: 'deleted',
          },
        });

        // Deactivate active subscriptions for this beneficiary
        await tx.subscription.updateMany({
          where: { beneficiaryId: beneficiary.id, isActive: true },
          data: { isActive: false },
        });
      }

      // 3. If this user is a subscriber, deactivate any of their owned subscriptions
      await tx.subscription.updateMany({
        where: { subscriberId: userId, isActive: true },
        data: { isActive: false },
      });

      // 4. Log security activity
      try {
        await tx.activityLog.create({
          data: {
            userId,
            type: 'SECURITY',
            action: 'ACCOUNT_DELETED',
            details: {
              reason: 'User requested account deletion',
              role: user.role,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (e) {
        console.warn('[UserAccountService] Could not log deletion activity:', e);
      }
    });

    return {
      success: true,
      message: 'Account has been deleted and deactivated successfully.',
    };
  }

  /**
   * Retrieves the current user status.
   */
  public async getUserStatus(userId: string): Promise<{ isActive: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    return { isActive: user.isActive };
  }
}

export const userAccountService = UserAccountService.getInstance();
