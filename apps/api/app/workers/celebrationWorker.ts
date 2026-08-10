import { celebrationNotificationService } from '../services/care_companion/celebration_notification_service';
import { config } from '../core/config';

/**
 * Background worker that runs periodic checks for upcoming birthdays
 * (1 day before & on the day) to send push notifications to Care Companions.
 */
export function startCelebrationWorker() {
  console.log('🎂 [CelebrationWorker] Background celebration notification worker started.');

  // Run initial check on server start
  celebrationNotificationService.runDailyCelebrationNotificationCheck();

  // Run periodic check using configured interval
  setInterval(() => {
    celebrationNotificationService.runDailyCelebrationNotificationCheck();
  }, config.notifications.checkIntervalMs);
}
