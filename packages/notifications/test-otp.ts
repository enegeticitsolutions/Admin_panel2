import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { sendWhatsAppOTP } from './src/index';

async function testOtp() {
  console.log('Sending WhatsApp OTP to 9305951785...');
  const res = await sendWhatsAppOTP('9305951785', '482910');
  console.log('OTP Result:', res);
}
testOtp();
