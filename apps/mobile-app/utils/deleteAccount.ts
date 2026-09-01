import { Platform, Alert } from 'react-native';
import { useCallback } from 'react';
import { router } from 'expo-router';
import { accountService } from '@/services/account.service';
import { useCustomAlert } from '@/contexts/CustomAlertContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook that returns a confirm-then-delete function for account deletion.
 *
 * Example:
 *   const deleteAccountWithConfirm = useDeleteAccountWithConfirm();
 *   <TouchableOpacity onPress={deleteAccountWithConfirm} />
 */
export function useDeleteAccountWithConfirm(onBeforeDelete?: () => void): () => void {
  const { showConfirm, showAlert } = useCustomAlert();
  const { logout } = useAuth();

  return useCallback(() => {
    const performDelete = async () => {
      if (onBeforeDelete) onBeforeDelete();
      try {
        const result = await accountService.deleteAccount();
        if (result.success) {
          if (Platform.OS === 'web') {
            window.alert('Your account has been deactivated and deleted successfully.');
          } else {
            showAlert('Account Deleted', 'Your account has been deactivated and deleted successfully.', 'success');
          }
          logout();
          setTimeout(() => {
            router.replace('/(auth)');
          }, 0);
        } else {
          if (Platform.OS === 'web') {
            window.alert(result.message || 'Failed to delete account.');
          } else {
            showAlert('Error', result.message || 'Failed to delete account.', 'error');
          }
        }
      } catch (error: any) {
        console.error('[useDeleteAccountWithConfirm] error:', error);
        showAlert('Error', 'An error occurred while deleting your account. Please try again.', 'error');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete your account? This will delete your account and log you out immediately.')) {
        performDelete();
      }
    } else {
      showConfirm(
        'Delete Account',
        'Are you sure you want to delete your account? This will delete your account and log you out immediately.',
        performDelete,
        'Delete'
      );
    }
  }, [showConfirm, showAlert, onBeforeDelete]);
}

/**
 * Reusable standalone helper function to trigger account deletion with confirmation.
 */
export const deleteAccountWithConfirm = async (onSuccess?: () => void): Promise<void> => {
  const performDelete = async () => {
    const result = await accountService.deleteAccount();
    if (result.success) {
      if (onSuccess) onSuccess();
      router.replace('/(auth)');
    } else {
      Alert.alert('Error', result.message || 'Failed to delete account.');
    }
  };

  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to delete your account? This will delete your account and log you out immediately.')) {
      await performDelete();
    }
  } else {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will delete your account and log you out immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]
    );
  }
};
