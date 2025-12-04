import { Router } from 'express';
import { PaymentControllers } from './Payment.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { PaymentValidations } from './Payment.validation';
import auth from '../../middlewares/auth';

const free = Router();
{
  /**
   * Stripe Webhook for event listening
   */
  free.all('/stripe/webhook', PaymentControllers.stripeWebhook);

  /**
   * Stripe account connect
   */
  free.all('/stripe/connect', PaymentControllers.stripConnect);

  /**
   * Withdraw
   */
  free.post(
    '/withdraw',
    auth.all,
    purifyRequest(PaymentValidations.withdraw),
    PaymentControllers.withdraw,
  );
}

/**
 * Payment routes
 */
export const PaymentRoutes = {
  /**
   * Everyone can access
   *
   * @url : (base_url)/payments/
   */
  free,
};
