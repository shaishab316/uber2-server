import Stripe from 'stripe';
import config from '@/config';
import { ETransactionType, prisma } from '@/utils/db';

/**
 * Stripe instance
 */
export const stripe = new Stripe(config.payment.stripe.secret_key);

export const stripWebhookEventMap = {
  'checkout.session.completed': async (session: Stripe.Checkout.Session) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string,
    );

    const { type: payment_method } = await stripe.paymentMethods.retrieve(
      paymentIntent.payment_method as string,
    );

    await prisma.transaction.create({
      data: {
        user_id: session.metadata?.user_id as string,
        amount: Number(session.metadata?.amount ?? 0),
        stripe_transaction_id: session.payment_intent as string,
        payment_method,
        type: ETransactionType.TOPUP,
      },
    });

    await prisma.wallet.update({
      where: {
        user_id: session.metadata?.user_id as string,
      },
      data: {
        balance: {
          increment: Number(session.metadata?.amount ?? 0),
        },
      },
    });
  },
};
