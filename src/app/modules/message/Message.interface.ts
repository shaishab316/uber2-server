import type { z } from 'zod';
import type { MessageValidations } from './Message.validation';
import type { TList } from '../query/Query.interface';

/**
 * Type for delete message
 */
export type TDeleteMessageArgs = z.infer<
  typeof MessageValidations.deleteMessage
> & {
  user_id: string;
};

/**
 * Type for create message
 */
export type TCreateMessageArgs = z.infer<
  typeof MessageValidations.createMessage
> & { user_id: string };

/**
 * Type for get chat messages
 */
export type TGetChatMessagesArgs = z.infer<
  typeof MessageValidations.getChatMessages
>['query'] &
  TList;
