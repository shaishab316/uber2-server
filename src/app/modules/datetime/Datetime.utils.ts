import { Prisma } from '@/utils/db';
import type { TDateRange } from './Datetime.interface';
import ms from 'ms';

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

  /**
   * return yesterday's date range
   */
  yesterday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    return {
      gte: new Date(year, month, date - 1),
      lte: new Date(year, month, date),
    };
  },

  /**
   * return tomorrow's date range
   */
  tomorrow() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    return {
      gte: new Date(year, month, date + 1),
      lte: new Date(year, month, date + 2),
    };
  },

  /**
   * return next week's date range
   */
  next_week() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();

    return {
      gte: new Date(year, month, date + (7 - day)),
      lte: new Date(year, month, date + (14 - day)),
    };
  },

  /**
   * return next month's date range
   */
  next_month() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return {
      gte: new Date(year, month + 1, 1),
      lte: new Date(year, month + 2, 1),
    };
  },

  /**
   * return this quarter's date range (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
   */
  this_quarter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;

    return {
      gte: new Date(year, quarterStartMonth, 1),
      lte: new Date(year, quarterStartMonth + 3, 1),
    };
  },

  /**
   * return last quarter's date range
   */
  last_quarter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const lastQuarterStartMonth = quarterStartMonth - 3;

    if (lastQuarterStartMonth < 0) {
      return {
        gte: new Date(year - 1, lastQuarterStartMonth + 12, 1),
        lte: new Date(year, 0, 1),
      };
    }

    return {
      gte: new Date(year, lastQuarterStartMonth, 1),
      lte: new Date(year, quarterStartMonth, 1),
    };
  },

  /**
   * return next quarter's date range
   */
  next_quarter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const nextQuarterStartMonth = quarterStartMonth + 3;

    if (nextQuarterStartMonth >= 12) {
      return {
        gte: new Date(year + 1, 0, 1),
        lte: new Date(year + 1, 3, 1),
      };
    }

    return {
      gte: new Date(year, nextQuarterStartMonth, 1),
      lte: new Date(year, nextQuarterStartMonth + 3, 1),
    };
  },

  /**
   * return last year's date range
   */
  last_year() {
    const now = new Date();
    const year = now.getFullYear();

    return {
      gte: new Date(year - 1, 0, 1),
      lte: new Date(year, 0, 1),
    };
  },

  /**
   * return next year's date range
   */
  next_year() {
    const now = new Date();
    const year = now.getFullYear();

    return {
      gte: new Date(year + 1, 0, 1),
      lte: new Date(year + 2, 0, 1),
    };
  },

  /**
   * return year to date range (from Jan 1 to now)
   */
  year_to_date() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    return {
      gte: new Date(year, 0, 1),
      lte: new Date(year, month, date + 1),
    };
  },

  /**
   * return month to date range (from 1st of month to now)
   */
  month_to_date() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    return {
      gte: new Date(year, month, 1),
      lte: new Date(year, month, date + 1),
    };
  },

  /**
   * return quarter to date range (from start of quarter to now)
   */
  quarter_to_date() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const quarterStartMonth = Math.floor(month / 3) * 3;

    return {
      gte: new Date(year, quarterStartMonth, 1),
      lte: new Date(year, month, date + 1),
    };
  },

  /**
   * return week to date range (from Sunday to now)
   */
  week_to_date() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();

    return {
      gte: new Date(year, month, date - day),
      lte: new Date(year, month, date + 1),
    };
  },

  /**
   * return last 24 hours from now
   */
  last_24_hours() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('24h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 48 hours from now
   */
  last_48_hours() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('48h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 72 hours from now
   */
  last_72_hours() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('72h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return this fiscal year (assuming fiscal year starts in April)
   */
  this_fiscal_year() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // If current month is before April, fiscal year started last calendar year
    const fiscalYearStart = month < 3 ? year - 1 : year;

    return {
      gte: new Date(fiscalYearStart, 3, 1), // April 1
      lte: new Date(fiscalYearStart + 1, 3, 1),
    };
  },

  /**
   * return last fiscal year
   */
  last_fiscal_year() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const fiscalYearStart = month < 3 ? year - 2 : year - 1;

    return {
      gte: new Date(fiscalYearStart, 3, 1),
      lte: new Date(fiscalYearStart + 1, 3, 1),
    };
  },

  /**
   * return all time date range (from epoch to now)
   */
  all_time: () => ({}),

  /**
   * return last hour from now
   */
  last_hour() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('1h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 2 hours from now
   */
  last_2_hours() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('2h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 3 hours from now
   */
  last_3_hours() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('3h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 6 hours from now
   */
  last_6_hours() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('6h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 12 hours from now
   */
  last_12_hours() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('12h'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 15 minutes from now
   */
  last_15_minutes() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('15m'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 30 minutes from now
   */
  last_30_minutes() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('30m'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 45 minutes from now
   */
  last_45_minutes() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('45m'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 5 minutes from now
   */
  last_5_minutes() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('5m'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 10 minutes from now
   */
  last_10_minutes() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('10m'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 7 days from now (rolling week)
   */
  last_7_days() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('7d'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 14 days from now
   */
  last_14_days() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('14d'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 30 days from now (rolling month)
   */
  last_30_days() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('30d'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 60 days from now
   */
  last_60_days() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('60d'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 90 days from now (rolling quarter)
   */
  last_90_days() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('90d'));

    return {
      gte: past,
      lte: now,
    };
  },

  /**
   * return last 180 days from now
   */
  last_180_days() {
    const now = new Date();
    const past = new Date(now.getTime() - ms('180d'));

    return {
      gte: past,
      lte: now,
    };
  },
} satisfies Record<PropertyKey, () => Prisma.DateTimeFilter>;

/**
 * Array of available date range keys
 */
export const dateRanges = Object.keys(dateRange) as TDateRange[];
