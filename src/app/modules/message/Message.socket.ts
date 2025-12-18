import { ZodError } from 'zod';
import type { TSocketHandler } from '../socket/Socket.interface';
import { catchAsyncSocket } from '../socket/Socket.utils';
import { MessageServices } from './Message.service';
import { MessageValidations } from './Message.validation';
import { SocketServices } from '../socket/Socket.service';
import { prisma } from '@/utils/db';
import { NotificationServices } from '../notification/Notification.service';

export const MessageSocket: TSocketHandler = ({ socket }) => {
  const { user } = socket.data;

  //? send message
  socket.on(
    'message:send',
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

      //? notify opponent(s)
      opponent_ids.forEach(id =>
        SocketServices.emitToUser(id, 'message:new', {
          ...message,
          seen_by: seen_by.map(({ avatar }) => avatar),
          name: user.name,
          avatar: user.avatar,
        }),
      );

      //? Send notification to offline users
      for (const opponent_id of opponent_ids) {
        const opponent = await prisma.user.findUnique({
          where: { id: opponent_id },
          select: { is_online: true },
        });

        if (!opponent?.is_online) {
          await NotificationServices.createNotification({
            user_id: opponent_id,
            title: `New message from ${user.name}`,
            message: payload.text || 'Sent you a media file',
            type: 'INFO',
          });
        }
      }

      return message;
    }, MessageValidations.createMessage),
  );

  //? delete message
  socket.on(
    'message:delete',
    catchAsyncSocket(async ({ message_id }) => {
      const { chat } = await MessageServices.deleteMessage({
        message_id,
        user_id: user.id,
      });

      const opponent_ids = chat.user_ids.filter(id => id !== user.id);

      //? notify opponent(s)
      opponent_ids.forEach(id =>
        SocketServices.emitToUser(id, 'message:delete', {
          message_id,
          chat_id: chat.id,
        }),
      );

      return { message_id, chat_id: chat.id };
    }, MessageValidations.deleteMessage),
  );
};
