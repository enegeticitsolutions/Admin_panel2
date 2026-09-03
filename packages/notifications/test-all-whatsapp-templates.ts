import { config } from 'dotenv';
import path from 'path';

// Load environment variables from apps/api/.env
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { WhatsAppRegistry } from './src/registry/whatsapp.registry';
import { WhatsAppChannel } from './src/channels/whatsapp.channel';

const whatsAppChannel = new WhatsAppChannel();
const TARGET_PHONE = '9305951785';

// Master mock variable catalog matching each event schema
const mockPayloads: Record<string, Record<string, string>> = {
  // Onboarding & Account
  OTP_LOGIN_SIGNUP: { otpCode: '482910' },
  SUBSCRIBER_ACCOUNT_CREATED: { subscriberName: 'Rajeev Kumar' },
  SUBSCRIPTION_REQUEST_SUBMITTED: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar', packageName: 'Silver Care' },
  SUBSCRIPTION_ACTIVATED: { subscriberName: 'Rajeev Kumar', packageName: 'Silver Care', beneficiaryName: 'Mr. Ramesh Kumar', startDate: 'Sept 10, 2026' },
  BENEF_PROFILE_CREATED: { beneficiaryName: 'Mr. Ramesh Kumar', subscriberName: 'Rajeev Kumar' },
  CM_ONBOARDING_CLEARED: { ccName: 'Priya Sharma', fmName: 'Amit Verma' },
  CM_TRAINING_REMINDER: { ccName: 'Priya Sharma', moduleName: 'Elderly Mobility & Fall Prevention', date: 'Sept 5', timeLocation: '10:00 AM, Training Center A' },
  PASSWORD_RESET_REQUEST: { resetCode: '719302' },

  // Visit & Encounter
  VISIT_SCHEDULED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', date: 'Thursday, Sept 4', time: '11:00 AM', address: 'Flat 402, Sector 62, Noida' },
  VISIT_REMINDER: { beneficiaryName: 'Mr. Ramesh Kumar', time: '11:00 AM' },
  VISIT_STARTED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', checkInTime: '11:02 AM' },
  MANUAL_CHECKIN_FLAGGED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', remarks: 'Client requested visit in park outside geofence' },
  VISIT_COMPLETED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', duration: '1 hr 15 mins' },
  DAILY_VISIT_SUMMARY: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar', mood: 'Cheerful', notes: 'Walked 500m, vitals normal, took lunch smoothly' },
  MISSED_VISIT: { beneficiaryName: 'Mr. Ramesh Kumar' },
  CLINIC_VISIT_STARTED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', clinicName: 'Fortis Hospital Noida' },
  RATING_FEEDBACK_PROMPT: { ccName: 'Priya Sharma' },

  // Mood & Happiness Score
  MOOD_ALERT: { beneficiaryName: 'Mr. Ramesh Kumar', mood: 'Sad', ccName: 'Priya Sharma' },
  WELLBEING_CHECK_RECOMMENDED: { beneficiaryName: 'Mr. Ramesh Kumar' },
  HAPPINESS_SCORE_UPDATE: { beneficiaryName: 'Mr. Ramesh Kumar', newScore: '58' },
  WEEKLY_WELLBEING_DIGEST: { beneficiaryName: 'Mr. Ramesh Kumar' },

  // Vitals & Medication
  VITALS_ALERT: { beneficiaryName: 'Mr. Ramesh Kumar', vitalType: 'Blood Pressure', reading: '155/95 mmHg', ccName: 'Priya Sharma' },
  MEDICATION_REMINDER: { beneficiaryName: 'Mr. Ramesh Kumar', medicationName: 'Amlodipine 5mg', dosage: '1 tablet after breakfast' },
  MEDICATION_MISSED: { beneficiaryName: 'Mr. Ramesh Kumar', medicationName: 'Metformin 500mg', scheduledTime: '1:00 PM' },
  EMR_VITALS_REPORT: { beneficiaryName: 'Mr. Ramesh Kumar', month: 'August 2026' },

  // Scheduling & Subscription
  SCHEDULE_CHANGE_REQUEST: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar', requestedDate: 'Sept 8, 2026' },
  SCHEDULE_CHANGE_DECISION: { decision: 'Approved', beneficiaryName: 'Mr. Ramesh Kumar', newDateTime: 'Sept 8 at 10:00 AM' },
  SUBSCRIPTION_RENEWAL_REMINDER: { subscriberName: 'Rajeev Kumar', packageName: 'Silver Care', beneficiaryName: 'Mr. Ramesh Kumar', expiryDate: 'Sept 15, 2026' },
  RENEWAL_PAYMENT_LINK: { beneficiaryName: 'Mr. Ramesh Kumar', packageName: 'Silver Care', paymentLink: 'https://pay.maihoonna.com/renew/sub-10293' },
  PAYMENT_SUCCESS: { amount: '₹4,999', beneficiaryName: 'Mr. Ramesh Kumar', packageName: 'Silver Care' },
  PAYMENT_SUCCESSFUL: { amount: '₹4,999', beneficiaryName: 'Mr. Ramesh Kumar', packageName: 'Silver Care' },
  PAYMENT_FAILED: { amount: '₹4,999', beneficiaryName: 'Mr. Ramesh Kumar', paymentLink: 'https://pay.maihoonna.com/retry/pay-8821' },
  SUBSCRIPTION_HOURS_LOW: { beneficiaryName: 'Mr. Ramesh Kumar', percentConsumed: '85' },
  SUBSCRIPTION_HOURS_EXHAUSTED: { beneficiaryName: 'Mr. Ramesh Kumar' },
  SUBSCRIPTION_TERMINATED: { beneficiaryName: 'Mr. Ramesh Kumar', effectiveDate: 'Sept 30, 2026' },
  FREE_TRIAL_ENDING: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar', endDate: 'Sept 6, 2026' },

  // Emergency
  EMERGENCY_TRIGGERED: { beneficiaryName: 'Mr. Ramesh Kumar', timestamp: '1:45 PM', location: 'Flat 402, Sector 62, Noida' },
  EMERGENCY_ACKNOWLEDGED: { beneficiaryName: 'Mr. Ramesh Kumar' },
  AMBULANCE_DISPATCHED: { beneficiaryName: 'Mr. Ramesh Kumar', eta: '12 minutes' },
  EMERGENCY_RESOLVED: { beneficiaryName: 'Mr. Ramesh Kumar', outcome: 'Vitals stabilized by emergency team. At home resting.' },

  // Care Team & Allocation
  CC_ASSIGNED: { ccName: 'Priya Sharma', beneficiaryName: 'Mr. Ramesh Kumar', primaryOrSecondary: 'Primary' },
  CC_REALLOCATED: { tempCcName: 'Sunita Rao', beneficiaryName: 'Mr. Ramesh Kumar', originalCcName: 'Priya Sharma' },
  NEW_CC_ASSIGNED_TO_FM: { ccName: 'Priya Sharma', date: 'Sept 1, 2026' },
  CC_DEACTIVATED: { ccName: 'Priya Sharma', lastWorkingDate: 'Sept 30, 2026', reason: 'Relocation' },
  BIRTHDAY_REMINDER: { beneficiaryName: 'Mr. Ramesh Kumar', date: 'Sept 12' },
  CC_PERFORMANCE_RATING: { rating: '5', beneficiaryName: 'Mr. Ramesh Kumar', comment: 'Extremely polite, helpful and caring companion.' },

  // Community & Saathi Network
  SAATHI_INTERACTION_REQUEST: { beneficiaryName: 'Mr. Ramesh Kumar' },
  SAATHI_VISIT_COMPLETED: { beneficiaryName: 'Mr. Ramesh Kumar', credits: '20' },
  HOBBY_CIRCLE_MESSAGE: { senderName: 'Captain Sharma', hobby: 'Gardening & Bonsai' },
  COMMUNITY_EVENT_UPCOMING: { eventName: 'Seniors Morning Yoga & Chai', date: 'Sept 7', venue: 'Community Club Sector 62' },
  LEGACY_CIRCLE_BIO_PUBLISHED: { beneficiaryName: 'Mr. Ramesh Kumar' },

  // Service Requests
  TELECONSULTATION_REQUESTED: { beneficiaryName: 'Mr. Ramesh Kumar', dateTime: 'Sept 5 at 4:00 PM', doctorName: 'Dr. Alok Verma' },
  LAB_TEST_SCHEDULED: { beneficiaryName: 'Mr. Ramesh Kumar', testName: 'Complete Blood Count & HbA1c', dateTime: 'Sept 6 at 8:00 AM', labLocation: 'Home Collection' },
  PHYSIOTHERAPY_SCHEDULED: { beneficiaryName: 'Mr. Ramesh Kumar', dateTime: 'Sept 6 at 11:00 AM', center: 'Home Visit by Dr. Neha' },
  MEDICINE_ORDER_PLACED: { beneficiaryName: 'Mr. Ramesh Kumar', pharmacyPartner: 'Apollo Pharmacy', deliveryDate: 'Today by 6:00 PM' },
  APPOINTMENT_RESCHEDULED_CANCELLED: { appointmentType: 'Teleconsultation', status: 'Rescheduled', newDetails: 'Sept 8 at 5:00 PM with Dr. Alok Verma' },

  // Admin & Operations
  SUBSCRIPTION_PENDING_CSA: { subscriberName: 'Rajeev Kumar', beneficiaryName: 'Mr. Ramesh Kumar' },
  SUBSCRIPTION_PENDING_OM: { subscriptionId: 'SUB-9941', beneficiaryName: 'Mr. Ramesh Kumar' },
  PARTNER_ENROLMENT_REQUEST: { partnerName: 'HealthFirst Diagnostics', partnerType: 'Pathology Lab' },
  PARTNER_ENROLMENT_APPROVED: { partnerName: 'HealthFirst Diagnostics', date: 'Sept 1, 2026' },
  CC_ABSENCE_REPORTED: { ccName: 'Priya Sharma', date: 'Tomorrow (Sept 5)', count: '2' },
  BGV_STATUS_UPDATE: { candidateName: 'Rahul Verma', status: 'Verified & Cleared' },
  WEEKLY_ZONE_UTILISATION: { zoneName: 'Noida Zone 1', weekStartDate: 'Sept 1, 2026' },
  INBASKET_MESSAGE: { senderName: 'Care Coordinator Neha', messagePreview: 'Your visit schedule for this week has been finalized.' },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAllTemplates() {
  console.log('========================================================================');
  console.log(`🚀 STARTING COMPREHENSIVE WHATSAPP TEMPLATE TEST`);
  console.log(`🎯 Recipient Phone: ${TARGET_PHONE}`);
  console.log(`📦 Registered Events: ${Object.keys(WhatsAppRegistry).length}`);
  console.log('========================================================================\n');

  const results: Array<{ event: string; template: string; success: boolean; message: string }> = [];

  for (const [eventKey, config] of Object.entries(WhatsAppRegistry)) {
    const payload = mockPayloads[eventKey] || {};
    const orderedVars: string[] = [];

    let missingVar = false;
    for (const varKey of config.body) {
      if (payload[varKey] === undefined) {
        console.warn(`⚠️ [${eventKey}] Missing mock variable '${varKey}' in test definition!`);
        missingVar = true;
      }
      orderedVars.push(String(payload[varKey] || 'Test'));
    }

    if (missingVar) {
      results.push({ event: eventKey, template: config.template, success: false, message: 'Missing mock variables' });
      continue;
    }

    process.stdout.write(`Sending [${eventKey}] -> template: "${config.template}"... `);

    try {
      const response = await whatsAppChannel.send({
        to: TARGET_PHONE,
        templateName: config.template,
        variables: orderedVars,
      });

      if (response.success) {
        console.log(`✅ SUCCESS (ID: ${response.messageId})`);
        results.push({ event: eventKey, template: config.template, success: true, message: response.messageId || 'sent' });
      } else {
        console.log(`❌ FAILED: ${response.error}`);
        results.push({ event: eventKey, template: config.template, success: false, message: response.error || 'unknown' });
      }
    } catch (err: any) {
      console.log(`❌ EXCEPTION: ${err.message}`);
      results.push({ event: eventKey, template: config.template, success: false, message: err.message });
    }

    // 600ms delay between dispatches to avoid vendor rate-limiting
    await delay(600);
  }

  console.log('\n========================================================================');
  console.log('📊 FINAL TEST REPORT SUMMARY');
  console.log('========================================================================');
  console.table(results);

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(`\n🎉 Passed: ${passed} / ${results.length}`);
  console.log(`⚠️ Failed: ${failed} / ${results.length}`);
}

runAllTemplates();
