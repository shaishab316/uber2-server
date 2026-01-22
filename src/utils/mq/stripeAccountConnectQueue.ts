import Queue from 'bull';
import config from '../../config';
import { prisma } from '../db';
import chalk from 'chalk';
import { stripe } from '../../app/modules/payment/Payment.utils';
import { errorLogger } from '../logger';
import ora from 'ora';

const stripeAccountConnectQueue = new Queue<{ user_id: string }>(
  `${config.server.name}:stripe-account-connect`,
  config.url.redis,
);

stripeAccountConnectQueue.process(async ({ data }) => {
  const user = await prisma.user.findUnique({
    where: { id: data.user_id },
    select: {
      stripe_account_id: true,
      email: true,
    },
  });

  if (!user) return;

  if (!user.stripe_account_id) {
    const spinner = ora({
      color: 'yellow',
      text: `Checking Stripe account for ${user.email}`,
    }).start();

    try {
      const stripeAccount = await stripe.accounts.create({
        type: 'express',
        email: user.email ?? undefined,
        capabilities: {
          transfers: { requested: true },
        },
      });

      await prisma.user.update({
        where: { id: data.user_id },
        data: { stripe_account_id: stripeAccount.id },
      });

      spinner.succeed(`Stripe account created for ${user.email}`);
    } catch (error) {
      spinner.fail(`Failed creating Stripe account for ${user.email}`);

      errorLogger.error(
        chalk.red(`Error creating Stripe account for ${user.email}`),
        error,
      );
    }
  }
});

/**
 * This queue is used to create a Stripe account for a user
 */
export default stripeAccountConnectQueue;
