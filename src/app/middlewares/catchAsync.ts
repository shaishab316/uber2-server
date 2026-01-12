/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import serveResponse, { TServeResponse } from '@/utils/server/serveResponse';

/**
 * Type for request body and query
 */
export type ReqProps = {
  body?: any;
  query?: any;
  params?: any;
};

/**
 * AsyncHandler type
 * Wraps an Express request handler with typed request body and query
 */
export type AsyncHandler<T extends ReqProps = ReqProps> = (
  req: Request<T['params'], any, T['body'], T['query']>,
  res: Response,
  next: NextFunction,
) =>
  | void
  | Partial<TServeResponse<any>>
  | Promise<void | Partial<TServeResponse<any>>>;

/**
 * Wraps an Express request handler to catch and handle async errors
 *
 * @param fn - The Express request handler function to wrap
 * @returns A wrapped request handler that catches async errors
 */
const catchAsync =
  <T extends ReqProps = ReqProps>(fn: AsyncHandler<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(
        req as Request<T['params'], any, T['body'], T['query']> & {
          params: T['params'];
        },
        res,
        next,
      );
      if (result) serveResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

export default catchAsync;
