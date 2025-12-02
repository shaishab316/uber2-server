import { PrismaClient } from '@/utils/db';

export type TModels = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: any }
    ? K
    : never;
}[keyof PrismaClient];
