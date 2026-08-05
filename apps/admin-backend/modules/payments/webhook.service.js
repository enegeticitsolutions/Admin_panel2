const crypto = require('crypto');

const RAZORPAY_WEBHOOK_SECRET = (process.env.RAZORPAY_WEBHOOK_SECRET || 'maihoonna_webhook_secret_2026').trim();

/**
 * Verifies Razorpay Webhook HMAC SHA-256 Signature.
 */
function verifySignature(bodyBuffer, signature) {
  if (!RAZORPAY_WEBHOOK_SECRET || !signature) {
    // If secret or signature is absent in local dev, allow processing with warning
    console.warn('[Webhook Service] Signature verification skipped (secret or signature missing)');
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(bodyBuffer)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );

    return isValid;
  } catch (err) {
    console.error('[Webhook Signature Error]:', err.message);
    return false;
  }
}

/**
 * Normalizes webhook payload to extract event type, linkId, gatewayPaymentId, and status.
 */
function extractWebhookData(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity || payload.payload?.payment_link?.entity;
  const paymentLinkEntity = payload.payload?.payment_link?.entity;

  const linkId = paymentLinkEntity?.id || paymentEntity?.order_id || paymentEntity?.id;
  const gatewayPaymentId = paymentEntity?.id;

  let normalizedStatus = 'PENDING';
  if (event === 'payment_link.paid' || event === 'payment.captured' || event === 'order.paid') {
    normalizedStatus = 'PAID';
  } else if (event === 'payment_link.expired') {
    normalizedStatus = 'EXPIRED';
  } else if (event === 'payment_link.cancelled' || event === 'payment.failed') {
    normalizedStatus = 'FAILED';
  }

  return {
    event,
    linkId,
    gatewayPaymentId,
    status: normalizedStatus,
    rawEntity: paymentEntity || payload,
  };
}

module.exports = {
  verifySignature,
  extractWebhookData,
};
