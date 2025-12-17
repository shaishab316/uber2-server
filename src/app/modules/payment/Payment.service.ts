import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../utils/db';
import ServerError from '../../../errors/ServerError';
import { TTopup, TWithdrawArgs } from './Payment.interface';
import stripeAccountConnectQueue from '../../../utils/mq/stripeAccountConnectQueue';
import withdrawQueue from '../../../utils/mq/withdrawQueue';
import config from '@/config';
import { stripe } from './Payment.utils';
import { NotificationServices } from '../notification/Notification.service';

/**
 * Payment Services
 */
export const PaymentServices = {
  /**
   * Withdraw money
   *
   * @event withdraw
   */
  async withdraw({ amount, user }: TWithdrawArgs) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: user.id },
    });

    if (!wallet) {
      throw new ServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Wallet not found',
      );
    }

    if (wallet.balance < amount) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        "You don't have enough balance",
      );
    }

    if (!user.is_stripe_connected) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        "You haven't connected your Stripe account",
      );
    }

    if (!user.stripe_account_id) {
      await stripeAccountConnectQueue.add({ user_id: user.id });

      throw new ServerError(
        StatusCodes.ACCEPTED,
        'Stripe account connecting. Try again later!',
      );
    }

    await withdrawQueue.add({ amount, user });

    //? Notify user about withdrawal request
    await NotificationServices.createNotification({
      user_id: user.id,
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal request of $${amount} is being processed.`,
      type: 'INFO',
    });

    return {
      available_balance: wallet.balance - amount,
    };
  },

  async topup({ amount, user_id }: TTopup) {
    const { url } = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: config.payment.currency,
            product_data: {
              name: `${config.server.name} Wallet Top-up of $${amount}`,
              description: 'Add funds to your wallet balance.',
              metadata: {
                type: 'wallet_topup',
              },
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      payment_method_types: config.payment.stripe.methods,
      success_url: `${config.server.name.toLowerCase()}://topup-success?amount=${amount}`,
      cancel_url: `${config.server.name.toLowerCase()}://topup-failure?amount=${amount}`,
      metadata: {
        purpose: 'wallet_topup',
        amount: amount.toString(),
        user_id,
      },
    });

    if (!url)
      throw new ServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create checkout session',
      );

    return url;
  },

  async wallet_topup(session: any) {
    const { amount, user_id } = session.metadata;
    const topupAmount = parseFloat(amount);

    //? Update wallet balance
    await prisma.wallet.update({
      where: { id: user_id },
      data: {
        balance: {
          increment: topupAmount,
        },
      },
    });

    //? Notify user about successful topup
    await NotificationServices.createNotification({
      user_id,
      title: 'Wallet Top-up Successful',
      message: `Your wallet has been topped up with $${topupAmount}. Happy riding!`,
      type: 'INFO',
    });
  },
};
