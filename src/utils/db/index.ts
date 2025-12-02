import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from '@/config';
import { PrismaClient } from '@/../prisma/client/client.js';
export * from '@/../prisma/client/client.js';

/**
 * Prisma Client instance
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new pg.Pool({
      connectionString: config.url.database,
    }),
  ),
});

/** Connect to the database */
export async function connectDB() {
  await prisma.$connect();

  return () => prisma.$disconnect();
}
