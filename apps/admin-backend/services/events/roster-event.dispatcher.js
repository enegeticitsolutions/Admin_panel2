/**
 * Roster & Care Team Event Dispatcher Service (`services/events/roster-event.dispatcher.js`)
 *
 * Enterprise event-driven dispatcher handling roster management and care team allocations:
 *   - Care Companion Allocated / Reallocated
 *   - New Care Companion assigned to Field Manager
 *   - Roster Approved for a zone/period
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
 * 1. Dispatch CC Allocation / Assignment to Subscriber & Beneficiary
 */
async function dispatchCareCompanionAssigned({ beneficiaryId, ccName, primaryOrSecondary = 'Primary' }) {
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
      include: {
        user: { select: { id: true, name: true } },
        subscriber: { select: { id: true, name: true, phone: true } }
      }
    });

    if (!beneficiary) return;

    const beneficiaryName = beneficiary.name || 'your beneficiary';

    // A. Notify Beneficiary (Push)
    if (beneficiary.user?.id) {
      notifyUser(prisma, {
        userId: beneficiary.user.id,
        type: 'info',
        title: '🤝 Care Companion Assigned',
        body: `${ccName} has been assigned as your ${primaryOrSecondary} Care Companion.`,
        data: { screen: 'team', event: 'CC_ASSIGNED' },
      }).catch(err => console.error('[RosterDispatcher] Beneficiary Push Error:', err.message));
    }

    // B. Notify Subscriber (Push + WhatsApp)
    if (beneficiary.subscriber?.id) {
      notifyUser(prisma, {
        userId: beneficiary.subscriber.id,
        type: 'info',
        title: '🤝 Care Companion Assigned',
        body: `${ccName} has been assigned as ${primaryOrSecondary} Care Companion for ${beneficiaryName}.`,
        data: { beneficiaryId, screen: 'team', event: 'CC_ASSIGNED' },
      }).catch(err => console.error('[RosterDispatcher] Subscriber Push Error:', err.message));
    }

    // WhatsApp to Subscriber
    const subscriberPhone = getValidPhone(beneficiary.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'CC_ASSIGNED',
        to: subscriberPhone,
        variables: {
          ccName,
          beneficiaryName,
          primaryOrSecondary,
        }
      }).catch(err => console.error('[RosterDispatcher] WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[RosterDispatcher] dispatchCareCompanionAssigned Exception:', err.message);
  }
}

/**
 * 2. Dispatch Temporary CC Reallocation Alert
 */
async function dispatchCCReallocated({ beneficiaryId, tempCcName, originalCcName }) {
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
      include: {
        subscriber: { select: { id: true, name: true, phone: true } }
      }
    });

    if (!beneficiary) return;
    const beneficiaryName = beneficiary.name || 'your beneficiary';

    // Notify Subscriber
    if (beneficiary.subscriber?.id) {
      notifyUser(prisma, {
        userId: beneficiary.subscriber.id,
        type: 'info',
        title: '🔄 Temporary Care Companion Reassigned',
        body: `${tempCcName} will temporarily visit ${beneficiaryName} in place of ${originalCcName}.`,
        data: { beneficiaryId, event: 'CC_REALLOCATED' },
      }).catch(err => console.error('[RosterDispatcher] Reallocation Push Error:', err.message));
    }

    // WhatsApp to Subscriber
    const subscriberPhone = getValidPhone(beneficiary.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'CC_REALLOCATED',
        to: subscriberPhone,
        variables: {
          tempCcName,
          beneficiaryName,
          originalCcName,
        }
      }).catch(err => console.error('[RosterDispatcher] Reallocation WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[RosterDispatcher] dispatchCCReallocated Exception:', err.message);
  }
}

/**
 * 3. Dispatch Roster Approved Notification to Field Manager & CCs
 */
async function dispatchRosterApproved({ zoneId, date, periodType, approvedByName }) {
  try {
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        fieldManager: { select: { userId: true } },
        teams: {
          include: {
            careCompanions: { select: { userId: true } }
          }
        }
      }
    });

    if (!zone) return;

    const formattedDate = new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const zoneName = zone.name || 'Zone';

    // Notify Field Manager
    if (zone.fieldManager?.userId) {
      notifyUser(prisma, {
        userId: zone.fieldManager.userId,
        type: 'info',
        title: '📋 Roster Approved',
        body: `The ${periodType} roster for ${zoneName} (${formattedDate}) has been approved by ${approvedByName}.`,
        data: { zoneId, event: 'ROSTER_APPROVED' },
      }).catch(err => console.error('[RosterDispatcher] FM Push Error:', err.message));
    }

    // Notify all CCs in zone
    const ccUserIds = new Set();
    zone.teams.forEach(t => t.careCompanions.forEach(cc => cc.userId && ccUserIds.add(cc.userId)));

    for (const userId of ccUserIds) {
      notifyUser(prisma, {
        userId,
        type: 'info',
        title: '📋 Work Roster Finalized',
        body: `Your schedule for ${formattedDate} in ${zoneName} has been approved. Check your roster!`,
        data: { event: 'ROSTER_APPROVED' },
      }).catch(err => console.error('[RosterDispatcher] CC Roster Push Error:', err.message));
    }
  } catch (err) {
    console.error('[RosterDispatcher] dispatchRosterApproved Exception:', err.message);
  }
}

module.exports = {
  dispatchCareCompanionAssigned,
  dispatchCCReallocated,
  dispatchRosterApproved,
};
