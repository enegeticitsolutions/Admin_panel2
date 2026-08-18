import { OtpProvider } from './OtpProvider';
import { TwilioProvider } from './TwilioProvider';
import { MockProvider } from './MockProvider';
import { Msg91Provider } from './Msg91Provider';
import { StplProvider } from './StplProvider';

export class OtpFactory {
  /**
   * Returns the appropriate OTP provider based on environment configuration.
   */
  static getProvider(): OtpProvider {
    const isProd = process.env.NODE_ENV === 'production';
    const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const hasStpl = !!(process.env.STPL_TEMPLATE_ID || process.env.STPL_AUTH_KEY || process.env.MSG91_FLOW_TEMPLATE_ID || process.env.OTP_PROVIDER === 'stpl');
    const hasMsg91 = !!process.env.MSG91_AUTH_KEY;

    // STPL Flow OTP Provider
    if (hasStpl) {
      return new StplProvider();
    }

    // MSG91 WhatsApp Provider
    if (hasMsg91) {
      return new Msg91Provider();
    }

    // Twilio SMS Provider
    if (hasTwilio && process.env.TWILIO_VERIFY_SERVICE_SID) {
      return new TwilioProvider();
    }

    // Default to Mock for development
    return new MockProvider();
  }
}
