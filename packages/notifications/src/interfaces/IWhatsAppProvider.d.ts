export interface WhatsAppMessage {
    to: string;
    templateName: string;
    language?: string;
    variables: string[];
    mediaUrl?: string;
}
export interface IWhatsAppProvider {
    readonly name: string;
    send(message: WhatsAppMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
