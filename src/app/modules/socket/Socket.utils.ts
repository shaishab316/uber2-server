/* eslint-disable no-unused-vars */
import type z from 'zod';
import { TServeResponse } from '../../../utils/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { formatError } from '../../middlewares/globalErrorHandler';
import chalk from 'chalk';
import { errorLogger } from '../../../utils/logger';

export const catchAsyncSocket = <S extends z.ZodType>(
  fn: (data: z.infer<S>) => Promise<Partial<TServeResponse<any>>>,
  validator: S,
) => {
  return async (
    payload: unknown,
    ack?: (response: any) => void,
  ): Promise<void> => {
    const response: any = { success: false };
    try {
      const parsed = await validator.parseAsync(
        typeof payload === 'string' ? JSON.parse(payload) : payload,
      );

      Object.assign(response, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Success',
        ...(await fn(parsed)),
      });
    } catch (error: any) {
      Object.assign(response, formatError(error));
      errorLogger.error(chalk.red(response.message));
    } finally {
      ack?.(JSON.stringify(response));
    }
  };
};

export const socketResponse = <T>(
  response: Partial<TServeResponse<T>>,
): string =>
  JSON.stringify({
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Success',
    ...response,
  } as TServeResponse<T>);
