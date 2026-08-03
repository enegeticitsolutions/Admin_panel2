import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres.ggjbkdlioayfegcsbprv:HarHarMahadev%4007@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
    directUrl: process.env.DIRECT_URL || 'postgresql://postgres.ggjbkdlioayfegcsbprv:HarHarMahadev%4007@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  },
});
