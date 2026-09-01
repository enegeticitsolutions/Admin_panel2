/**
 * Logout utilities.
 *
 * PRIMARY WAY:
 *   const { logout } = useAuth();
 *   await logout();
 *
 * WITH CONFIRM DIALOG:
 *   const logoutWithConfirm = useLogoutWithConfirm();
 *   <TouchableOpacity onPress={logoutWithConfirm} />
 */

import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import { useCustomAlert } from '@/contexts/CustomAlertContext';
import { router } from 'expo-router';

/**
 * Hook that returns a confirm-then-logout function, ready to be used as onPress.
 */
export function useLogoutWithConfirm(): () => void {
  const { logout } = useAuth();
  const { showConfirm } = useCustomAlert();

  return useCallback(() => {
    const performLogout = () => {
      // Calling logout() immediately transitions AuthContext state,
      // which automatically navigates back to the (auth) group via the root navigator.
      logout();
      setTimeout(() => {
        router.replace('/(auth)');
      }, 0);
    };

    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Are you sure you want to log out?')) {
        performLogout();
      }
    } else {
      showConfirm('Log Out', 'Are you sure you want to log out?', performLogout, 'Log Out');
    }
  }, [logout, showConfirm]);
}

/**
 * @deprecated Use `useLogoutWithConfirm()` hook instead.
 */
export const logoutWithConfirm = (logoutFn: () => Promise<void>): void => {
  const performLogout = () => {
    logoutFn();
  };

  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to log out?')) {
      performLogout();
    }
  } else {
    performLogout();
  }
};
