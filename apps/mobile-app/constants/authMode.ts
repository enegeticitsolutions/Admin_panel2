/**
 * Auth Mode Feature Flag
 *
 * Controls whether password-based login and registration are available.
 *
 * Staging / Local Dev  → EXPO_PUBLIC_ENABLE_PASSWORD_LOGIN=true
 * Production           → EXPO_PUBLIC_ENABLE_PASSWORD_LOGIN=false (or unset)
 *
 * Usage:
 *   import { IS_PASSWORD_LOGIN_ENABLED } from '@/constants/authMode';
 *   if (IS_PASSWORD_LOGIN_ENABLED) { ... show password UI ... }
 */
export const IS_PASSWORD_LOGIN_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_PASSWORD_LOGIN === 'true';
