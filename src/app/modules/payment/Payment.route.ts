import { Router } from 'express';
import { PaymentControllers } from './Payment.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { PaymentValidations } from './Payment.validation';
import auth from '../../middlewares/auth';

const free = Router();
{
  free.all('/stripe/webhook', PaymentControllers.stripeWebhook);

  free.get(
    '/topup',
    auth.all,
    purifyRequest(PaymentValidations.topup),
    PaymentControllers.topup,
  );
}

export const PaymentRoutes = { free };
