import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { WhatsAppChannel } from './src/channels/whatsapp.channel';
import { WhatsAppRegistry } from './src/registry/whatsapp.registry';

const whatsAppChannel = new WhatsAppChannel();
const TARGET_PHONE = '9305951785';

const templatesToTest = [
  {
    event: 'RENEWAL_PAYMENT_LINK',
    variables: ['Mr. Ramesh Kumar', 'Silver Care', 'https://pay.maihoonna.com/renew/sub-10293'],
  },
  {
    event: 'SUBSCRIPTION_HOURS_LOW',
    variables: ['Mr. Ramesh Kumar', '85%'],
  },
  {
    event: 'SUBSCRIPTION_HOURS_EXHAUSTED',
    variables: ['Mr. Ramesh Kumar'],
  },
  {
    event: 'MANUAL_CHECKIN_FLAGGED',
    variables: ['Priya Sharma', 'Mr. Ramesh Kumar', 'Client requested park walk'],
  },
  {
    event: 'SAATHI_VISIT_COMPLETED',
    variables: ['Mr. Ramesh Kumar', '25'],
  },
  {
    event: 'SAATHI_INTERACTION_REQUEST',
    variables: ['Mr. Ramesh Kumar'],
  },
];

async function runTest() {
  console.log('Testing the 6 corrected templates against MSG91...');
  for (const item of templatesToTest) {
    const reg = (WhatsAppRegistry as any)[item.event];
    console.log(`\nDispatching [${item.event}] with slug: "${reg.template}"...`);
    const res = await whatsAppChannel.send({
      to: TARGET_PHONE,
      templateName: reg.template,
      variables: item.variables,
    });
    console.log(`Result:`, res);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

runTest();
