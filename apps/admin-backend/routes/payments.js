/**
 * Payments Router Module Proxy
 * Delegates all payment endpoints to the modular payment architecture under modules/payments/
 */

module.exports = require('../modules/payments/payment.routes');
