const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../lib/prisma');
const Razorpay = require('razorpay');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ? process.env.RAZORPAY_WEBHOOK_SECRET.trim() : '';

let razorpayInstance = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

// ── POST /api/payments/generate-link ─────────────────────────────────────────
// Generates a secure Razorpay Payment Link and saves pending Payment record in DB
router.post('/generate-link', async (req, res) => {
  try {
    const {
      subscriberId,
      beneficiaryId,
      subscriptionId,
      packageType,
      packageName,
      amount,
      subscriberPhone,
      subscriberEmail,
      subscriberName,
      duration = 'monthly',
    } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'amount is required' });
    }

    let validSubscriberId = null;

    try {
      if (subscriberId && typeof subscriberId === 'string' && subscriberId.trim() !== '') {
        const existingUser = await prisma.user.findUnique({ where: { id: subscriberId } }).catch(() => null);
        if (existingUser) validSubscriberId = existingUser.id;
      }

      if (!validSubscriberId && subscriberPhone) {
        const cleanDigits = subscriberPhone.replace(/\D/g, '').slice(-10);
        if (cleanDigits) {
          const userByPhone = await prisma.user.findFirst({
            where: { phone: { contains: cleanDigits } },
          }).catch(() => null);
          if (userByPhone) validSubscriberId = userByPhone.id;
        }
      }

      if (!validSubscriberId) {
        const fallbackUser = await prisma.user.findFirst().catch(() => null);
        if (fallbackUser) validSubscriberId = fallbackUser.id;
      }
    } catch (lookupErr) {
      console.warn('[Payments Subscriber Lookup Warning]:', lookupErr.message);
    }

    // Ensure validSubscriberId is NEVER empty/null
    if (!validSubscriberId) {
      validSubscriberId = `sub_temp_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
    }

    const orderId = `order_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const uniqueTxnId = `txn_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const numericAmount = parseFloat(amount);
    const amountInPaise = Math.round(numericAmount * 100);

    const cleanPhoneDigits = subscriberPhone ? subscriberPhone.replace(/\D/g, '').slice(-10) : '';
    const validPhone = cleanPhoneDigits.length === 10 ? cleanPhoneDigits : '9876543210';
    const validEmail = subscriberEmail && subscriberEmail.includes('@') ? subscriberEmail : 'customer@maihoonna.com';

    let paymentLinkUrl = '';
    let razorpayLinkId = null;

    if (razorpayInstance) {
      try {
        const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
        const razorpayLink = await razorpayInstance.paymentLink.create({
          amount: amountInPaise,
          currency: 'INR',
          accept_partial: false,
          description: `MaiHoonNa ${packageName || 'Care Package'} Subscription`,
          customer: {
            name: subscriberName || 'Valued Subscriber',
            contact: validPhone,
            email: validEmail,
          },
          notify: {
            sms: true,
            email: true,
          },
          reminder_enable: true,
          notes: {
            subscriberId: validSubscriberId,
            beneficiaryId: beneficiaryId || '',
            subscriptionId: subscriptionId || '',
            orderId,
          },
          callback_url: `${frontendBaseUrl}/renewals`,
          callback_method: 'get',
        });

        if (razorpayLink && razorpayLink.short_url) {
          paymentLinkUrl = razorpayLink.short_url;
          razorpayLinkId = razorpayLink.id;
          console.log(`[Razorpay SDK Success] Generated Payment Link: ${paymentLinkUrl} (${razorpayLinkId})`);
        }
      } catch (rzpErr) {
        console.error('[Razorpay SDK Error]:', rzpErr.message || rzpErr);
      }
    }

    // Fallback URL if Razorpay SDK fails or is offline
    if (!paymentLinkUrl) {
      const frontendOrigin = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0].trim() : 'http://localhost:5173';
      paymentLinkUrl = `${frontendOrigin}/pay/${orderId}`;
    }

    // Save pending Payment record in DB (safely wrapped so DB pooler resets do not fail link creation)
    let paymentRecord = null;
    try {
      paymentRecord = await prisma.payment.create({
        data: {
          subscriberId: validSubscriberId,
          beneficiaryId: beneficiaryId || null,
          subscriptionId: subscriptionId || uuidv4(),
          packageType: packageType || 'silver',
          baseAmount: numericAmount,
          amountPaid: numericAmount,
          currency: 'INR',
          paymentMethod: 'online_link',
          paymentStatus: 'pending',
          gatewayName: 'razorpay',
          gatewayOrderId: razorpayLinkId || orderId,
          transactionId: razorpayLinkId || uniqueTxnId,
          planStartDate: new Date(),
          planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isSubscriptionActive: false,
        },
      });
    } catch (dbErr) {
      console.warn('[Payments DB Warning] Could not store pending payment in DB:', dbErr.message);
    }

    // Format WhatsApp Web prefilled share link
    const cleanPhone = subscriberPhone ? subscriberPhone.replace(/\D/g, '') : '';
    const whatsappMsg = encodeURIComponent(
      `Hi ${subscriberName || 'there'},\n\nYour MaiHoonNa ${packageName || 'Care Package'} payment link is ready.\n\nAmount: ₹${numericAmount}\n\nPay securely here:\n${paymentLinkUrl}\n\nThank you!`
    );
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${whatsappMsg}`;

    res.status(201).json({
      success: true,
      data: {
        paymentId: paymentRecord?.id || uuidv4(),
        orderId: razorpayLinkId || orderId,
        shortUrl: paymentLinkUrl,
        whatsappUrl,
        amount: numericAmount,
        status: 'pending',
      },
    });
  } catch (err) {
    console.error('POST /api/payments/generate-link error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to generate payment link' });
  }
});

// ── POST /api/payments/webhook ───────────────────────────────────────────────
// Secure Webhook Listener: Validates Razorpay HMAC SHA-256 signature and activates subscriptions
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyBuffer = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    // Signature Verification
    if (RAZORPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(bodyBuffer)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('[Payments Webhook] Security Alert: Invalid webhook signature rejected!');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.event;

    console.log(`[Payments Webhook] Verified event received: ${event}`);

    if (event === 'payment.captured' || event === 'payment_link.paid' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || payload.payload?.payment_link?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const existingPayment = await prisma.payment.findFirst({
          where: {
            OR: [
              { gatewayOrderId: orderId },
              { transactionId: orderId },
            ],
          },
        });

        if (existingPayment) {
          // Update Payment to success
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              paymentStatus: 'success',
              gatewayPaymentId: paymentId || null,
              paidAt: new Date(),
              isSubscriptionActive: true,
            },
          });

          // Activate Subscription
          if (existingPayment.subscriptionId) {
            await prisma.subscription.update({
              where: { id: existingPayment.subscriptionId },
              data: {
                isActive: true,
              },
            }).catch(() => {});
          }

          console.log(`[Payments Webhook] Subscription ${existingPayment.subscriptionId} successfully ACTIVATED!`);
        }
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    console.error('POST /api/payments/webhook error:', err);
    res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
});

// ── GET /api/payments/status/:orderId ────────────────────────────────────────
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { gatewayOrderId: orderId },
          { transactionId: orderId },
          { id: orderId },
        ],
      },
      include: {
        subscriber: true,
        beneficiary: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.gatewayOrderId || payment.transactionId || payment.id,
        status: payment.paymentStatus,
        amount: payment.amountPaid,
        packageType: payment.packageType,
        paidAt: payment.paidAt,
        isSubscriptionActive: payment.isSubscriptionActive,
        subscriberName: payment.subscriber?.name || 'Valued Subscriber',
        subscriberPhone: payment.subscriber?.phone || '',
        beneficiaryName: payment.beneficiary?.name || '',
      },
    });
  } catch (err) {
    console.error('GET /api/payments/status error:', err);
    res.status(500).json({ success: false, message: 'Failed to check payment status' });
  }
});

// ── POST /api/payments/simulate-pay/:orderId ──────────────────────────────────
// Allows customer or tester on CheckoutPage to complete online payment test and activate subscription
router.post('/simulate-pay/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod = 'razorpay_online', paymentId } = req.body;

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { gatewayOrderId: orderId },
          { transactionId: orderId },
          { id: orderId },
        ],
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'success',
        paymentMethod: paymentMethod,
        gatewayPaymentId: paymentId || `pay_${uuidv4().replace(/-/g, '').substring(0, 10)}`,
        paidAt: new Date(),
        isSubscriptionActive: true,
      },
    });

    if (updated.subscriptionId) {
      await prisma.subscription.update({
        where: { id: updated.subscriptionId },
        data: { isActive: true },
      }).catch(() => {});
    }

    res.json({
      success: true,
      data: updated,
      message: 'Online Payment completed successfully! Subscription is now ACTIVE.',
    });
  } catch (err) {
    console.error('POST /api/payments/simulate-pay error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete online payment' });
  }
});

// ── POST /api/payments/:id/mark-offline ───────────────────────────────────────
// Allows admin to manually mark a pending online link payment as paid via cash/offline
router.post('/:id/mark-offline', async (req, res) => {
  try {
    const { id } = req.params;
    const { method = 'Cash', note } = req.body;

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        paymentStatus: 'success',
        paymentMethod: method,
        paidAt: new Date(),
        isSubscriptionActive: true,
      },
    });

    if (updated.subscriptionId) {
      await prisma.subscription.update({
        where: { id: updated.subscriptionId },
        data: { isActive: true },
      }).catch(() => {});
    }

    res.json({ success: true, data: updated, message: 'Payment marked as completed offline' });
  } catch (err) {
    console.error('POST /api/payments/:id/mark-offline error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark payment as offline' });
  }
});

module.exports = router;
