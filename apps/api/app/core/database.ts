import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from './config';

const isLocal = !process.env.DATABASE_URL || 
  process.env.DATABASE_URL.includes('localhost') || 
  process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: config.nodeEnv === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

export default prisma;
