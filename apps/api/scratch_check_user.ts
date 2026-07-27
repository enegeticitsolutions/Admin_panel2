import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    const res = await client.query(`SELECT id, phone, name, role FROM users WHERE phone IN ('9305951785', '+919305951785')`);
    if (res.rows.length === 0) {
      console.log('User not found.');
    } else {
      console.log('User found in the database:');
      console.log(res.rows[0]);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    client.release();
    pool.end();
  }
}
main();
