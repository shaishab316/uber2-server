import z from 'zod';
import { exists } from '../../../utils/db/exists';

/**
 * Validation for chat
 */
export const ChatValidations = {
  /**
   * Validation schema for new chat
   */
  newChat: z.object({
    body: z.object({
      user_id: z.string().refine(exists('user'), {
        error: ({ input }) => `User not found with id: ${input}`,
      }),
    }),
  }),

  /**
   * Validation schema for delete chat
   */
  deleteChat: z.object({
    body: z.object({
      chat_id: z.string().refine(exists('chat'), {
        error: ({ input }) => `Chat not found with id: ${input}`,
      }),
    }),
  }),

  /**
   * Validation schema for get inbox
   */
  getInbox: z.object({
    query: z.object({
      unread: z.string().optional(),
    }),
  }),
};
