/**
 * Vitals Alert Event Dispatcher Service (`services/events/vitals-event.dispatcher.js`)
 *
 * Enterprise event-driven dispatcher handling omnichannel alerts when abnormal vitals are captured:
 *   - Blood Pressure alerts (High / Low)
 *   - Pulse Rate & SpO2 alerts
 *   - Blood Glucose alerts
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
 * Dispatch VITALS_ALERT when an abnormal reading is recorded
 */
async function dispatchVitalsAlert({ readingId, beneficiaryId, vitalName, readingValue, capturedByName }) {
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
      include: {
        subscriber: { select: { id: true, name: true, phone: true } },
        primaryCC: { select: { userId: true } }
      }
    });

    if (!beneficiary) return;

    const beneficiaryName = beneficiary.name || 'Beneficiary';
    const ccName = capturedByName || 'Care Companion';

    // A. Notify Subscriber (FCM Push + Bell)
    if (beneficiary.subscriber?.id) {
      notifyUser(prisma, {
        userId: beneficiary.subscriber.id,
        type: 'alert',
        title: '⚠️ Abnormal Vitals Alert',
        body: `${vitalName} reading for ${beneficiaryName} was flagged as abnormal (${readingValue}). Logged by ${ccName}.`,
        data: { readingId, beneficiaryId, screen: 'vitals', event: 'VITALS_ALERT' },
      }).catch(err => console.error('[VitalsDispatcher] Subscriber Push Error:', err.message));
    }

    // B. Notify Care Companion
    if (beneficiary.primaryCC?.userId) {
      notifyUser(prisma, {
        userId: beneficiary.primaryCC.userId,
        type: 'alert',
        title: '⚠️ Abnormal Vitals Recorded',
        body: `${vitalName} (${readingValue}) recorded for ${beneficiaryName} is out of normal range.`,
        data: { readingId, beneficiaryId, event: 'VITALS_ALERT' },
      }).catch(err => console.error('[VitalsDispatcher] CC Push Error:', err.message));
    }

    // C. WhatsApp to Subscriber
    const subscriberPhone = getValidPhone(beneficiary.subscriber?.phone);
    if (subscriberPhone) {
      notificationService.send({
        channel: 'whatsapp',
        event: 'VITALS_ALERT',
        to: subscriberPhone,
        variables: {
          beneficiaryName,
          vitalType: vitalName,
          reading: readingValue,
          ccName,
        }
      }).catch(err => console.error('[VitalsDispatcher] WhatsApp Error:', err.message));
    }
  } catch (err) {
    console.error('[VitalsDispatcher] dispatchVitalsAlert Exception:', err.message);
  }
}

module.exports = {
  dispatchVitalsAlert,
};
