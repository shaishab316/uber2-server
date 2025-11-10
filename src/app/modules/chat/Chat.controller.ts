import catchAsync from '../../middlewares/catchAsync';
import { ChatServices } from './Chat.service';

/**
 * All chat related controllers
 */
export const ChatControllers = {
  /**
   * Create new chat
   */
  newChat: catchAsync(async ({ body, user }) => {
    const chat = await ChatServices.newChat({
      user_id: user.id,
      target_id: body.user_id,
    });

    return {
      message: 'Chat created successfully!',
      data: chat,
    };
  }),

  /**
   * Delete chat
   */
  deleteChat: catchAsync(async ({ body, user }) => {
    await ChatServices.deleteChat({
      user_id: user.id,
      chat_id: body.chat_id,
    });

    return {
      message: 'Chat deleted successfully!',
    };
  }),

  getInbox: catchAsync(async ({ query, user }) => {
    const { chats, meta } = await ChatServices.getInbox({
      ...query,
      user_id: user.id,
    });

    return {
      message: 'Inbox retrieved successfully!',
      meta,
      data: chats,
    };
  }),
};
