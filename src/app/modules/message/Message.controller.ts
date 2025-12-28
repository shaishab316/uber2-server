import catchAsync from '../../middlewares/catchAsync';
import { MessageServices } from './Message.service';

/**
 * All message related controllers
 */
export const MessageControllers = {
  /**
   * Get chat messages
   */
  getChatMessages: catchAsync(async ({ query, user }) => {
    const { messages, meta } = await MessageServices.getChatMessages(query);

    return {
      message: 'Messages retrieved successfully!',
      meta,
      data: messages.reverse().map(msg => ({
        ...msg,
        is_mine: msg.user_id === user.id,
      })),
    };
  }),

  /**
   * Upload media
   */
  uploadMedia: catchAsync(async ({ body }) => {
    return {
      message: 'Media uploaded successfully!',
      data: body,
    };
  }),
};
