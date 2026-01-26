/* eslint-disable no-var */
import type { PrismaClient as TPrismaClient, User as TUser } from '@/utils/db';
import type { Pool as TPgPool } from 'pg';

declare global {

  var pgPool: TPgPool | undefined;
  var prisma: TPrismaClient | undefined;

  namespace Express {
    interface Request {
      user: TUser;
      tempFiles: string[];
    }
  }

}
