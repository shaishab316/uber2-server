/* eslint-disable no-unused-vars */
import Stripe from 'stripe';
import config from '../../../config';
import { prisma } from '../../../utils/db';
import { PaymentServices } from './Payment.service';

/**
 * Stripe instance
 */
export const stripe = new Stripe(config.payment.stripe.secret_key, {
  apiVersion: '2025-09-30.clover',
});

/**
 * Stripe webhook event map
 */
type TStripWebhookEventMap = Partial<
  Record<Stripe.Event.Type, (event: any) => Promise<void>>
>;

/**
 * Stripe webhook event map
 */
export const stripWebhookEventMap = {
  /**
   * for stripe account connect
   *
   * @deprecated not working
   */
  'account.updated': async (account: Stripe.Account) => {
    await prisma.user.updateMany({
      where: {
        stripe_account_id: account.id,
      },
      data: {
        is_stripe_connected: true,
      },
    });
  },

  /**
   * for stripe checkout session
   */
  'checkout.session.completed': async (session: Stripe.Checkout.Session) => {
    //? ensure session has a purpose
    if (!session?.metadata?.purpose) return;

    const purposeFn =
      PaymentServices[
        session?.metadata?.purpose as keyof typeof PaymentServices
      ];

    if (purposeFn) await purposeFn(session as any);

    /**
     * Todo: save transaction info in db
     */
  },
} satisfies TStripWebhookEventMap;
