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
    variables: ['Mr. Ramesh Kumar', 'https://pay.maihoonna.com/renew/sub-10293'],
  },
  {
    event: 'SCHEDULE_CHANGE_DECISION',
    variables: ['Approved', 'Mr. Ramesh Kumar', 'Sept 8 at 10:00 AM'],
  },
];

async function runTest() {
  console.log('Testing Batch 3 corrected templates against MSG91...');
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
