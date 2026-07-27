import { getWhatsAppProvider } from '../providers/provider.factory';
import { WhatsAppMessage } from '../interfaces/IWhatsAppProvider';

export class WhatsAppChannel {
  async send(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const provider = getWhatsAppProvider();
    return provider.send(message);
  }
}
