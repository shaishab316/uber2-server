import { ZodError } from 'zod';
import type { TSocketHandler } from '../socket/Socket.interface';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';
import { MessageServices } from './Message.service';
import { MessageValidations } from './Message.validation';

export const MessageSocket: TSocketHandler = ({ socket, io }) => {
  const { user } = socket.data;

  //? send message
  socket.on(
    'send_message',
    catchAsyncSocket(async payload => {
      //? ensure that text or media is provided
      if (!payload.text && !payload.media_urls?.length) {
        throw new ZodError(
          ['text', 'media_urls'].map(path => ({
            code: 'custom',
            message: 'Text or media is required',
            path: [path],
          })),
        );
      }

      const { chat, seen_by, ...message } = await MessageServices.createMessage(
        {
          ...payload,
          user_id: user.id,
        },
      );

      const opponent_ids = chat.user_ids.filter(id => id !== user.id);

      //? notify opponent
      io.to(opponent_ids).emit(
        'new_message',
        socketResponse({
          message: "You've received a new message!",
          data: {
            ...message,
            seen_by: seen_by.map(({ avatar }) => avatar),
            name: user.name,
            avatar: user.avatar,
          },
        }),
      );

      return {
        message: 'Message sent successfully!',
        data: message,
      };
    }, MessageValidations.createMessage),
  );

  //? delete message
  socket.on(
    'delete_message',
    catchAsyncSocket(async ({ message_id }) => {
      const { chat } = await MessageServices.deleteMessage({
        message_id,
        user_id: user.id,
      });

      const opponent_ids = chat.user_ids.filter(id => id !== user.id);

      //? notify opponent
      io.to(opponent_ids).emit(
        'delete_message',
        socketResponse({
          message: 'A message has been deleted!',
          data: {
            message_id,
            chat_id: chat.id,
          },
        }),
      );

      return {
        message: 'Message deleted successfully!',
      };
    }, MessageValidations.deleteMessage),
  );
};
