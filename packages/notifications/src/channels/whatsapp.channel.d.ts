import { WhatsAppMessage } from '../interfaces/IWhatsAppProvider';
export declare class WhatsAppChannel {
    send(message: WhatsAppMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
