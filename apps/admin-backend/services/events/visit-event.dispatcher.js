/**
 * Visit Event Dispatcher Service (`services/events/visit-event.dispatcher.js`)
 *
 * Enterprise event-driven dispatcher that handles multi-stakeholder omnichannel
 * notification delivery (In-App Bell Tray, Expo FCM Push, and WhatsApp via MSG91)
 * for all visit lifecycle events:
 *   - Visit Scheduled
 *   - Visit Rescheduled / Updated
 *   - Visit Cancelled
 *   - Visit Started (Check-In)
 *   - Visit Completed (Check-Out)
 *
 * Safe & Asynchronous: Executes notification tasks asynchronously without blocking core DB transactions.
 */

const { prisma } = require('../../lib/prisma');
const { notifyUser } = require('../notifications');
const { notificationService } = require('@maihoonna/notifications');

/**
 * Helper to get clean 10-digit phone number
 */
function getValidPhone(phone) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 ? cleanPhone : null;
}

/**
 * Format Date & Time cleanly for notifications
 */
function formatVisitTime(scheduledTime) {
  const d = new Date(scheduledTime);
  if (isNaN(d.getTime())) return { formattedDate: 'Scheduled Date', formattedTime: 'Scheduled Time', fullString: 'Scheduled Date' };
  
  const formattedDate = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const fullString = `${formattedDate} at ${formattedTime}`;

  return { formattedDate, formattedTime, fullString };
}

/**
 * Helper to fetch complete visit details with all relations if only ID or partial object is provided
 */
async function fetchFullVisit(visitOrId) {
  if (typeof visitOrId === 'object' && visitOrId?.beneficiary && visitOrId?.careCompanion) {
    return visitOrId;
  }

  const visitId = typeof visitOrId === 'string' ? visitOrId : visitOrId?.id;
  if (!visitId) return null;

  return prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      beneficiary: {
        select: {
          id: true,
          name: true,
          userId: true,
          subscriberId: true,
          address: true,
          subscriber: {
            select: { id: true, name: true, phone: true }
          },
          user: {
            select: { id: true, name: true, phone: true }
          }
        }
      },
      careCompanion: {
        select: {
          id: true,
          name: true,
          userId: true,
          user: {
            select: { id: true, name: true, phone: true }
          }
        }
      }
    }
  });
}

/**
 * 1. Dispatch VISIT_SCHEDULED event to Beneficiary, Subscriber, and Care Companion
 */
async function dispatchVisitScheduled(visitOrId, metadata = {}) {
  try {
    const visit = await fetchFullVisit(visitOrId);
    if (!visit) return;

    const { formattedDate, formattedTime, fullString } = formatVisitTime(visit.scheduledTime);
    const ccName = visit.careCompanion?.name || 'Your Care Companion';
    const beneficiaryName = visit.beneficiary?.name || 'the beneficiary';
    const address = visit.beneficiary?.address || 'the registered address';

    // A. Notify Care Companion (Push + Bell)
    if (visit.careCompanion?.userId) {
      notifyUser(prisma, {
        userId: visit.careCompanion.userId,
        type: 'visit_reminder',
        title: '📅 New Visit Assigned',
        body: `You are scheduled to visit ${beneficiaryName} on ${fullString}.`,
        data: { visitId: visit.id, screen: 'schedule', event: 'VISIT_SCHEDULED' },
      }).catch(err => console.error('[VisitDispatcher] CC Push Error:', err.message));
    }

    // B. Notify Beneficiary (Push + Bell)
    if (visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: visit.beneficiary.userId,
        type: 'visit_reminder',
        title: '📅 Care Visit Scheduled',
        body: `${ccName} is scheduled to visit you on ${fullString}.`,
        data: { visitId: visit.id, screen: 'schedule', event: 'VISIT_SCHEDULED' },
      }).catch(err => console.error('[VisitDispatcher] Beneficiary Push Error:', err.message));
    }

    // C. Notify Subscriber (Push + Bell + WhatsApp)
    const subscriberId = visit.beneficiary?.subscriberId || visit.beneficiary?.subscriber?.id;
    if (subscriberId && subscriberId !== visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: subscriberId,
        type: 'visit_reminder',
        title: '📅 Care Visit Scheduled',
        body: `A visit for ${beneficiaryName} with ${ccName} is scheduled for ${fullString}.`,
        data: { visitId: visit.id, beneficiaryId: visit.beneficiaryId, screen: 'index', event: 'VISIT_SCHEDULED' },
      }).catch(err => console.error('[VisitDispatcher] Subscriber Push Error:', err.message));
    }

    // Send WhatsApp to Subscriber
    const subscriberPhone = getValidPhone(visit.beneficiary?.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'VISIT_SCHEDULED',
        to: subscriberPhone,
        variables: {
          ccName,
          beneficiaryName,
          date: formattedDate,
          time: formattedTime,
          address,
        }
      }).catch(err => console.error('[VisitDispatcher] WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[VisitDispatcher] dispatchVisitScheduled Exception:', err.message);
  }
}

/**
 * 2. Dispatch VISIT_RESCHEDULED event to Beneficiary, Subscriber, and Care Companion
 */
async function dispatchVisitRescheduled(visitOrId, oldTime, metadata = {}) {
  try {
    const visit = await fetchFullVisit(visitOrId);
    if (!visit) return;

    const { formattedDate, formattedTime, fullString } = formatVisitTime(visit.scheduledTime);
    const ccName = visit.careCompanion?.name || 'Your Care Companion';
    const beneficiaryName = visit.beneficiary?.name || 'the beneficiary';

    // A. Notify Care Companion
    if (visit.careCompanion?.userId) {
      notifyUser(prisma, {
        userId: visit.careCompanion.userId,
        type: 'visit_reminder',
        title: '⏰ Visit Rescheduled',
        body: `Your visit with ${beneficiaryName} has been rescheduled to ${fullString}.`,
        data: { visitId: visit.id, screen: 'schedule', event: 'VISIT_RESCHEDULED' },
      }).catch(err => console.error('[VisitDispatcher] CC Reschedule Push Error:', err.message));
    }

    // B. Notify Beneficiary
    if (visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: visit.beneficiary.userId,
        type: 'visit_reminder',
        title: '⏰ Visit Rescheduled',
        body: `Your visit with ${ccName} has been rescheduled to ${fullString}.`,
        data: { visitId: visit.id, screen: 'schedule', event: 'VISIT_RESCHEDULED' },
      }).catch(err => console.error('[VisitDispatcher] Beneficiary Reschedule Push Error:', err.message));
    }

    // C. Notify Subscriber
    const subscriberId = visit.beneficiary?.subscriberId || visit.beneficiary?.subscriber?.id;
    if (subscriberId && subscriberId !== visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: subscriberId,
        type: 'visit_reminder',
        title: '⏰ Visit Rescheduled',
        body: `The visit for ${beneficiaryName} with ${ccName} has been rescheduled to ${fullString}.`,
        data: { visitId: visit.id, beneficiaryId: visit.beneficiaryId, screen: 'index', event: 'VISIT_RESCHEDULED' },
      }).catch(err => console.error('[VisitDispatcher] Subscriber Reschedule Push Error:', err.message));
    }

    // WhatsApp Notification
    const subscriberPhone = getValidPhone(visit.beneficiary?.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'APPOINTMENT_RESCHEDULED_CANCELLED',
        to: subscriberPhone,
        variables: {
          appointmentType: 'Care Visit',
          status: 'rescheduled',
          newDetails: `${beneficiaryName} with ${ccName} on ${fullString}`,
        }
      }).catch(err => console.error('[VisitDispatcher] Reschedule WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[VisitDispatcher] dispatchVisitRescheduled Exception:', err.message);
  }
}

/**
 * 3. Dispatch VISIT_CANCELLED event to Beneficiary, Subscriber, and Care Companion
 */
async function dispatchVisitCancelled(visitOrId, reason = 'Cancelled by operations team', metadata = {}) {
  try {
    const visit = await fetchFullVisit(visitOrId);
    if (!visit) return;

    const { fullString } = formatVisitTime(visit.scheduledTime);
    const ccName = visit.careCompanion?.name || 'the Care Companion';
    const beneficiaryName = visit.beneficiary?.name || 'the beneficiary';

    // A. Notify Care Companion
    if (visit.careCompanion?.userId) {
      notifyUser(prisma, {
        userId: visit.careCompanion.userId,
        type: 'visit_cancelled',
        title: '❌ Visit Cancelled',
        body: `Your visit with ${beneficiaryName} on ${fullString} has been cancelled.`,
        data: { visitId: visit.id, screen: 'schedule', event: 'VISIT_CANCELLED' },
      }).catch(err => console.error('[VisitDispatcher] CC Cancel Push Error:', err.message));
    }

    // B. Notify Beneficiary
    if (visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: visit.beneficiary.userId,
        type: 'visit_cancelled',
        title: '❌ Visit Cancelled',
        body: `Your scheduled visit with ${ccName} on ${fullString} has been cancelled.`,
        data: { visitId: visit.id, screen: 'schedule', event: 'VISIT_CANCELLED' },
      }).catch(err => console.error('[VisitDispatcher] Beneficiary Cancel Push Error:', err.message));
    }

    // C. Notify Subscriber
    const subscriberId = visit.beneficiary?.subscriberId || visit.beneficiary?.subscriber?.id;
    if (subscriberId && subscriberId !== visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: subscriberId,
        type: 'visit_cancelled',
        title: '❌ Visit Cancelled',
        body: `The visit for ${beneficiaryName} on ${fullString} has been cancelled.`,
        data: { visitId: visit.id, beneficiaryId: visit.beneficiaryId, screen: 'index', event: 'VISIT_CANCELLED' },
      }).catch(err => console.error('[VisitDispatcher] Subscriber Cancel Push Error:', err.message));
    }

    // WhatsApp Notification
    const subscriberPhone = getValidPhone(visit.beneficiary?.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'APPOINTMENT_RESCHEDULED_CANCELLED',
        to: subscriberPhone,
        variables: {
          appointmentType: 'Care Visit',
          status: 'cancelled',
          newDetails: `Visit for ${beneficiaryName} on ${fullString}`,
        }
      }).catch(err => console.error('[VisitDispatcher] Cancel WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[VisitDispatcher] dispatchVisitCancelled Exception:', err.message);
  }
}

/**
 * 4. Dispatch VISIT_STARTED event when Care Companion checks in
 */
async function dispatchVisitStarted(visitOrId, checkInTime = new Date()) {
  try {
    const visit = await fetchFullVisit(visitOrId);
    if (!visit) return;

    const formattedCheckIn = new Date(checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const ccName = visit.careCompanion?.name || 'Care Companion';
    const beneficiaryName = visit.beneficiary?.name || 'the beneficiary';

    // A. Notify Beneficiary
    if (visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: visit.beneficiary.userId,
        type: 'info',
        title: '🚪 Care Companion Arrived',
        body: `${ccName} has checked in and started your care visit at ${formattedCheckIn}.`,
        data: { visitId: visit.id, event: 'VISIT_STARTED' },
      }).catch(err => console.error('[VisitDispatcher] Beneficiary Start Push Error:', err.message));
    }

    // B. Notify Subscriber
    const subscriberId = visit.beneficiary?.subscriberId || visit.beneficiary?.subscriber?.id;
    if (subscriberId && subscriberId !== visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: subscriberId,
        type: 'info',
        title: '🚪 Care Visit Started',
        body: `${ccName} has checked in for ${beneficiaryName}'s visit at ${formattedCheckIn}.`,
        data: { visitId: visit.id, beneficiaryId: visit.beneficiaryId, event: 'VISIT_STARTED' },
      }).catch(err => console.error('[VisitDispatcher] Subscriber Start Push Error:', err.message));
    }

    // WhatsApp Notification
    const subscriberPhone = getValidPhone(visit.beneficiary?.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'VISIT_STARTED',
        to: subscriberPhone,
        variables: {
          ccName,
          beneficiaryName,
          checkInTime: formattedCheckIn,
        }
      }).catch(err => console.error('[VisitDispatcher] Visit Started WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[VisitDispatcher] dispatchVisitStarted Exception:', err.message);
  }
}

/**
 * 5. Dispatch VISIT_COMPLETED event when visit checkout is complete
 */
async function dispatchVisitCompleted(visitOrId, durationMinutes = 60) {
  try {
    const visit = await fetchFullVisit(visitOrId);
    if (!visit) return;

    const ccName = visit.careCompanion?.name || 'Care Companion';
    const beneficiaryName = visit.beneficiary?.name || 'the beneficiary';
    const durationText = `${durationMinutes} minutes`;

    // A. Notify Beneficiary
    if (visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: visit.beneficiary.userId,
        type: 'info',
        title: '✅ Visit Completed',
        body: `Your care visit with ${ccName} has been completed.`,
        data: { visitId: visit.id, event: 'VISIT_COMPLETED' },
      }).catch(err => console.error('[VisitDispatcher] Beneficiary Complete Push Error:', err.message));
    }

    // B. Notify Subscriber
    const subscriberId = visit.beneficiary?.subscriberId || visit.beneficiary?.subscriber?.id;
    if (subscriberId && subscriberId !== visit.beneficiary?.userId) {
      notifyUser(prisma, {
        userId: subscriberId,
        type: 'info',
        title: '✅ Care Visit Completed',
        body: `The visit for ${beneficiaryName} with ${ccName} has been completed (${durationText}).`,
        data: { visitId: visit.id, beneficiaryId: visit.beneficiaryId, event: 'VISIT_COMPLETED' },
      }).catch(err => console.error('[VisitDispatcher] Subscriber Complete Push Error:', err.message));
    }

    // WhatsApp Notification
    const subscriberPhone = getValidPhone(visit.beneficiary?.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'VISIT_COMPLETED',
        to: subscriberPhone,
        variables: {
          ccName,
          beneficiaryName,
          duration: durationText,
        }
      }).catch(err => console.error('[VisitDispatcher] Visit Completed WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[VisitDispatcher] dispatchVisitCompleted Exception:', err.message);
  }
}

module.exports = {
  dispatchVisitScheduled,
  dispatchVisitRescheduled,
  dispatchVisitCancelled,
  dispatchVisitStarted,
  dispatchVisitCompleted,
};
