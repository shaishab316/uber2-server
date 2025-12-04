import chalk from 'chalk';
import config from '../../../config';
import catchAsync from '../../middlewares/catchAsync';
import { stripe, stripWebhookEventMap } from './Payment.utils';
import { StatusCodes } from 'http-status-codes';
import { errorLogger } from '../../../utils/logger';
import { TStripWebhookEvent } from './Payment.interface';
import { prisma } from '../../../utils/db';
import { PaymentServices } from './Payment.service';

/**
 * Payment controllers
 */
export const PaymentControllers = {
  /**
   * Stripe Webhook
   */
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

      await eventHandler(event.data.object as any);

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

  /**
   * Stripe Connect
   */
  stripConnect: catchAsync(async ({ query }) => {
    await prisma.user.update({
      where: { id: query.user_id as string },
      data: { is_stripe_connected: true },
    });

    return { message: 'Stripe connected successfully' };
  }),

  withdraw: catchAsync(async ({ body, user }) => {
    const data = await PaymentServices.withdraw({
      amount: body.amount,
      user,
    });

    return {
      message: 'Withdraw request sent successfully',
      data,
    };
  }),
};
