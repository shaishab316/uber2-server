import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export type TPagination = {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
};

export type TServeResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: Record<string, unknown> & { pagination?: TPagination };
  data?: T;
};

/**
 * Sends a standardized API response with consistent formatting
 * including success status, message, metadata and optional data payload
 */
const serveResponse = <T>(
  res: Response,
  {
    statusCode = StatusCodes.OK,
    message,
    meta,
    data,
  }: Partial<TServeResponse<T>> = {},
): void => {
  res.statusCode = statusCode;
  if (message) {
    res.statusMessage = message;
  }

  res.json(meta ? { meta, data } : data);
};

export default serveResponse;
