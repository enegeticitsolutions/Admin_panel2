import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  const execSafe = async (query: string, params: any[] = []) => {
    try {
      await client.query(query, params);
      console.log('Success:', query);
    } catch (e: any) {
      // ignore
      console.log('Skipped or failed:', query, '-', e.message);
    }
  };

  try {
    const phones = ['8826280049', '+918826280049', '8826352088', '+918826352088'];
    for (const phone of phones) {
      console.log('Processing phone:', phone);
      const res = await client.query(`SELECT id FROM users WHERE phone = $1 LIMIT 1`, [phone]);
      if (res.rows.length === 0) {
        console.log('User not found for phone:', phone);
        continue;
      }
      const userId = res.rows[0].id;
      console.log('Found user id:', userId);

      const benRes = await client.query(`SELECT id FROM beneficiaries WHERE "subscriberId" = $1 OR "userId" = $1`, [userId]);
      const benIds = benRes.rows.map(r => r.id);
      
      if (benIds.length > 0) {
        const benIdList = benIds.map(id => `'${id}'`).join(',');
        
        const subRes = await client.query(`SELECT id FROM subscriptions WHERE "beneficiaryId" IN (${benIdList})`);
        const subIds = subRes.rows.map(r => r.id);
        
        if (subIds.length > 0) {
          const subIdList = subIds.map(id => `'${id}'`).join(',');
          await execSafe(`DELETE FROM payments WHERE "subscriptionId" IN (${subIdList})`);
          await execSafe(`DELETE FROM package_hours_logs WHERE "subscriptionId" IN (${subIdList})`);
          await execSafe(`DELETE FROM subscription_benefit_balances WHERE "subscriptionId" IN (${subIdList})`);
          await execSafe(`DELETE FROM subscriptions WHERE id IN (${subIdList})`);
        }
        
        await execSafe(`DELETE FROM beneficiary_conditions WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM emergency_contacts WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM medical_records WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM medication_adherence WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM medications WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM vital_readings WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM vital_history WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM vital_alerts WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM visits WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM appointments WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM beneficiary_vital_configs WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM callback_requests WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM schedule_preferences WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM emergency_requests WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM call_logs WHERE "beneficiaryId" IN (${benIdList})`);
        
        // Delete volunteer_assignments first (blocks beneficiary deletion)
        await execSafe(`DELETE FROM volunteer_assignments WHERE "beneficiaryId" IN (${benIdList})`);
        await execSafe(`DELETE FROM beneficiaries WHERE id IN (${benIdList})`);
      }
      
      // User subs
      const subRes = await client.query(`SELECT id FROM subscriptions WHERE "subscriberId" = $1`, [userId]);
      if (subRes.rows.length > 0) {
        const subIdList = subRes.rows.map(r => `'${r.id}'`).join(',');
        await execSafe(`DELETE FROM payments WHERE "subscriptionId" IN (${subIdList})`);
        await execSafe(`DELETE FROM package_hours_logs WHERE "subscriptionId" IN (${subIdList})`);
        await execSafe(`DELETE FROM subscription_benefit_balances WHERE "subscriptionId" IN (${subIdList})`);
        await execSafe(`DELETE FROM subscriptions WHERE id IN (${subIdList})`);
      }
      
      await execSafe(`DELETE FROM appointments WHERE "bookedById" = $1`, [userId]);
      await execSafe(`DELETE FROM callback_requests WHERE "subscriberId" = $1`, [userId]);
      await execSafe(`DELETE FROM coupon_attempt_logs WHERE "userId" = $1`, [userId]);
      await execSafe(`DELETE FROM coupon_usages WHERE "userId" = $1`, [userId]);
      await execSafe(`DELETE FROM emergency_requests WHERE "requestedById" = $1`, [userId]);
      await execSafe(`DELETE FROM medical_records WHERE "uploadedById" = $1`, [userId]);
      await execSafe(`DELETE FROM notifications WHERE "userId" = $1`, [userId]);
      await execSafe(`DELETE FROM payments WHERE "subscriberId" = $1 OR "userId" = $1`, [userId]);
      await execSafe(`DELETE FROM staff_profiles WHERE "userId" = $1`, [userId]);
      await execSafe(`DELETE FROM addresses WHERE "userId" = $1`, [userId]);
      await execSafe(`DELETE FROM call_logs WHERE "callerId" = $1 OR "receiverId" = $1`, [userId]);
      
      await execSafe(`DELETE FROM users WHERE id = $1`, [userId]);
      
      console.log('Done deep cleaning user for phone:', phone);
    }
  } catch (e) {
    console.error('Error in main block:', e);
  } finally {
    client.release();
    pool.end();
  }
}
main();
