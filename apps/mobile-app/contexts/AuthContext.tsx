/**
 * AuthContext — Centralized authentication state for the entire app.
 *
 * This is the Swiggy/Flipkart pattern:
 * - Login state is loaded ONCE from AsyncStorage on startup
 * - All screens consume `useAuth()` — no more inline AsyncStorage calls
 * - `login(token, userData)` persists the session and updates global state
 * - `logout()` clears the session and updates global state
 * - `switchRole(targetRole)` switches the active role for dual-role users
 *   without logging out (subscriber ↔ self-beneficiary)
 * - The root layout (_layout.tsx) uses `isLoggedIn` to decide which
 *   screen group to render, making back-navigation into auth impossible
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';
import { registerForPushNotifications, unregisterPushToken } from '@/services/notifications';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  phone: string;
  role: 'subscriber' | 'beneficiary' | 'care_companion' | 'volunteer' | string;
  [key: string]: any;
}

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  token: string | null;
  user: UserData | null;
  role: string | null;
  /** Roles the logged-in user is eligible to switch to (e.g. ['subscriber', 'beneficiary']) */
  availableRoles: string[];
  /** Beneficiary.id for this user's own self-profile (only when dual-role) */
  selfBeneficiaryId: string | null;
  /** Whether a role switch is in progress */
  isSwitchingRole: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, userData: UserData, availableRoles?: string[], selfBeneficiaryId?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (token: string, userData: UserData) => Promise<void>;
  /** Switch between subscriber ↔ beneficiary (self) roles — dual-role users only */
  switchRole: (targetRole: 'subscriber' | 'beneficiary') => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isLoggedIn: false,
    token: null,
    user: null,
    role: null,
    availableRoles: [],
    selfBeneficiaryId: null,
    isSwitchingRole: false,
  });

  // Load persisted session on startup — runs exactly ONCE
  useEffect(() => {
    const loadSession = async () => {
      try {
        const [storedToken, storedUser, storedAvailableRoles, storedSelfBenId] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('availableRoles'),
          AsyncStorage.getItem('selfBeneficiaryId'),
        ]);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as UserData;
          const parsedRoles: string[] = storedAvailableRoles ? JSON.parse(storedAvailableRoles) : [parsedUser.role];
          setState({
            isLoading: false,
            isLoggedIn: true,
            token: storedToken,
            user: parsedUser,
            role: parsedUser.role,
            availableRoles: parsedRoles,
            selfBeneficiaryId: storedSelfBenId || null,
            isSwitchingRole: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error('[AuthContext] Failed to load session:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadSession();
  }, []);

  // Called after successful OTP verify or password login
  const login = useCallback(async (
    token: string,
    userData: UserData,
    availableRoles: string[] = [userData.role],
    selfBeneficiaryId: string | null = null,
  ) => {
    const roles = availableRoles.length > 0 ? availableRoles : [userData.role];
    const promises: Promise<any>[] = [
      AsyncStorage.setItem('userToken', token),
      AsyncStorage.setItem('userData', JSON.stringify(userData)),
      AsyncStorage.setItem('availableRoles', JSON.stringify(roles)),
      AsyncStorage.setItem('selfBeneficiaryId', selfBeneficiaryId ?? ''),
    ];
    if (Platform.OS !== 'web') {
      promises.push(
        SecureStore.setItemAsync('secureUserToken', token),
        SecureStore.setItemAsync('secureUserData', JSON.stringify(userData))
      );
    }
    await Promise.all(promises);
    setState({
      isLoading: false,
      isLoggedIn: true,
      token,
      user: userData,
      role: userData.role,
      availableRoles: roles,
      selfBeneficiaryId,
      isSwitchingRole: false,
    });

    // Synchronize push notification token for this device with backend immediately
    registerForPushNotifications(token).catch(err => {
      console.warn('[AuthContext] Push token registration on login failed:', err);
    });
  }, []);

  // Updates current user profile details dynamically
  const updateUser = useCallback(async (token: string, userData: UserData) => {
    const promises: Promise<any>[] = [
      AsyncStorage.setItem('userToken', token),
      AsyncStorage.setItem('userData', JSON.stringify(userData)),
    ];
    if (Platform.OS !== 'web') {
      promises.push(
        SecureStore.setItemAsync('secureUserToken', token),
        SecureStore.setItemAsync('secureUserData', JSON.stringify(userData))
      );
    }
    await Promise.all(promises);
    setState(prev => ({
      ...prev,
      token,
      user: userData,
      role: userData.role,
    }));
  }, []);

  /**
   * switchRole
   *
   * Switches the active session role for a dual-role user (subscriber ↔ beneficiary self-profile).
   * Calls POST /api/auth/switch-role, receives a fresh JWT with the new role, and updates
   * AsyncStorage + context state. The root navigator then automatically routes to the right
   * dashboard based on `role`.
   */
  const switchRole = useCallback(async (targetRole: 'subscriber' | 'beneficiary') => {
    const currentToken = state.token;
    if (!currentToken) throw new Error('Not authenticated');

    setState(prev => ({ ...prev, isSwitchingRole: true }));

    try {
      const res = await fetch(`${API_URL}/auth/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ targetRole }),
      });

      const json = await res.json();
      if (!res.ok || !json.data?.token) {
        throw new Error(json.message || 'Failed to switch role');
      }

      const { token, user: newUser, availableRoles, selfBeneficiaryId } = json.data;
      const userData: UserData = { ...newUser };

      const roles: string[] = availableRoles && availableRoles.length > 0 ? availableRoles : [targetRole];

      const savePromises: Promise<any>[] = [
        AsyncStorage.setItem('userToken', token),
        AsyncStorage.setItem('userData', JSON.stringify(userData)),
        AsyncStorage.setItem('availableRoles', JSON.stringify(roles)),
        AsyncStorage.setItem('selfBeneficiaryId', selfBeneficiaryId ?? ''),
      ];
      if (Platform.OS !== 'web') {
        savePromises.push(
          SecureStore.setItemAsync('secureUserToken', token),
          SecureStore.setItemAsync('secureUserData', JSON.stringify(userData))
        );
      }
      await Promise.all(savePromises);

      setState({
        isLoading: false,
        isLoggedIn: true,
        token,
        user: userData,
        role: targetRole,
        availableRoles: roles,
        selfBeneficiaryId: selfBeneficiaryId ?? null,
        isSwitchingRole: false,
      });

      registerForPushNotifications(token).catch(err => {
        console.warn('[AuthContext] Push token sync on switchRole failed:', err);
      });
    } catch (err) {
      setState(prev => ({ ...prev, isSwitchingRole: false }));
      throw err;
    }
  }, [state.token]);

  // Called from logout button — clears everything
  const logout = useCallback(async () => {
    const currentToken = state.token;
    try {
      // Inform backend to clear fcmToken for this user session
      await unregisterPushToken(currentToken || undefined);
    } catch (e) {
      console.warn('[AuthContext] Failed to unregister push token during logout:', e);
    }

    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('availableRoles');
      await AsyncStorage.removeItem('selfBeneficiaryId');
      await AsyncStorage.clear();
    } catch (err) {
      console.error('[AuthContext] Failed to clear AsyncStorage:', err);
    }
    setState({
      isLoading: false,
      isLoggedIn: false,
      token: null,
      user: null,
      role: null,
      availableRoles: [],
      selfBeneficiaryId: null,
      isSwitchingRole: false,
    });
  }, [state.token]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    updateUser,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Use this hook in any screen to access auth state:
 *
 * const { isLoggedIn, user, role, login, logout, switchRole, availableRoles } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Check that _layout.tsx wraps screens with <AuthProvider>.');
  }
  return context;
}
