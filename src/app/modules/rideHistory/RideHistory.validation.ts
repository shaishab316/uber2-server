import z from 'zod';
import { dateRanges } from '../datetime/Datetime.utils';
import { TModels } from '@/types/db';

export const RideHistoryValidations = {
  getHistory: z.object({
    query: z.object({
      dateRange: z.enum(dateRanges).optional(),

      //? if custom date range then startDate and endDate are required
      startDate: z.iso.datetime().optional(),
      endDate: z.iso.datetime().optional(),

      //? Model type: trip or parcel to get earnings from
      tab: z.enum(['trip', 'parcel'] satisfies TModels[]).default('trip'),
    }),
  }),
};
