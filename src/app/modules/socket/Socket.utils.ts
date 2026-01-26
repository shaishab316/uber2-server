/* eslint-disable no-unused-vars */
import type z from 'zod';
import { formatError } from '../../middlewares/globalErrorHandler';
import config from '@/config';

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

      response = {
        success: true,
        data: await fn(parsed)
      };
    } catch (error: any) {
      response = {
        success: false,
        error: formatError(error).errorMessages,
      };

      //? In development mode, include stack trace in the response
      if (config.server.isDevelopment) {
        Object.assign(response?.error?.[0] ?? {}, { stack: error.stack });
      }
    } finally {
      ack?.(response);
    }
  };
};
