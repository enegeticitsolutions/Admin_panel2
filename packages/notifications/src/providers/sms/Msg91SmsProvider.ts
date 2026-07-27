import { ISmsProvider, SmsMessage } from '../../interfaces/ISmsProvider';

export class Msg91SmsProvider implements ISmsProvider {
  readonly name = 'msg91';

  private readonly authKey: string;
  private readonly senderId: string;

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || '';
    this.senderId = process.env.MSG91_SENDER_ID || 'MAHOON';
  }

  async send(message: SmsMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.authKey) {
      console.warn('[Msg91SmsProvider] MSG91_AUTH_KEY not set in environment.');
      return { success: false, error: 'MSG91_AUTH_KEY environment variable missing' };
    }

    try {
      const cleanPhone = message.to.replace(/[^0-9]/g, '');
      const payload = {
        sender: this.senderId,
        route: '4', // Transactional route
        country: '91',
        sms: [
          {
            message: message.body,
            to: [cleanPhone],
          },
        ],
        ...(message.templateId ? { template_id: message.templateId } : {}),
      };

      const response = await fetch('https://api.msg91.com/api/v2/sendsms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: this.authKey,
        },
        body: JSON.stringify(payload),
      });

      const result: any = await response.json();

      if (result.type === 'success') {
        return { success: true, messageId: result.message };
      }

      return { success: false, error: result.message || 'MSG91 SMS send failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown network error' };
    }
  }
}
