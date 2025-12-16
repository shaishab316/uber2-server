/* eslint-disable no-unused-vars */
import { Prisma } from '@/utils/db';
import type { dateRange } from './Datetime.utils';

/**
 * Type representing the keys of predefined date ranges
 */
export type TDateRange = keyof typeof dateRange;

/**
 * Type for a function that generates a Prisma DateTimeFilter
 */
export type TDatetimeFunction = (
  start?: string,
  end?: string,
  nullable?: boolean,
) => Prisma.DateTimeFilter;
