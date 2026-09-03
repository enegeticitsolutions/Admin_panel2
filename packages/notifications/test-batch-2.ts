import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { WhatsAppChannel } from './src/channels/whatsapp.channel';
import { WhatsAppRegistry } from './src/registry/whatsapp.registry';

const whatsAppChannel = new WhatsAppChannel();
const TARGET_PHONE = '9305951785';

const templatesToTest = [
  {
    event: 'VISIT_SCHEDULED',
    variables: ['Priya Sharma', 'Mr. Ramesh Kumar', 'Sept 4', '11:00 AM', 'Sector 62, Noida'],
  },
  {
    event: 'VISIT_REMINDER',
    variables: ['Mr. Ramesh Kumar', '11:00 AM'],
  },
  {
    event: 'CM_ONBOARDING_CLEARED',
    variables: ['Priya Sharma', 'Amit Verma'],
  },
  {
    event: 'EMERGENCY_ACKNOWLEDGED',
    variables: ['Mr. Ramesh Kumar'],
  },
];

async function runTest() {
  console.log('Testing Batch 2 corrected templates against MSG91...');
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
