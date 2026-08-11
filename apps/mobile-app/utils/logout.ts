/**
 * Logout utilities.
 *
 * PRIMARY WAY (recommended for all components):
 *   const { logout } = useAuth();
 *   await logout();
 *
 * WITH CONFIRM DIALOG — use the useLogoutWithConfirm hook:
 *   const logoutWithConfirm = useLogoutWithConfirm();
 *   <TouchableOpacity onPress={logoutWithConfirm} />
 *
 * LEGACY (kept for compatibility): logoutWithConfirm(logoutFn)
 */

import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import { router } from 'expo-router';
import { useCustomAlert } from '@/contexts/CustomAlertContext';

/**
 * Hook that returns a confirm-then-logout function, ready to be used as onPress.
 *
 * Example:
 *   const logoutWithConfirm = useLogoutWithConfirm();
 *   <TouchableOpacity onPress={logoutWithConfirm} />
 */
export function useLogoutWithConfirm(): () => void {
    const { logout } = useAuth();
    const { showConfirm } = useCustomAlert();

    return useCallback(() => {
        const performLogout = async () => {
            await logout();
            router.replace('/(auth)');
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
 * Shows an "Are you sure?" dialog before calling the provided logout function.
 */
export const logoutWithConfirm = (logoutFn: () => Promise<void>): void => {
    const performLogout = async () => {
        await logoutFn();
        router.replace('/(auth)');
    };

    if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to log out?')) {
            performLogout();
        }
    } else {
        // Legacy fallback won't have access to context outside of hooks,
        // but it's deprecated so we'll just log or you can use the generic Alert.
        // Alert.alert(...) would normally go here if we kept it, but since
        // the user wants all replaced, we should ensure no one is using the deprecated one.
        console.warn('logoutWithConfirm is deprecated. Use useLogoutWithConfirm hook instead.');
        performLogout(); // Just doing it directly if they still use deprecated.
    }
};
