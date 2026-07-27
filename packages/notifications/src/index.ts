import { SmsChannel } from './channels/sms.channel';
import { WhatsAppChannel } from './channels/whatsapp.channel';
import { SmsMessage } from './interfaces/ISmsProvider';
import { WhatsAppMessage } from './interfaces/IWhatsAppProvider';

export * from './interfaces/ISmsProvider';
export * from './interfaces/IWhatsAppProvider';
export * from './providers/provider.factory';

const smsChannel = new SmsChannel();
const whatsAppChannel = new WhatsAppChannel();

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

export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[NotificationPackage:Email] Sending email to ${to} | Subject: ${subject}`);
  return { success: true, messageId: `mock-email-${Date.now()}` };
}

export async function sendPush(targetToken: string, title: string, body: string, data?: Record<string, any>) {
  console.log(`[NotificationPackage:Push] Sending push to ${targetToken} | Title: ${title}`);
  return { success: true, messageId: `mock-push-${Date.now()}` };
}
