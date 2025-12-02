import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@/utils/db';
import {
  createErrorMessage,
  defaultError,
} from '../app/middlewares/globalErrorHandler';

export const handlePrismaRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
) => {
  if (error.code === 'P2002') {
    let fields = 'Unique field';
    if (Array.isArray(error.meta?.target)) {
      fields = error.meta.target.join(', ');
    } else if (typeof error.meta?.target === 'string') {
      fields = error.meta.target;
    }

    return {
      statusCode: StatusCodes.CONFLICT,
      message: `${fields.replace(/^[^_]+_|_[^_]+$/g, '')} must be unique`,
      errorMessages: createErrorMessage(
        `${fields.replace(/^[^_]+_|_[^_]+$/g, '')} already exists`,
      ),
    };
  }

  if (error.code === 'P2025') {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Record not found',
      errorMessages: createErrorMessage(error.message),
    };
  }

  // fallback
  return {
    ...defaultError,
    message: error.message,
    errorMessages: createErrorMessage(error.message),
  };
};

export const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError,
) => ({
  statusCode: StatusCodes.BAD_REQUEST,
  message: 'Validation error from Prisma',
  errorMessages: createErrorMessage(error.message),
});
