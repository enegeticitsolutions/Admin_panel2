export const MONTH_NAMES: readonly string[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const CELEBRATION_EVENT_TYPES = {
  BIRTHDAY: 'celebration_birthday',
} as const;

export const CELEBRATION_TYPES = {
  BIRTHDAY: 'Birthday',
} as const;

export const CELEBRATION_TIMINGS = {
  ONE_DAY_BEFORE: '1_day_before',
  ON_DAY: 'on_day',
} as const;

export interface CelebrationNotificationTemplateOptions {
  timing: typeof CELEBRATION_TIMINGS.ONE_DAY_BEFORE | typeof CELEBRATION_TIMINGS.ON_DAY;
  name: string;
  role: 'Primary' | 'Secondary';
  celebrationDate: string;
}

export function generateBirthdayNotificationTitle(
  options: Pick<CelebrationNotificationTemplateOptions, 'timing' | 'name'>
): string {
  if (options.timing === CELEBRATION_TIMINGS.ON_DAY) {
    return `🎉 Today is ${options.name}'s Birthday!`;
  }
  return `🎂 Tomorrow is ${options.name}'s Birthday!`;
}

export function generateBirthdayNotificationBody(
  options: CelebrationNotificationTemplateOptions
): string {
  if (options.timing === CELEBRATION_TIMINGS.ON_DAY) {
    return `Today is ${options.name}'s special day (${options.role} Beneficiary). Don't forget to wish them and make their day bright!`;
  }
  return `Tomorrow (${options.celebrationDate}) is ${options.name}'s Birthday. Plan your care visit and birthday wishes in advance!`;
}
