import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../apps/api/.env') });

async function directSend(templateName: string, variables: string[], phone: string) {
  const authKey = process.env.MSG91_AUTH_KEY || '';
  const integratedNumber = process.env.MSG91_WHATSAPP_NUMBER || '';
  const namespace = process.env.MSG91_WHATSAPP_NAMESPACE || '';

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const recipient = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const componentsObj: Record<string, any> = {};
  variables.forEach((val, idx) => {
    componentsObj[`body_${idx + 1}`] = { type: 'text', value: val };
  });

  const payload = {
    integrated_number: integratedNumber,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en', policy: 'deterministic' },
        namespace: namespace,
        to_and_components: [
          {
            to: [recipient],
            components: componentsObj,
          },
        ],
      },
    },
  };

  console.log(`\n---> Outbound Payload for ${templateName}:`);
  console.log(JSON.stringify(payload, null, 2));

  const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: authKey,
    },
    body: JSON.stringify(payload),
  });

  const rawJson = await response.json();
  console.log(`\n<--- MSG91 Raw Response for ${templateName} (HTTP ${response.status}):`);
  console.dir(rawJson, { depth: null });
  return rawJson;
}

async function run() {
  const phone = '9305951785';

  console.log('Testing: renewal_payment_link with plain text');
  await directSend(
    'renewal_payment_link',
    ['Mr. Ramesh Kumar', 'Silver Care'],
    phone
  );
}

run();
