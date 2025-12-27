import z from 'zod';
import { dateRanges } from '../datetime/Datetime.utils';

export const RideHistoryValidations = {
  getHistory: z.object({
    query: z.object({
      dateRange: z.enum(dateRanges).optional(),

      //? if custom date range then startDate and endDate are required
      startDate: z.iso.datetime().optional(),
      endDate: z.iso.datetime().optional(),
    }),
  }),
};
