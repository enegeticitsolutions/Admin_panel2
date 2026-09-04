import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export * from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const dbUrl = process.env.DATABASE_URL;
  let client: PrismaClient;

  if (dbUrl) {
    const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } else {
    client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
export default prisma;
