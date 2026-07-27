import { ISmsProvider, SmsMessage } from '../../interfaces/ISmsProvider';

export class TwilioSmsProvider implements ISmsProvider {
  readonly name = 'twilio';

  async send(_message: SmsMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.warn('[TwilioSmsProvider] Twilio provider selected. Set SMS_PROVIDER=msg91 in .env to use active MSG91 provider.');
    return { success: false, error: 'Twilio provider not yet configured. Set SMS_PROVIDER=msg91 in environment.' };
  }
}
