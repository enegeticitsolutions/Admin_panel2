import { SmsChannel } from './channels/sms.channel';
import { WhatsAppChannel } from './channels/whatsapp.channel';
import { PushChannel } from './channels/push.channel';
import { SmsMessage } from './interfaces/ISmsProvider';
import { WhatsAppMessage } from './interfaces/IWhatsAppProvider';
import { PushNotificationMessage } from './interfaces/IPushProvider';

export * from './interfaces/ISmsProvider';
export * from './interfaces/IWhatsAppProvider';
export * from './interfaces/IPushProvider';
export * from './providers/provider.factory';
export * from './providers/push/expo-fcm.provider';
export * from './channels/sms.channel';
export * from './channels/whatsapp.channel';
export * from './channels/push.channel';
export * from './services/notification.service';
export * from './services/care-mitra-notification.service';
export * from './registry/whatsapp.registry';
export * from './registry/care-mitra-templates.registry';
export * from './pubsub/notification-event-bus';

const smsChannel = new SmsChannel();
const whatsAppChannel = new WhatsAppChannel();
const pushChannel = new PushChannel();

export async function sendSMS(message: SmsMessage) {
  return smsChannel.send(message);
}

export async function sendOTP(to: string, otp: string, templateId?: string) {
  return smsChannel.send({
    to,
    body: `Your MaiHoonNa verification code is: ${otp}. Do not share this OTP with anyone.`,
    templateId,
  });
}

export async function sendWhatsApp(message: WhatsAppMessage) {
  return whatsAppChannel.send(message);
}

export async function sendWhatsAppOTP(to: string, otp: string) {
  return whatsAppChannel.send({
    to,
    templateName: process.env.MSG91_WHATSAPP_OTP_TEMPLATE || 'otp',
    variables: [otp],
    components: {
      body_1: { type: 'text', value: otp },
      button_1: { subtype: 'url', type: 'text', value: otp },
    },
  });
}

export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[NotificationPackage:Email] Sending email to ${to} | Subject: ${subject}`);
  return { success: true, messageId: `mock-email-${Date.now()}` };
}

export async function sendPush(message: PushNotificationMessage) {
  return pushChannel.send(message);
}

