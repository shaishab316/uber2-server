/* eslint-disable no-unused-vars */
import type z from 'zod';
import { formatError } from '../../middlewares/globalErrorHandler';

export const catchAsyncSocket = <S extends z.ZodType>(
  fn: (data: z.infer<S>) => Promise<any>,
  validator: S,
) => {
  return async (
    payload: JSON | string,
    ack?: (response: any) => void,
  ): Promise<void> => {
    let response: any;

    try {
      if (typeof payload === 'string') payload = JSON.parse(payload.trim());
      const parsed = await validator.parseAsync(payload);

      response = await fn(parsed);
    } catch (error: any) {
      response = formatError(error).errorMessages;
    } finally {
      ack?.(response);
    }
  };
};
