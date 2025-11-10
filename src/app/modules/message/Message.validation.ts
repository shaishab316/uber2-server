import z from 'zod';
import { exists } from '../../../utils/db/exists';
import type { TModelZod } from '../../../types/zod';
import type { Message as TMessage } from '../../../utils/db';

/**
 * Validation for message
 */
export const MessageValidations = {
  /**
   * Validation schema for get chat messages
   */
  getChatMessages: z.object({
    query: z.object({
      chat_id: z.string().refine(exists('chat'), {
        error: ({ input }) => `Chat not found with id: ${input}`,
        path: ['chat_id'],
      }),
    }),
  }),

  /**
   *! socket validations
   */

  /**
   * Validation schema for create message
   */
  createMessage: z.object({
    chat_id: z.string().refine(exists('chat'), {
      error: ({ input }) => `Chat not found with id: ${input}`,
      path: ['chat_id'],
    }),
    text: z.string().optional(),
    media_urls: z.array(z.string()).optional(),
    parent_id: z
      .string()
      .refine(exists('message'), {
        error: ({ input }) => `Parent message not found with id: ${input}`,
        path: ['parent_id'],
      })
      .optional(),
  } satisfies TModelZod<TMessage>),

  /**
   * Validation schema for delete message
   */
  deleteMessage: z.object({
    message_id: z.string().refine(exists('message'), {
      error: ({ input }) => `Message not found with id: ${input}`,
      path: ['message_id'],
    }),
  }),
};
