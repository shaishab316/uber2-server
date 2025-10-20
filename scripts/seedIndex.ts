/* eslint-disable no-console */
import chalk from 'chalk';
import { MongoClient } from 'mongodb';
import config from '../src/config';

(async () => {
  const client = new MongoClient(config.url.database);

  console.log(chalk.green('🚀 Database connecting...'));
  await client.connect();
  console.log(chalk.green('🚀 Database connected successfully'));

  const db = client.db(config.server.db_name);

  console.log(chalk.green('🔑 DB Indexes setup started...'));
  try {
    await db
      .collection('users')
      .createIndex(
        { 'location.geo': '2dsphere' },
        { background: true, name: 'location__2dsphere' },
      );
  } finally {
    console.log(chalk.green('✅ DB Indexes setup successfully'));
    await client.close();
  }
})();
