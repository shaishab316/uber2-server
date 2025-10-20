/* eslint-disable no-console */
import {
  stripe,
  stripWebhookEventMap,
} from '../src/app/modules/payment/Payment.utils';
import { type TStripWebhookEvent } from '../src/app/modules/payment/Payment.interface';
import config from '../src/config';
import env from '../src/utils/env/env';
import chalk from 'chalk';

(async () => {
  if (process.env.STRIPE_WEB_HOOK_SECRET) return;

  console.info(chalk.yellow('Setting up Stripe webhooks...'));

  const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });
  const { webhook_endpoint } = config.payment.stripe;

  const existingWebhook = webhooks.data.find(
    ({ url }) => url === webhook_endpoint,
  );

  if (existingWebhook) {
    await stripe.webhookEndpoints.del(existingWebhook.id);
  }

  const events = Object.keys(stripWebhookEventMap) as TStripWebhookEvent[];

  const newWebhook = await stripe.webhookEndpoints.create({
    url: webhook_endpoint,
    enabled_events: events,
    description: `Webhook for ${config.server.name}`,
  });

  config.payment.stripe.web_hook_secret = env(
    'stripe web hook secret',
    newWebhook.secret,
    {
      regex: '^whsec_[0-9a-zA-Z]{32,}$',
    },
  );

  console.info(chalk.green('Stripe webhooks setup successfully.'));
})();
