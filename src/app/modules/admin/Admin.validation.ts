import { exists } from '@/utils/db/exists';
import z from 'zod';

export const AdminValidations = {
  userTripDetails: z.object({
    query: z.object({
      user_id: z.string().refine(exists('user'), {
        error: ({ input }) => `User with id ${input} does not exist.`,
      }),
      tab: z.enum(['Trips', 'Parcels']).default('Trips'),
      start_date: z.iso.date().optional(),
      end_date: z.iso.date().optional(),
    }),
  }),
};
