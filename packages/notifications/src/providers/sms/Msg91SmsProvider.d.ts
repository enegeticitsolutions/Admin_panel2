import { ISmsProvider, SmsMessage } from '../../interfaces/ISmsProvider';
export declare class Msg91SmsProvider implements ISmsProvider {
    readonly name = "msg91";
    private readonly authKey;
    private readonly senderId;
    constructor();
    send(message: SmsMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
