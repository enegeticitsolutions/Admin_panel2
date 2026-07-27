import { ISmsProvider, SmsMessage } from '../../interfaces/ISmsProvider';
export declare class TwilioSmsProvider implements ISmsProvider {
    readonly name = "twilio";
    send(_message: SmsMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
