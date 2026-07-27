import { SmsMessage } from './interfaces/ISmsProvider';
import { WhatsAppMessage } from './interfaces/IWhatsAppProvider';
export * from './interfaces/ISmsProvider';
export * from './interfaces/IWhatsAppProvider';
export * from './providers/provider.factory';
export declare function sendSMS(message: SmsMessage): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
export declare function sendOTP(to: string, otp: string, templateId?: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
export declare function sendWhatsApp(message: WhatsAppMessage): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
export declare function sendEmail(to: string, subject: string, body: string): Promise<{
    success: boolean;
    messageId: string;
}>;
export declare function sendPush(targetToken: string, title: string, body: string, data?: Record<string, any>): Promise<{
    success: boolean;
    messageId: string;
}>;
