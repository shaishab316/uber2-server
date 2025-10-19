import type z from 'zod';
import { stripWebhookEventMap } from './Payment.utils';
import { PaymentValidations } from './Payment.validation';

export type TStripWebhookEvent = keyof typeof stripWebhookEventMap;
export type TTopup = z.infer<typeof PaymentValidations.topup>['body'] & {
  user_id: string;
};
