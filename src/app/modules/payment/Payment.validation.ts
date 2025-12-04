import z from 'zod';

/**
 * Validation for payment
 */
export const PaymentValidations = {
  /**
   * Validation for withdraw
   */
  withdraw: z.object({
    body: z.object({
      amount: z.coerce
        .number({ error: 'Amount is required' })
        .min(20, {
          error: 'Amount must be at least 20',
        })
        //? round to 2 decimals
        .transform(val => Math.floor(val * 100) / 100),
    }),
  }),
};
