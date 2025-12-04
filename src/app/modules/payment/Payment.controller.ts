import chalk from 'chalk';
import config from '../../../config';
import catchAsync from '../../middlewares/catchAsync';
import { stripe, stripWebhookEventMap } from './Payment.utils';
import { StatusCodes } from 'http-status-codes';
import { errorLogger } from '../../../utils/logger';
import { TStripWebhookEvent } from './Payment.interface';
import { PaymentServices } from './Payment.service';
import Stripe from 'stripe';

export const PaymentControllers = {
  stripeWebhook: catchAsync(
    async ({ body, headers }, res) => {
      const sig = headers['stripe-signature'] as string;

      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        config.payment.stripe.web_hook_secret,
      );

      const eventHandler =
        stripWebhookEventMap[event.type as TStripWebhookEvent];

      if (!eventHandler)
        return res.status(StatusCodes.NOT_FOUND).json({ received: true });

      await eventHandler(event.data.object as Stripe.Checkout.Session);

      res.json({ received: true });
    },
    (error, _req, _res, next) => {
      errorLogger.error(
        chalk.red('🚨 stripeWebhook ~~ '),
        error.message,
        JSON.stringify(error.stack, null, 2),
      );

      next(error);
    },
  ),

  topup: catchAsync(async ({ body, user }) => {
    const url = await PaymentServices.topup({
      ...body,
      user_id: user.id,
    });

    return {
      track_activity: user.id,
      message: 'Topup payment link created successfully',
      data: { url },
    };
  }),
};
