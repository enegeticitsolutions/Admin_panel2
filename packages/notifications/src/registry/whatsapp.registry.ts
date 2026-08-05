export interface WhatsAppTemplateConfig {
  template: string;
  body: string[];
}

export const WhatsAppRegistry: Record<string, WhatsAppTemplateConfig> = {
  // Onboarding & Account
  OTP_LOGIN_SIGNUP: { template: 'otp_login_signup', body: ['otpCode'] },
  SUBSCRIBER_ACCOUNT_CREATED: { template: 'subscriber_account_created', body: ['subscriberName'] },
  SUBSCRIPTION_REQUEST_SUBMITTED: { template: 'subscription_request_submitted', body: ['subscriberName', 'beneficiaryName', 'packageName'] },
  SUBSCRIPTION_ACTIVATED: { template: 'subscription_approved_activated', body: ['subscriberName', 'packageName', 'beneficiaryName', 'startDate'] },
  BENEF_PROFILE_CREATED: { template: 'benef_profile_created', body: ['beneficiaryName', 'subscriberName'] },
  CM_ONBOARDING_CLEARED: { template: 'care_mitra_onboarding_cleared', body: ['ccName', 'fmName'] },
  CM_TRAINING_REMINDER: { template: 'care_mitra_training_reminder', body: ['ccName', 'moduleName', 'date', 'timeLocation'] },
  PASSWORD_RESET_REQUEST: { template: 'password_reset_request', body: ['resetCode'] },

  // Visit & Encounter
  VISIT_SCHEDULED: { template: 'visit_scheduled', body: ['ccName', 'beneficiaryName', 'date', 'time', 'address'] },
  VISIT_REMINDER: { template: 'visit_reminder', body: ['beneficiaryName', 'time'] },
  VISIT_STARTED: { template: 'visit_started', body: ['ccName', 'beneficiaryName', 'checkInTime'] },
  MANUAL_CHECKIN_FLAGGED: { template: 'manual_checkin_flagged', body: ['ccName', 'beneficiaryName', 'remarks'] },
  VISIT_COMPLETED: { template: 'visit_completed', body: ['ccName', 'beneficiaryName', 'duration'] },
  DAILY_VISIT_SUMMARY: { template: 'daily_visit_summary', body: ['subscriberName', 'beneficiaryName', 'mood', 'notes'] },
  MISSED_VISIT: { template: 'missed_visit', body: ['beneficiaryName'] },
  CLINIC_VISIT_STARTED: { template: 'clinic_visit_started', body: ['ccName', 'beneficiaryName', 'clinicName'] },
  RATING_FEEDBACK_PROMPT: { template: 'ratingfeedback_prompt', body: ['ccName'] },

  // Mood & Happiness Score
  MOOD_ALERT: { template: 'mood_alert', body: ['beneficiaryName', 'mood', 'ccName'] },
  WELLBEING_CHECK_RECOMMENDED: { template: 'wellbeing_check_recommended', body: ['beneficiaryName'] },
  HAPPINESS_SCORE_UPDATE: { template: 'happiness_score_update', body: ['beneficiaryName', 'newScore'] },
  WEEKLY_WELLBEING_DIGEST: { template: 'weekly_wellbeing_digest', body: ['beneficiaryName'] },

  // Vitals & Medication
  VITALS_ALERT: { template: 'vitals_alert', body: ['beneficiaryName', 'vitalType', 'reading', 'ccName'] },
  MEDICATION_REMINDER: { template: 'medication_reminder_to_benef', body: ['beneficiaryName', 'medicationName', 'dosage'] },
  MEDICATION_MISSED: { template: 'medication_missed', body: ['beneficiaryName', 'medicationName', 'scheduledTime'] },
  EMR_VITALS_REPORT: { template: 'emr_vitals_report', body: ['beneficiaryName', 'month'] },

  // Scheduling & Subscription
  SCHEDULE_CHANGE_REQUEST: { template: 'schedule_change_request', body: ['subscriberName', 'beneficiaryName', 'requestedDate'] },
  SCHEDULE_CHANGE_DECISION: { template: 'schedule_change_decision', body: ['decision', 'beneficiaryName', 'newDateTime'] },
  SUBSCRIPTION_RENEWAL_REMINDER: { template: 'subscription_renewal_reminder', body: ['subscriberName', 'packageName', 'beneficiaryName', 'expiryDate'] },
  RENEWAL_PAYMENT_LINK: { template: 'renewal_payment_link', body: ['beneficiaryName', 'packageName', 'paymentLink'] },
  PAYMENT_SUCCESSFUL: { template: 'payment_successful', body: ['amount', 'beneficiaryName', 'packageName'] },
  PAYMENT_FAILED: { template: 'payment_failed', body: ['amount', 'beneficiaryName', 'paymentLink'] },
  SUBSCRIPTION_HOURS_LOW: { template: 'subscription_hours_low', body: ['beneficiaryName', 'percentConsumed'] },
  SUBSCRIPTION_HOURS_EXHAUSTED: { template: 'subscription_hours_exhausted', body: ['beneficiaryName'] },
  SUBSCRIPTION_TERMINATED: { template: 'subscription_terminated', body: ['beneficiaryName', 'effectiveDate'] },
  FREE_TRIAL_ENDING: { template: 'free_trial_ending', body: ['subscriberName', 'beneficiaryName', 'endDate'] },

  // Emergency
  EMERGENCY_TRIGGERED: { template: 'emergency_triggered', body: ['beneficiaryName', 'timestamp', 'location'] },
  EMERGENCY_ACKNOWLEDGED: { template: 'emergency_acknowledged', body: ['beneficiaryName'] },
  AMBULANCE_DISPATCHED: { template: 'ambulance_dispatched', body: ['beneficiaryName', 'eta'] },
  EMERGENCY_RESOLVED: { template: 'emergency_resolved', body: ['beneficiaryName', 'outcome'] },

  // Care Team & Allocation
  CC_ASSIGNED: { template: 'primarysecondary_cc_assigned', body: ['ccName', 'beneficiaryName', 'primaryOrSecondary'] },
  CC_REALLOCATED: { template: 'cc_reallocated_temporarily_replacement', body: ['tempCcName', 'beneficiaryName', 'originalCcName'] },
  NEW_CC_ASSIGNED_TO_FM: { template: 'new_cc_assigned_to_fm', body: ['ccName', 'date'] },
  CC_DEACTIVATED: { template: 'cc_deactivated', body: ['ccName', 'lastWorkingDate', 'reason'] },
  BIRTHDAY_REMINDER: { template: 'birthday_reminder', body: ['beneficiaryName', 'date'] },
  CC_PERFORMANCE_RATING: { template: 'cc_performance_rating', body: ['rating', 'beneficiaryName', 'comment'] },

  // Community & Saathi Network
  SAATHI_INTERACTION_REQUEST: { template: 'saathi_interaction_request', body: ['beneficiaryName'] },
  SAATHI_VISIT_COMPLETED: { template: 'saathi_visit_completed', body: ['beneficiaryName', 'credits'] },
  HOBBY_CIRCLE_MESSAGE: { template: 'hobby_circle_connection_message_received', body: ['senderName', 'hobby'] },
  COMMUNITY_EVENT_UPCOMING: { template: 'community_event_upcoming', body: ['eventName', 'date', 'venue'] },
  LEGACY_CIRCLE_BIO_PUBLISHED: { template: 'legacy_circle_bio_published', body: ['beneficiaryName'] },

  // Service Requests
  TELECONSULTATION_REQUESTED: { template: 'teleconsultation_requested', body: ['beneficiaryName', 'dateTime', 'doctorName'] },
  LAB_TEST_SCHEDULED: { template: 'lab_test_appointment_scheduled', body: ['beneficiaryName', 'testName', 'dateTime', 'labLocation'] },
  PHYSIOTHERAPY_SCHEDULED: { template: 'physiotherapy_appointment_scheduled', body: ['beneficiaryName', 'dateTime', 'center'] },
  MEDICINE_ORDER_PLACED: { template: 'medicine_order_placed_with_pharmacy_partner', body: ['beneficiaryName', 'pharmacyPartner', 'deliveryDate'] },
  APPOINTMENT_RESCHEDULED_CANCELLED: { template: 'appointment_rescheduled__cancelled', body: ['appointmentType', 'status', 'newDetails'] },

  // Admin & Operations
  SUBSCRIPTION_PENDING_CSA: { template: 'subscription_pending_csa', body: ['subscriberName', 'beneficiaryName'] },
  SUBSCRIPTION_PENDING_OM: { template: 'subscription_pending_om', body: ['subscriptionId', 'beneficiaryName'] },
  PARTNER_ENROLMENT_REQUEST: { template: 'partner_enrolment_request', body: ['partnerName', 'partnerType'] },
  PARTNER_ENROLMENT_APPROVED: { template: 'partner_enrolment_approved', body: ['partnerName', 'date'] },
  CC_ABSENCE_REPORTED: { template: 'cc_absence_reported', body: ['ccName', 'date', 'count'] },
  BGV_STATUS_UPDATE: { template: 'bgv_status_update', body: ['candidateName', 'status'] },
  WEEKLY_ZONE_UTILISATION: { template: 'weekly_zone_utilisation', body: ['zoneName', 'weekStartDate'] },
  INBASKET_MESSAGE: { template: 'inbasket_message_generic_notification_of_new_message', body: ['senderName', 'messagePreview'] },
};
