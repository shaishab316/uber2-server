//? export full Prisma Client
export * from '@/../prisma/client/client.js';

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from '@/config';
import { PrismaClient } from '@/../prisma/client/client.js';
import ora from 'ora';
import chalk from 'chalk';

/**
 * Create pg.Pool singleton
 */
let pgPool = globalThis.pgPool

if (!pgPool) {
  globalThis.pgPool = pgPool = new pg.Pool({
    connectionString: config.url.database,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}



/**
 * Create Prisma Client singleton
 */
let prisma = globalThis.prisma!;

if (!prisma) {
  globalThis.prisma = prisma = new PrismaClient({
    adapter: new PrismaPg(pgPool),
  });
}


export { prisma, pgPool };


/** Connect to the database */
export async function connectDB() {
  const spinner = ora(chalk.blue('Connecting to the database...')).start();

  try {
    if (!prisma || !pgPool) {
      spinner.fail(chalk.red(`${!prisma && 'Prisma Client not initialized.'} ${!pgPool && 'pg.Pool not initialized.'}`));
      return () => { /* no-op */ };
    }

    await prisma.$connect();
    spinner.succeed(chalk.green('Connected to the database.'));

    return async () => {
      const spinner = ora(chalk.blue('Disconnecting database...')).start();

      await prisma?.$disconnect();
      await pgPool?.end();

      spinner.succeed(chalk.green('Database disconnected.'));
    };
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(chalk.red('Failed to connect to the database. ' + error.message));
    }

    throw error;
  }
}

