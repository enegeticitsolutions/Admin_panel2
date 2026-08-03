import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

async function main() {
  const client = new Client({ connectionString: DIRECT_URL });
  await client.connect();
  console.log('Connected to DB');
  
  const result = await client.query(`
    ALTER TABLE visits 
    ADD COLUMN IF NOT EXISTS "subscriberRating" INTEGER,
    ADD COLUMN IF NOT EXISTS "beneficiaryRating" INTEGER
  `);
  console.log('Migration result:', result.command);
  
  // Verify columns exist
  const check = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'visits' 
    AND column_name IN ('subscriberRating', 'beneficiaryRating')
  `);
  console.log('Columns found:', check.rows);
  
  await client.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
