import { z } from 'zod';
import { exists } from '../../../utils/db/exists';

export const ReviewValidations = {
  giveReview: z.object({
    body: z.object({
      user_id: z.string().refine(exists('user'), {
        error: ({ input }) => `User not found with id: ${input}`,
        path: ['user_id'],
      }),
      rating: z.coerce.number().min(1).max(5).multipleOf(0.5).default(5),
      comment: z.string().trim().optional(),
      ref_parcel_id: z
        .string()
        .refine(exists('parcel'), {
          error: ({ input }) => `Parcel not found with id: ${input}`,
          path: ['ref_parcel_id'],
        })
        .optional(),
      ref_trip_id: z
        .string()
        .refine(exists('trip'), {
          error: ({ input }) => `Trip not found with id: ${input}`,
          path: ['ref_trip_id'],
        })
        .optional(),
    }),
  }),
};
