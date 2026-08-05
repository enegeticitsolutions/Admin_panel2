const paymentService = require('./payment.service');

/**
 * Controller: Generate Payment Link
 */
async function generateLink(req, res) {
  try {
    const result = await paymentService.generatePaymentLink(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[Payment Controller] generateLink error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate payment link',
    });
  }
}

/**
 * Controller: Handle Webhook
 */
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyBuffer = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const bodyPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const result = await paymentService.processWebhook(signature, bodyBuffer, bodyPayload);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[Payment Controller] handleWebhook error:', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Webhook processing error',
    });
  }
}

/**
 * Controller: Get Live Payment Status
 */
async function getStatus(req, res) {
  try {
    const { orderId } = req.params;
    const result = await paymentService.checkLiveStatus(orderId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[Payment Controller] getStatus error:', err.message);
    res.status(404).json({
      success: false,
      message: err.message || 'Failed to check payment status',
    });
  }
}

/**
 * Controller: Simulate Test Mode Payment
 */
async function simulatePay(req, res) {
  try {
    const { orderId } = req.params;
    const { paymentMethod, paymentId } = req.body;
    const result = await paymentService.simulatePay(orderId, paymentMethod, paymentId);
    res.json({
      success: true,
      data: result,
      message: 'Online Payment completed successfully! Subscription is now ACTIVE.',
    });
  } catch (err) {
    console.error('[Payment Controller] simulatePay error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to complete payment simulation',
    });
  }
}

/**
 * Controller: Mark Payment Offline
 */
async function markOffline(req, res) {
  try {
    const { id } = req.params;
    const { method, note } = req.body;
    const result = await paymentService.markOffline(id, method, note);
    res.json({
      success: true,
      data: result,
      message: 'Payment marked as completed offline.',
    });
  } catch (err) {
    console.error('[Payment Controller] markOffline error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to mark payment as offline',
    });
  }
}

module.exports = {
  generateLink,
  handleWebhook,
  getStatus,
  simulatePay,
  markOffline,
};
