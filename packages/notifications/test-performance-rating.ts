import { config } from 'dotenv';
import path from 'path';

// Load env from apps/api/.env
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

async function testPerformanceRating() {
  const authKey = process.env.MSG91_AUTH_KEY || '';
  const integratedNumber = '918527070049';
  const namespace = 'bf28acb3_8719_4168_9ed4_bc225dcfe30d';
  const targetPhone = '919305951785';

  const payload = {
    integrated_number: integratedNumber,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'cc_performance_rating_received',
        language: {
          code: 'en',
          policy: 'deterministic'
        },
        namespace: namespace,
        to_and_components: [
          {
            to: [targetPhone],
            components: {
              body_1: {
                type: 'text',
                value: '5' // {{1}} = Rating
              },
              body_2: {
                type: 'text',
                value: 'Mr. Sharma' // {{2}} = Beneficiary name
              },
              body_3: {
                type: 'text',
                value: 'Very polite and attentive care.' // {{3}} = Comment
              }
            }
          }
        ]
      }
    }
  };

  console.log('Sending payload to MSG91:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(`\nMSG91 Response Status: ${response.status}`);
    console.log('MSG91 Response Body:');
    console.dir(result, { depth: null });
  } catch (err: any) {
    console.error('Error sending message:', err.message || err);
  }
}

testPerformanceRating();
