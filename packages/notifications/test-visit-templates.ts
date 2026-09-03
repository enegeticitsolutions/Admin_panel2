import { config } from 'dotenv';
import path from 'path';

// Load env from apps/api/.env
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { notificationService } from './src/index';

async function testVisitTemplates() {
  const targetPhone = '9305951785';

  console.log('====================================================');
  console.log('1. Testing VISIT_SCHEDULED (NT-010)');
  console.log(`Sending to: ${targetPhone}`);
  console.log('====================================================');

  try {
    const result1 = await notificationService.send({
      channel: 'whatsapp',
      event: 'VISIT_SCHEDULED',
      to: targetPhone,
      variables: {
        ccName: 'Priya Sharma (Care Companion)',
        beneficiaryName: 'Mr. Ramesh Kumar',
        date: 'Thursday, Sept 4',
        time: '11:00 AM',
        address: 'Sector 62, Noida'
      }
    });

    console.log('VISIT_SCHEDULED result:');
    console.dir(result1, { depth: null });
  } catch (err: any) {
    console.error('VISIT_SCHEDULED Error:', err.stack || err);
  }

  console.log('\n====================================================');
  console.log('2. Testing VISIT_REMINDER (NT-011)');
  console.log(`Sending to: ${targetPhone}`);
  console.log('====================================================');

  try {
    const result2 = await notificationService.send({
      channel: 'whatsapp',
      event: 'VISIT_REMINDER',
      to: targetPhone,
      variables: {
        beneficiaryName: 'Mr. Ramesh Kumar',
        time: '11:00 AM'
      }
    });

    console.log('VISIT_REMINDER result:');
    console.dir(result2, { depth: null });
  } catch (err: any) {
    console.error('VISIT_REMINDER Error:', err.stack || err);
  }
}

testVisitTemplates();
