import { exists } from '@/utils/db/exists';
import z from 'zod';

export const UserActivityValidations = {
  toggleReadStatus: z.object({
    body: z.object({
      activity_id: z
        .string()
        .refine(exists('userActivity'), {
          error: ({ input }) => `Activity with id ${input} does not exist.`,
        })
        .optional(),
      unread: z.boolean().default(false),
    }),
  }),

  deleteActivity: z.object({
    body: z.object({
      activity_id: z
        .string()
        .refine(exists('userActivity'), {
          error: ({ input }) => `Activity with id ${input} does not exist.`,
        })
        .optional(),
    }),
  }),

  getAllActivity: z.object({
    query: z.object({
      user_id: z
        .string()
        .refine(exists('user'), {
          error: ({ input }) => `User with id ${input} does not exist.`,
        })
        .optional(),
      unread: z.boolean().optional(),
      start_date: z.iso.date().optional(),
      end_date: z.iso.date().optional(),
    }),
  }),
};
