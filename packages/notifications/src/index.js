"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = sendSMS;
exports.sendOTP = sendOTP;
exports.sendWhatsApp = sendWhatsApp;
exports.sendEmail = sendEmail;
exports.sendPush = sendPush;
const sms_channel_1 = require("./channels/sms.channel");
const whatsapp_channel_1 = require("./channels/whatsapp.channel");
__exportStar(require("./interfaces/ISmsProvider"), exports);
__exportStar(require("./interfaces/IWhatsAppProvider"), exports);
__exportStar(require("./providers/provider.factory"), exports);
const smsChannel = new sms_channel_1.SmsChannel();
const whatsAppChannel = new whatsapp_channel_1.WhatsAppChannel();
async function sendSMS(message) {
    return smsChannel.send(message);
}
async function sendOTP(to, otp, templateId) {
    return smsChannel.send({
        to,
        body: `Your MaiHoonNa verification code is: ${otp}. Do not share this OTP with anyone.`,
        templateId,
    });
}
async function sendWhatsApp(message) {
    return whatsAppChannel.send(message);
}
async function sendEmail(to, subject, body) {
    console.log(`[NotificationPackage:Email] Sending email to ${to} | Subject: ${subject}`);
    return { success: true, messageId: `mock-email-${Date.now()}` };
}
async function sendPush(targetToken, title, body, data) {
    console.log(`[NotificationPackage:Push] Sending push to ${targetToken} | Title: ${title}`);
    return { success: true, messageId: `mock-push-${Date.now()}` };
}
