import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { sendEmail } from './src/index';

async function testEmail() {
  console.log('Testing Email Channel...');
  const res = await sendEmail({
    to: 'test@example.com',
    subject: 'Welcome to MaiHoonNa Care!',
    html: '<h1>Welcome!</h1><p>Your subscription is now active.</p>',
  });

  console.log('Email Result:', res);
}

testEmail();
