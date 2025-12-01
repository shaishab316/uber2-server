import { z } from 'zod';

export const NotificationValidations = {
  getAllNotifications: z.object({
    query: z.object({
      is_read: z
        .string()
        .transform(val => val === 'true')
        .optional(),
    }),
  }),
};
