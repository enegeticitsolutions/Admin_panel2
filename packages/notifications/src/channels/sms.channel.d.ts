import { SmsMessage } from '../interfaces/ISmsProvider';
export declare class SmsChannel {
    send(message: SmsMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
