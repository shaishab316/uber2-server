/* eslint-disable no-unused-vars,no-console */
import chalk from 'chalk';
import { createServer } from 'http';
import app from '@/app';
import config from '@/config';
import { errorLogger } from '../logger';
import { connectDB } from '../db';
import { TCleanupFunction, TServer } from '@/types/utils.types';
import ora from 'ora';

const startTime = performance.now();

const spinner = ora(chalk.yellow('Starting server...')).start();

/**
 * Creates a new HTTP server instance
 */
const server = createServer(app) as TServer;

/**
 * Adds plugins to the server
 *
 * @param {...TCleanupFunction} plugins - Plugins to add to the server
 */
server.addPlugins = (...plugins: TCleanupFunction[]) => {
  cleanups.push(...plugins);
};

/**
 * Array to store cleanup functions
 */
const cleanups: TCleanupFunction[] = [];

/**
 * Closes the server
 */
function closeServer(isError: boolean) {
  return async (error?: Error) => {
    await Promise.allSettled(cleanups.map(cleanup => cleanup()));
    server?.close(() => {
      if (isError && error) {
        errorLogger.error(chalk.red('❌ Server failed:'), error);
        process.exit(1);
      } else {
        console.log(chalk.cyan('Server closed gracefully'));
        process.exit(0);
      }
    });
  };
}

/**
 * Closes the server on exit, error, and unhandledRejection
 */
['SIGINT', 'SIGTERM', 'unhandledRejection', 'uncaughtException'].forEach(
  (signal, idx) => process.once(signal, closeServer(idx > 1)),
);

const { port, name } = config.server;

/**
 * Starts the server
 *
 * This function creates a new HTTP server instance and connects to the database.
 * It also seeds the admin user if it doesn't exist in the database.
 */
export default async function startServer() {
  try {
    spinner.text = chalk.yellow('Connecting to database...');
    server.addPlugins(await connectDB());

    spinner.text = chalk.yellow(`Listening on port ${port}...`);
    await new Promise<void>(done => server.listen(port, '0.0.0.0', done));
    const endTime = performance.now();
    spinner.succeed(
      chalk.green(
        `${name} is running ${chalk.blue.underline(`http://localhost:${port}`)}, ${chalk.gray(`time: ${endTime - startTime}ms`)}`,
      ),
    );

    return server;
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(chalk.red(`Server failed: ${error.message}`));
      closeServer(true)(error);
    }

    throw error;
  }
}
