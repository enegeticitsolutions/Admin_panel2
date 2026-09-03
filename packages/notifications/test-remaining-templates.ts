import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { WhatsAppRegistry } from './src/registry/whatsapp.registry';
import { WhatsAppChannel } from './src/channels/whatsapp.channel';

const whatsAppChannel = new WhatsAppChannel();
const TARGET_PHONE = '9305951785';

// The 18 templates that were already verified delivered
const ALREADY_DELIVERED = new Set([
  'SUBSCRIPTION_REQUEST_SUBMITTED',
  'BENEF_PROFILE_CREATED',
  'CM_TRAINING_REMINDER',
  'RATING_FEEDBACK_PROMPT',
  'MEDICATION_REMINDER',
  'PAYMENT_SUCCESS',
  'SUBSCRIPTION_TERMINATED',
  'AMBULANCE_DISPATCHED',
  'EMERGENCY_RESOLVED',
  'CC_ASSIGNED',
  'CC_REALLOCATED',
  'CC_PERFORMANCE_RATING',
  'TELECONSULTATION_REQUESTED',
  'LAB_TEST_SCHEDULED',
  'PHYSIOTHERAPY_SCHEDULED',
  'MEDICINE_ORDER_PLACED',
  'APPOINTMENT_RESCHEDULED_CANCELLED',
  'INBASKET_MESSAGE',
]);

// High quality mock payloads matching MSG91 approved copies
const mockPayloads: Record<string, Record<string, string>> = {
  // ─── Group 1: Visit & Encounter ───
  VISIT_SCHEDULED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', date: 'Sept 4', time: '11:00 AM', address: 'Flat 402, Sector 62, Noida' },
  VISIT_REMINDER: { beneficiaryName: 'Mr. Ramesh Kumar', time: '11:00 AM' },
  VISIT_STARTED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', checkInTime: '11:02 AM' },
  MANUAL_CHECKIN_FLAGGED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', remarks: 'Client requested walk in community park' },
  VISIT_COMPLETED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', duration: '1 hr 15 mins' },
  DAILY_VISIT_SUMMARY: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar', mood: 'Cheerful', notes: 'Walked 500m, vitals normal, had breakfast' },
  MISSED_VISIT: { beneficiaryName: 'Mr. Ramesh Kumar' },
  CLINIC_VISIT_STARTED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', clinicName: 'Fortis Hospital Noida' },

  // ─── Group 2: Account, Onboarding & Auth ───
  OTP_LOGIN_SIGNUP: { otpCode: '482910' },
  SUBSCRIBER_ACCOUNT_CREATED: { subscriberName: 'Rajeev Kumar' },
  SUBSCRIPTION_ACTIVATED: { subscriberName: 'Rajeev Kumar', packageName: 'Silver Care', beneficiaryName: 'Mr. Ramesh Kumar', startDate: 'Sept 10, 2026' },
  CM_ONBOARDING_CLEARED: { ccName: 'Priya Sharma', fmName: 'Amit Verma' },
  PASSWORD_RESET_REQUEST: { resetCode: '719302' },

  // ─── Group 3: Vitals, Mood & Medication ───
  MOOD_ALERT: { beneficiaryName: 'Mr. Ramesh Kumar', mood: 'Sad', ccName: 'Priya Sharma' },
  WELLBEING_CHECK_RECOMMENDED: { beneficiaryName: 'Mr. Ramesh Kumar' },
  HAPPINESS_SCORE_UPDATE: { beneficiaryName: 'Mr. Ramesh Kumar', newScore: '58' },
  WEEKLY_WELLBEING_DIGEST: { beneficiaryName: 'Mr. Ramesh Kumar' },
  VITALS_ALERT: { beneficiaryName: 'Mr. Ramesh Kumar', vitalType: 'Blood Pressure', reading: '155/95 mmHg', ccName: 'Priya Sharma' },
  MEDICATION_MISSED: { beneficiaryName: 'Mr. Ramesh Kumar', medicationName: 'Metformin 500mg', scheduledTime: '1:00 PM' },
  EMR_VITALS_REPORT: { beneficiaryName: 'Mr. Ramesh Kumar', month: 'August 2026' },

  // ─── Group 4: Subscriptions, Renewals & Billing ───
  SCHEDULE_CHANGE_REQUEST: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar', requestedDate: 'Sept 8, 2026' },
  SCHEDULE_CHANGE_DECISION: { decision: 'Approved', beneficiaryName: 'Mr. Ramesh Kumar', newDateTime: 'Sept 8 at 10:00 AM' },
  SUBSCRIPTION_RENEWAL_REMINDER: { subscriberName: 'Rajeev Kumar', packageName: 'Silver Care', beneficiaryName: 'Mr. Ramesh Kumar', expiryDate: 'Sept 15, 2026' },
  RENEWAL_PAYMENT_LINK: { beneficiaryName: 'Mr. Ramesh Kumar', packageName: 'Silver Care', paymentLink: 'https://pay.maihoonna.com/renew/sub-10293' },
  PAYMENT_SUCCESSFUL: { amount: '₹4,999', beneficiaryName: 'Mr. Ramesh Kumar', packageName: 'Silver Care' },
  PAYMENT_FAILED: { amount: '₹4,999', beneficiaryName: 'Mr. Ramesh Kumar', paymentLink: 'https://pay.maihoonna.com/retry/pay-8821' },
  SUBSCRIPTION_HOURS_LOW: { beneficiaryName: 'Mr. Ramesh Kumar', percentConsumed: '85' },
  SUBSCRIPTION_HOURS_EXHAUSTED: { beneficiaryName: 'Mr. Ramesh Kumar' },
  FREE_TRIAL_ENDING: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar', endDate: 'Sept 6, 2026' },

  // ─── Group 5: Emergency & Field Operations ───
  EMERGENCY_TRIGGERED: { beneficiaryName: 'Mr. Ramesh Kumar', timestamp: '1:45 PM', location: 'Flat 402, Sector 62, Noida' },
  EMERGENCY_ACKNOWLEDGED: { beneficiaryName: 'Mr. Ramesh Kumar' },
  NEW_CC_ASSIGNED_TO_FM: { ccName: 'Priya Sharma', date: 'Sept 1, 2026' },
  CC_DEACTIVATED: { ccName: 'Priya Sharma', lastWorkingDate: 'Sept 30, 2026', reason: 'Relocation' },
  BIRTHDAY_REMINDER: { beneficiaryName: 'Mr. Ramesh Kumar', date: 'Sept 12' },
  CC_ABSENCE_REPORTED: { ccName: 'Priya Sharma', date: 'Tomorrow (Sept 5)', count: '2' },
  BGV_STATUS_UPDATE: { candidateName: 'Rahul Verma', status: 'Verified & Cleared' },
  WEEKLY_ZONE_UTILISATION: { zoneName: 'Noida Zone 1', weekStartDate: 'Sept 1, 2026' },

  // ─── Group 6: Community & Admin Operations ───
  SAATHI_INTERACTION_REQUEST: { beneficiaryName: 'Mr. Ramesh Kumar' },
  SAATHI_VISIT_COMPLETED: { beneficiaryName: 'Mr. Ramesh Kumar', credits: '20' },
  HOBBY_CIRCLE_MESSAGE: { senderName: 'Captain Sharma', hobby: 'Gardening & Bonsai' },
  COMMUNITY_EVENT_UPCOMING: { eventName: 'Seniors Morning Yoga & Chai', date: 'Sept 7', venue: 'Community Club Sector 62' },
  LEGACY_CIRCLE_BIO_PUBLISHED: { beneficiaryName: 'Mr. Ramesh Kumar' },
  SUBSCRIPTION_PENDING_CSA: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar' },
  SUBSCRIPTION_PENDING_OM: { subscriptionId: 'SUB-9941', beneficiaryName: 'Mr. Ramesh Kumar' },
  PARTNER_ENROLMENT_REQUEST: { partnerName: 'HealthFirst Diagnostics', partnerType: 'Pathology Lab' },
  PARTNER_ENROLMENT_APPROVED: { partnerName: 'HealthFirst Diagnostics', date: 'Sept 1, 2026' },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRemainingBatch(groupName?: string) {
  console.log('========================================================================');
  console.log(`🔍 TESTING REMAINING UNDELIVERED TEMPLATES`);
  console.log(`🎯 Recipient Phone: ${TARGET_PHONE}`);
  console.log(`⏱️ Pacing: 2.0s delay between dispatches (anti-spam protection)`);
  console.log('========================================================================\n');

  const remainingEvents = Object.entries(WhatsAppRegistry).filter(([event]) => !ALREADY_DELIVERED.has(event));
  console.log(`Found ${remainingEvents.length} remaining templates to test.\n`);

  for (const [eventKey, config] of remainingEvents) {
    const payload = mockPayloads[eventKey] || {};
    const orderedVars = config.body.map((k) => String(payload[k] || 'Test'));

    process.stdout.write(`Sending [${eventKey}] (template: "${config.template}")... `);

    try {
      const response = await whatsAppChannel.send({
        to: TARGET_PHONE,
        templateName: config.template,
        variables: orderedVars,
      });

      if (response.success) {
        console.log(`✅ Accepted by MSG91`);
      } else {
        console.log(`❌ Failed: ${response.error}`);
      }
    } catch (err: any) {
      console.log(`❌ Exception: ${err.message}`);
    }

    // 2-second delay between dispatches so Meta WhatsApp doesn't flag as spam
    await delay(2000);
  }

  console.log('\n========================================================================');
  console.log('🏁 Batch test run finished. Check your WhatsApp for incoming messages.');
  console.log('========================================================================');
}

// Check if group argument provided, otherwise run all remaining
const targetGroup = process.argv[2];
runRemainingBatch(targetGroup);
