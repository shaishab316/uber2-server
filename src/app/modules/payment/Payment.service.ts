import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { stripe } from './Payment.utils';
import { TTopup } from './Payment.interface';

export const PaymentServices = {
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
};
