import config from '@/config';
import catchAsync from '../../middlewares/catchAsync';
import { stripe, stripWebhookEventMap } from './Payment.utils';
import { StatusCodes } from 'http-status-codes';
import { TStripWebhookEvent } from './Payment.interface';
import { prisma } from '@/utils/db';
import { PaymentServices } from './Payment.service';
import { NotificationServices } from '../notification/Notification.service';

/**
 * Payment controllers
 */
export const PaymentControllers = {
  /**
   * Stripe Webhook
   */
  stripeWebhook: catchAsync(async ({ body, headers }, res) => {
    const sig = headers['stripe-signature'] as string;

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      config.payment.stripe.web_hook_secret,
    );

    const eventHandler = stripWebhookEventMap[event.type as TStripWebhookEvent];

    if (!eventHandler)
      return res.status(StatusCodes.NOT_FOUND).json({ received: true });

    await eventHandler(event.data.object as any);

    res.json({ received: true });
  }),

  /**
   * Stripe Connect
   */
  stripConnect: catchAsync(async ({ query }) => {
    await prisma.user.update({
      where: { id: query.user_id as string },
      data: { is_stripe_connected: true },
    });

    try {
      await NotificationServices.createNotification({
        user_id: query.user_id as string,
        title: 'Stripe Connected',
        message: 'Your Stripe account has been connected successfully.',
        type: 'INFO',
      })
    } catch (error) {
      console.error('Failed to send notification for Stripe connect:', error);
    }

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
