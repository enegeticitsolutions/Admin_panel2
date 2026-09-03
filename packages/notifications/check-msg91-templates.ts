import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../apps/api/.env') });

async function checkMsg91() {
  const authKey = process.env.MSG91_AUTH_KEY || '';
  const integratedNumber = process.env.MSG91_WHATSAPP_NUMBER || '';

  console.log('Querying MSG91 for templates & account status...');
  console.log('Integrated Number:', integratedNumber);

  // 1. Fetch templates from MSG91 control API
  const endpoints = [
    `https://control.msg91.com/api/v5/whatsapp/whatsapp-template/?integrated_number=${integratedNumber}`,
    `https://control.msg91.com/api/v5/whatsapp/whatsapp-template/`,
  ];

  for (const url of endpoints) {
    try {
      console.log(`\nGET ${url}...`);
      const res = await fetch(url, {
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Status: ${res.status}`);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        console.dir(json, { depth: 3 });
      } catch {
        console.log('Response (text):', text.slice(0, 300));
      }
    } catch (err: any) {
      console.error('Error fetching', url, err.message);
    }
  }
}

checkMsg91();
