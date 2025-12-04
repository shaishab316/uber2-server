import type z from 'zod';
import type { stripWebhookEventMap } from './Payment.utils';
import type { PaymentValidations } from './Payment.validation';
import { User as TUser } from '../../../utils/db';

/**
 * Stripe webhook event
 */
export type TStripWebhookEvent = keyof typeof stripWebhookEventMap;

/**
 * Withdraw args
 */
export type TWithdrawArgs = z.infer<
  typeof PaymentValidations.withdraw
>['body'] & {
  user: TUser;
};
