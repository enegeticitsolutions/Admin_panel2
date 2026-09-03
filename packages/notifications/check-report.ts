import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../apps/api/.env') });

async function checkReport() {
  const authKey = process.env.MSG91_AUTH_KEY || '';
  const requestIds = [
    'c8769c28c92740cd9e7dcdb9059bb8fb', // payment_success
    '1cd2894e193749ccb74d288749da5d5d', // visit_completed
  ];

  for (const reqId of requestIds) {
    const urls = [
      `https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/report/?request_id=${reqId}`,
      `https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/report/?request_id=${reqId}`,
      `https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/${reqId}`,
    ];

    console.log(`\n======================================================`);
    console.log(`Checking request_id: ${reqId}`);

    for (const u of urls) {
      try {
        const res = await fetch(u, {
          headers: { authkey: authKey },
        });
        console.log(`URL: ${u} (HTTP ${res.status})`);
        const text = await res.text();
        console.log(`Response:`, text.slice(0, 400));
        if (res.status === 200) break;
      } catch (e: any) {
        console.error(e.message);
      }
    }
  }
}

checkReport();
