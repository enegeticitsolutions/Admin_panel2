export interface SmsMessage {
    to: string;
    body: string;
    templateId?: string;
    variables?: string[];
}
export interface ISmsProvider {
    readonly name: string;
    send(message: SmsMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
