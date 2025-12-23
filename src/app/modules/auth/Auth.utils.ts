import jwt from 'jsonwebtoken';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { errorLogger } from '../../../utils/logger';
import chalk from 'chalk';
import bcrypt from 'bcryptjs';
import { enum_decode } from '../../../utils/transform/enum';

export type TToken = keyof typeof config.jwt;

export type TTokenPayload = {
  uid: string;
  exp?: number;
  iat?: number;
};

const ALGORITHM = 'HS256' satisfies jwt.Algorithm;

/**
 * Create a token
 * @param payload - The payload to sign
 * @param token_type - The type of token to create
 * @returns The signed token
 */
export const encodeToken = (payload: TTokenPayload, token_type: TToken) => {
  Object.assign(payload, { token_type });

  try {
    return jwt.sign(payload, config.jwt[token_type].secret, {
      expiresIn: config.jwt[token_type].expire_in,
      algorithm: ALGORITHM,
    });
  } catch (error: any) {
    errorLogger.error(chalk.red('🔑 Failed to create token'), error);
    throw new ServerError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create token ::=> ' + error.message,
    );
  }
};

/**
 * Verify a token with improved error handling
 * @param token - The token to verify
 * @param token_type - The type of token to verify
 * @returns The decoded token
 */
export const decodeToken = (token: string | undefined, token_type: TToken) => {
  const error = new ServerError(
    StatusCodes.UNAUTHORIZED,
    `Please provide a valid ${enum_decode(token_type)}.`,
  );

  if (!token || token.length > 400) {
    throw error;
  }

  token = token?.trim()?.match(/[\w-]+\.[\w-]+\.[\w-]+/)?.[0];

  if (!token) throw error;

  try {
    return jwt.verify(token, config.jwt[token_type].secret, {
      algorithms: [ALGORITHM],
    }) as TTokenPayload;
  } catch {
    throw error;
  }
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(config.bcrypt_salt_rounds);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
