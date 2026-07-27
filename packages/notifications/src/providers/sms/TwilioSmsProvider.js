"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSmsProvider = void 0;
class TwilioSmsProvider {
    name = 'twilio';
    async send(_message) {
        console.warn('[TwilioSmsProvider] Twilio provider selected. Set SMS_PROVIDER=msg91 in .env to use active MSG91 provider.');
        return { success: false, error: 'Twilio provider not yet configured. Set SMS_PROVIDER=msg91 in environment.' };
    }
}
exports.TwilioSmsProvider = TwilioSmsProvider;
