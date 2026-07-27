import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    const id = 'b0d57d6e-b2e6-4b98-9e4c-e48a39f487c8';
    const dob = '1961-01-15';
    const age = 65;
    
    // Update Beneficiary
    await client.query(`UPDATE beneficiaries SET "dateOfBirth" = $1, age = $2 WHERE id = $3`, [dob, age, id]);
    
    // Query back
    const resBen = await client.query(`SELECT id, name, "dateOfBirth", age, "userId" FROM beneficiaries WHERE id = $1`, [id]);
    console.log('UPDATED BENEFICIARY IN DB:', JSON.stringify(resBen.rows[0], null, 2));
    
    if (resBen.rows[0]) {
      // Update User
      await client.query(`UPDATE users SET "dateOfBirth" = $1, age = $2 WHERE id = $3`, [dob, age, resBen.rows[0].userId]);
      const resUser = await client.query(`SELECT id, name, "dateOfBirth", age FROM users WHERE id = $1`, [resBen.rows[0].userId]);
      console.log('UPDATED USER IN DB:', JSON.stringify(resUser.rows[0], null, 2));
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    client.release();
    pool.end();
  }
}
main();
