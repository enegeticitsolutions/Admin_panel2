/**
 * navigationHelper.ts
 *
 * @deprecated Use `NavigationService` from `@/utils/NavigationService` directly.
 *
 * This file re-exports from the OOP NavigationService for backward compatibility.
 * All new code should import from NavigationService directly:
 *
 *   import { NavigationService } from '@/utils/NavigationService';
 *   await NavigationService.instance.navigate({ ... });
 */
export {
  openMapsNavigation,
  formatBeneficiaryAddress,
  NavigationService,
} from './NavigationService';

export type { BeneficiaryAddress, NavigationUrlResult } from './NavigationService';
