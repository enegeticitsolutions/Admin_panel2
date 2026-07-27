"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmsProvider = getSmsProvider;
exports.getWhatsAppProvider = getWhatsAppProvider;
const Msg91SmsProvider_1 = require("./sms/Msg91SmsProvider");
const TwilioSmsProvider_1 = require("./sms/TwilioSmsProvider");
const Msg91WhatsAppProvider_1 = require("./whatsapp/Msg91WhatsAppProvider");
let _smsProvider = null;
let _whatsappProvider = null;
function getSmsProvider() {
    if (_smsProvider)
        return _smsProvider;
    const providerName = process.env.SMS_PROVIDER || 'msg91';
    switch (providerName.toLowerCase()) {
        case 'msg91':
            _smsProvider = new Msg91SmsProvider_1.Msg91SmsProvider();
            break;
        case 'twilio':
            _smsProvider = new TwilioSmsProvider_1.TwilioSmsProvider();
            break;
        default:
            console.warn(`[ProviderFactory] Unknown SMS_PROVIDER "${providerName}", defaulting to Msg91SmsProvider`);
            _smsProvider = new Msg91SmsProvider_1.Msg91SmsProvider();
    }
    return _smsProvider;
}
function getWhatsAppProvider() {
    if (_whatsappProvider)
        return _whatsappProvider;
    const providerName = process.env.WHATSAPP_PROVIDER || 'msg91';
    switch (providerName.toLowerCase()) {
        case 'msg91':
            _whatsappProvider = new Msg91WhatsAppProvider_1.Msg91WhatsAppProvider();
            break;
        default:
            console.warn(`[ProviderFactory] Unknown WHATSAPP_PROVIDER "${providerName}", defaulting to Msg91WhatsAppProvider`);
            _whatsappProvider = new Msg91WhatsAppProvider_1.Msg91WhatsAppProvider();
    }
    return _whatsappProvider;
}
