import { ISmsProvider } from '../interfaces/ISmsProvider';
import { IWhatsAppProvider } from '../interfaces/IWhatsAppProvider';
import { Msg91SmsProvider } from './sms/Msg91SmsProvider';
import { TwilioSmsProvider } from './sms/TwilioSmsProvider';
import { Msg91WhatsAppProvider } from './whatsapp/Msg91WhatsAppProvider';

let _smsProvider: ISmsProvider | null = null;
let _whatsappProvider: IWhatsAppProvider | null = null;

export function getSmsProvider(): ISmsProvider {
  if (_smsProvider) return _smsProvider;

  const providerName = process.env.SMS_PROVIDER || 'msg91';

  switch (providerName.toLowerCase()) {
    case 'msg91':
      _smsProvider = new Msg91SmsProvider();
      break;
    case 'twilio':
      _smsProvider = new TwilioSmsProvider();
      break;
    default:
      console.warn(`[ProviderFactory] Unknown SMS_PROVIDER "${providerName}", defaulting to Msg91SmsProvider`);
      _smsProvider = new Msg91SmsProvider();
  }

  return _smsProvider;
}

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (_whatsappProvider) return _whatsappProvider;

  const providerName = process.env.WHATSAPP_PROVIDER || 'msg91';

  switch (providerName.toLowerCase()) {
    case 'msg91':
      _whatsappProvider = new Msg91WhatsAppProvider();
      break;
    default:
      console.warn(`[ProviderFactory] Unknown WHATSAPP_PROVIDER "${providerName}", defaulting to Msg91WhatsAppProvider`);
      _whatsappProvider = new Msg91WhatsAppProvider();
  }

  return _whatsappProvider;
}
