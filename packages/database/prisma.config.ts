import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from packages/database or root if needed
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || '',
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },
});
