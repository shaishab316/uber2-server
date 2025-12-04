/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import serveResponse, { TServeResponse } from '@/utils/server/serveResponse';
import { UserActivityServices } from '../modules/userActivity/UserActivity.service';

type AsyncHandler<T = any> = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction,
) =>
  | void
  | Partial<TServeResponse<T>>
  | Promise<void | Partial<TServeResponse<T>>>;

/**
 * Wraps an Express request handler to catch and handle async errors
 *
 * @param fn - The Express request handler function to wrap
 * @returns A wrapped request handler that catches async errors
 */
const catchAsync =
  <T = any>(fn: AsyncHandler<T>, errFn: ErrorRequestHandler | null = null) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(req, res, next);

      //? Log user activity if track_activity is set
      if (result?.track_activity) {
        await UserActivityServices.createActivity({
          user_id: result.track_activity,
          path: req.originalUrl,
          content: result.message ?? 'Unavailable',
        });
      }

      //? Send response if result is returned
      if (result) serveResponse(res, result);
    } catch (error) {
      if (errFn) return errFn(error, req, res, next);
      next(error);
    }
  };

export default catchAsync;
