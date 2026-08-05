const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

// ── Payment Routes ────────────────────────────────────────────────────────────

// POST /api/payments/generate-link
router.post('/generate-link', paymentController.generateLink);

// POST /api/payments/webhook
router.post('/webhook', paymentController.handleWebhook);

// GET /api/payments/status/:orderId
router.get('/status/:orderId', paymentController.getStatus);

// POST /api/payments/simulate-pay/:orderId
router.post('/simulate-pay/:orderId', paymentController.simulatePay);

// POST /api/payments/:id/mark-offline
router.post('/:id/mark-offline', paymentController.markOffline);

module.exports = router;
