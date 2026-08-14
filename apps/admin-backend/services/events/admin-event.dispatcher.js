/**
 * Admin & Operations Event Dispatcher Service (`services/events/admin-event.dispatcher.js`)
 *
 * Enterprise event-driven dispatcher handling omnichannel admin notifications:
 *   - Subscription Pending CSA Review (NT-090)
 *   - Subscription Pending OM Approval (NT-091)
 *   - Partner Enrolment Request Received (NT-092)
 *   - Partner Enrolment Approved (NT-093)
 *   - CC Absence Reported (NT-094)
 *   - BGV Status Update (NT-095)
 *   - Weekly Zone Utilisation Report (NT-096)
 *   - Inbasket Message Generic (NT-097)
 */

const { prisma } = require('../../lib/prisma');
const { notifyUser } = require('../notifications');
const { notificationService } = require('@maihoonna/notifications');

function getValidPhone(phone) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 ? cleanPhone : null;
}

/**
 * 1. Dispatch SUBSCRIPTION_PENDING_CSA (NT-090)
 */
async function dispatchSubscriptionPendingCSA({ csaUserId, subscriberName, beneficiaryName }) {
  try {
    if (csaUserId) {
      notifyUser(prisma, {
        userId: csaUserId,
        type: 'info',
        title: '📋 New Subscription Pending Review',
        body: `A new subscription request from ${subscriberName} for ${beneficiaryName} is pending your review.`,
        data: { event: 'SUBSCRIPTION_PENDING_CSA' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchSubscriptionPendingCSA Exception:', err.message);
  }
}

/**
 * 2. Dispatch SUBSCRIPTION_PENDING_OM (NT-091)
 */
async function dispatchSubscriptionPendingOM({ omUserId, subscriptionId, beneficiaryName }) {
  try {
    if (omUserId) {
      notifyUser(prisma, {
        userId: omUserId,
        type: 'alert',
        title: '📋 Subscription Awaiting Approval',
        body: `Subscription #${subscriptionId} for ${beneficiaryName} is ready for your final approval.`,
        data: { event: 'SUBSCRIPTION_PENDING_OM' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchSubscriptionPendingOM Exception:', err.message);
  }
}

/**
 * 3. Dispatch PARTNER_ENROLMENT_REQUEST (NT-092)
 */
async function dispatchPartnerEnrolmentRequest({ omUserId, partnerName, partnerType }) {
  try {
    if (omUserId) {
      notifyUser(prisma, {
        userId: omUserId,
        type: 'info',
        title: '🏢 New Partner Enrolment Request',
        body: `${partnerName} (${partnerType}) has submitted an enrolment request. Please review.`,
        data: { event: 'PARTNER_ENROLMENT_REQUEST' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchPartnerEnrolmentRequest Exception:', err.message);
  }
}

/**
 * 4. Dispatch PARTNER_ENROLMENT_APPROVED (NT-093)
 */
async function dispatchPartnerEnrolmentApproved({ partnerUserId, partnerPhone, partnerName, date }) {
  try {
    if (partnerUserId) {
      notifyUser(prisma, {
        userId: partnerUserId,
        type: 'info',
        title: '✅ Partner Enrolment Approved',
        body: `Congratulations, ${partnerName} is now an approved MaiHoonNa partner effective ${date}.`,
        data: { event: 'PARTNER_ENROLMENT_APPROVED' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchPartnerEnrolmentApproved Exception:', err.message);
  }
}

/**
 * 5. Dispatch CC_ABSENCE_REPORTED (NT-094)
 */
async function dispatchCCAbsenceReported({ fmUserId, fmPhone, ccName, date, count }) {
  try {
    if (fmUserId) {
      notifyUser(prisma, {
        userId: fmUserId,
        type: 'alert',
        title: '⚠️ CC Unavailable Today',
        body: `${ccName} has reported unavailability for ${date}. ${count} beneficiary visit(s) need reassignment.`,
        data: { event: 'CC_ABSENCE_REPORTED' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }

    const validPhone = getValidPhone(fmPhone);
    if (validPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'CC_ABSENCE_REPORTED',
        to: validPhone,
        variables: { ccName, date, count: count.toString() }
      }).catch(err => console.error('[AdminDispatcher] WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchCCAbsenceReported Exception:', err.message);
  }
}

/**
 * 6. Dispatch BGV_STATUS_UPDATE (NT-095)
 */
async function dispatchBGVStatusUpdate({ omUserId, candidateName, status }) {
  try {
    if (omUserId) {
      notifyUser(prisma, {
        userId: omUserId,
        type: 'info',
        title: '🛡️ BGV Status Update',
        body: `Background verification for candidate ${candidateName} is now: ${status}.`,
        data: { event: 'BGV_STATUS_UPDATE' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchBGVStatusUpdate Exception:', err.message);
  }
}

/**
 * 7. Dispatch WEEKLY_ZONE_UTILISATION (NT-096)
 */
async function dispatchWeeklyZoneUtilisation({ omUserId, zoneName, weekStartDate }) {
  try {
    if (omUserId) {
      notifyUser(prisma, {
        userId: omUserId,
        type: 'info',
        title: '📊 Weekly Zone Performance Report',
        body: `Attached: utilisation, CC performance, and SLA summary for ${zoneName} zone, week of ${weekStartDate}.`,
        data: { event: 'WEEKLY_ZONE_UTILISATION' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchWeeklyZoneUtilisation Exception:', err.message);
  }
}

/**
 * 8. Dispatch INBASKET_MESSAGE (NT-097)
 */
async function dispatchInbasketMessage({ userId, phone, senderName, messagePreview }) {
  try {
    if (userId) {
      notifyUser(prisma, {
        userId,
        type: 'info',
        title: '💬 New Message',
        body: `You have a new message from ${senderName}: "${messagePreview}"`,
        data: { event: 'INBASKET_MESSAGE' },
      }).catch(err => console.error('[AdminDispatcher] Push Error:', err.message));
    }

    const validPhone = getValidPhone(phone);
    if (validPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'INBASKET_MESSAGE',
        to: validPhone,
        variables: { senderName, messagePreview }
      }).catch(err => console.error('[AdminDispatcher] WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[AdminDispatcher] dispatchInbasketMessage Exception:', err.message);
  }
}

module.exports = {
  dispatchSubscriptionPendingCSA,
  dispatchSubscriptionPendingOM,
  dispatchPartnerEnrolmentRequest,
  dispatchPartnerEnrolmentApproved,
  dispatchCCAbsenceReported,
  dispatchBGVStatusUpdate,
  dispatchWeeklyZoneUtilisation,
  dispatchInbasketMessage,
};
