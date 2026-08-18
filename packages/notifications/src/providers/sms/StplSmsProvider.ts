import { ISmsProvider, SmsMessage } from '../../interfaces/ISmsProvider';

/**
 * STPL SMS / Flow Provider
 */
export class StplSmsProvider implements ISmsProvider {
  readonly name = 'stpl';

  private readonly authKey: string;
  private readonly templateId: string;

  constructor() {
    this.authKey = process.env.STPL_AUTH_KEY || process.env.MSG91_AUTH_KEY || '';
    this.templateId = process.env.STPL_TEMPLATE_ID || process.env.MSG91_FLOW_TEMPLATE_ID || '';
  }

  async send(message: SmsMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.authKey) {
      console.warn('[StplSmsProvider] STPL_AUTH_KEY not set in environment.');
      return { success: false, error: 'STPL_AUTH_KEY environment variable missing' };
    }

    const templateId = message.templateId || this.templateId;
    if (!templateId) {
      console.warn('[StplSmsProvider] STPL_TEMPLATE_ID not set in environment.');
      return { success: false, error: 'STPL_TEMPLATE_ID missing' };
    }

    try {
      const cleanPhone = message.to.replace(/[^0-9]/g, '');
      const recipient = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

      const payload = {
        template_id: templateId,
        recipients: [
          {
            mobiles: recipient,
            var: message.body,
          },
        ],
      };

      const response = await fetch('https://control.msg91.com/api/v5/flow', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authkey: this.authKey,
        },
        body: JSON.stringify(payload),
      });

      const result: any = await response.json();

      if (result.type === 'success' || (!result.hasError && result.status !== 'error')) {
        return { success: true, messageId: result.message || 'sent' };
      }

      return { success: false, error: result.message || JSON.stringify(result) };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown network error' };
    }
  }
}
