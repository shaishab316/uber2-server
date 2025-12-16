import { Prisma } from '@/utils/db';
import type { TDateRange } from './Datetime.interface';

/**
 * Predefined date ranges for filtering
 */
export const dateRange = {
  /**
   * return today's date range
   */
  today() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    return {
      gte: new Date(year, month, date),
      lte: new Date(year, month, date + 1),
    };
  },

  /**
   * return this week's date range
   */
  this_week() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();

    return {
      gte: new Date(year, month, date - day),
      lte: new Date(year, month, date + (7 - day)),
    };
  },

  /**
   * return last week's date range
   */
  last_week() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();

    return {
      gte: new Date(year, month, date - day - 7),
      lte: new Date(year, month, date - day),
    };
  },

  /**
   * return this month's date range
   */
  this_month() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return {
      gte: new Date(year, month, 1),
      lte: new Date(year, month + 1, 1),
    };
  },

  /**
   * return last month's date range
   */
  last_month() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 1),
    };
  },

  /**
   * return this year's date range
   */
  this_year() {
    const now = new Date();
    const year = now.getFullYear();

    return {
      gte: new Date(year, 0, 1),
      lte: new Date(year + 1, 0, 1),
    };
  },
} satisfies Record<PropertyKey, () => Prisma.DateTimeFilter>;

/**
 * Array of available date range keys
 */
export const dateRanges = Object.keys(dateRange) as TDateRange[];
