import { IWhatsAppProvider, WhatsAppMessage } from '../../interfaces/IWhatsAppProvider';
export declare class Msg91WhatsAppProvider implements IWhatsAppProvider {
    readonly name = "msg91-whatsapp";
    private readonly authKey;
    private readonly integratedNumber;
    private readonly namespace;
    constructor();
    send(message: WhatsAppMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
