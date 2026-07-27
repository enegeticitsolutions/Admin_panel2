import { getSmsProvider } from '../providers/provider.factory';
import { SmsMessage } from '../interfaces/ISmsProvider';

export class SmsChannel {
  async send(message: SmsMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const provider = getSmsProvider();
    return provider.send(message);
  }
}
