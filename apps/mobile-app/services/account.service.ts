import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

/**
 * AccountService — Object-Oriented Client Service for managing account
 * lifecycle and deactivation in the mobile app.
 */
export class AccountService {
  private static instance: AccountService;

  public static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  /**
   * Deactivates and soft-deletes the current authenticated user account.
   */
  public async deleteAccount(): Promise<DeleteAccountResponse> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return { success: false, message: 'Authentication token not found.' };
      }

      const response = await fetch(`${API_URL}/subscriber/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (response.ok && json.success) {
        // Clear all stored credentials and profile states
        await AsyncStorage.multiRemove([
          'userToken',
          'userData',
          'userRole',
          'selectedBeneficiaryId',
          'activeSubscription',
          'user_notification_preferences',
        ]);
        return {
          success: true,
          message: json.message || 'Your account has been deleted successfully.',
        };
      }

      return {
        success: false,
        message: json.message || 'Failed to delete account. Please try again.',
      };
    } catch (error: any) {
      console.error('[AccountService] deleteAccount error:', error);
      return {
        success: false,
        message: 'Network error while attempting to delete account.',
      };
    }
  }
}

export const accountService = AccountService.getInstance();
