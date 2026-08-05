import { config } from 'dotenv';
import path from 'path';

// Load env variables
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { notificationService } from './src/index';

async function run() {
  console.log('Sending LAB_TEST_SCHEDULED to test number 9305951785...');
  
  const result = await notificationService.send({
    channel: 'whatsapp',
    event: 'LAB_TEST_SCHEDULED',
    to: '9305951785',
    variables: {
      beneficiaryName: 'John Doe',
      testName: 'Complete Blood Count (CBC)',
      dateTime: 'August 10th at 10:00 AM',
      labLocation: 'Lal PathLabs, South Ex'
    }
  });

  console.log('\nResult from MSG91 Provider:');
  console.log(result);
}

run();
