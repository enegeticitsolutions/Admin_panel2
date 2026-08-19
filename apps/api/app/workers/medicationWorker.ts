import { MedicationReminderService } from '../services/care_companion/MedicationReminderService';

/**
 * Medication Notification Worker
 * 
 * Runs every 60 seconds to inspect active medication schedules.
 * Dispatches on-time medication reminders at the exact scheduled time slot,
 * ensuring push notifications are sent via APNs (iOS) and FCM (Android).
 */
let workerInterval: any = null;

export function startMedicationWorker() {
  if (workerInterval) {
    console.log('[MedicationWorker] Worker already running.');
    return;
  }

  console.log('⏰ [MedicationWorker] Background medication notification worker started.');

  const reminderService = MedicationReminderService.getInstance();

  // Run immediately on boot, then every 60 seconds
  reminderService.checkAndDispatchReminders().catch((err) => {
    console.error('❌ [MedicationWorker] Initial execution error:', err);
  });

  workerInterval = setInterval(async () => {
    try {
      await reminderService.checkAndDispatchReminders();
    } catch (err) {
      console.error('❌ [MedicationWorker] Scheduled execution error:', err);
    }
  }, 60 * 1000);
}

export function stopMedicationWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('[MedicationWorker] Worker stopped.');
  }
}
