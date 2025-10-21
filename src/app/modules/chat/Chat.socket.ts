import { StatusCodes } from 'http-status-codes';
import { EUserRole, Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { MessageValidations } from '../message/Message.validation';
import { TSocketHandler } from '../socket/Socket.interface';
import { MessageServices } from '../message/Message.service';
import { ChatValidations } from './Chat.validation';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';

const ChatSocket: TSocketHandler = ({ io, socket }) => {
  const { user } = socket.data;
  const isUser = user.role === EUserRole.USER;

  socket.on(
    'join_chat_room',
    catchAsyncSocket(async ({ chat_id }) => {
      const chat = await prisma.chat.findFirst({
        where: { id: chat_id },
      });

      if (chat?.driver_id !== user.id && chat?.user_id !== user.id) {
        throw new ServerError(
          StatusCodes.FORBIDDEN,
          'You are not allowed to join this chat',
        );
      }

      // Join room
      socket.join(chat_id);

      return {
        message: 'Joined chat successfully',
        data: chat,
        meta: { chat_id },
      };
    }, ChatValidations.joinChat),
  );

  socket.on(
    'send_message',
    catchAsyncSocket(async ({ chat_id, content, media_type, media_urls }) => {
      const chat = await prisma.chat.findUnique({
        where: { id: chat_id },
      });

      const error = new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to send message to this chat',
      );

      const msgData: Prisma.MessageCreateArgs['data'] = {
        chat_id,
        content,
        media_type,
        media_urls,
      };

      if (isUser) {
        msgData.user_id = user.id;
        if (chat?.user_id !== user.id) throw error;
      } else {
        msgData.driver_id = user.id;
        if (chat?.driver_id !== user.id) throw error;
      }

      const message = await MessageServices.createMsg(msgData);

      io.to(chat_id).emit(
        'new_message',
        socketResponse({
          message: `New message from ${user.name}`,
          data: message,
          meta: { chat_id },
        }),
      );

      return {
        statusCode: StatusCodes.CREATED,
        message: 'Message sent successfully',
        data: message,
        meta: { chat_id },
      };
    }, MessageValidations.createMsg),
  );

  socket.on(
    'delete_message',
    catchAsyncSocket(async ({ message_id }) => {
      const message = await MessageServices.deleteMsg({
        message_id,
        user_id: user.id,
      });

      io.to(message.chat_id).emit(
        'delete_message',
        socketResponse({
          message: `Message deleted by ${user.name}`,
          data: message,
          meta: { chat_id: message.chat_id },
        }),
      );

      return {
        message: 'Message deleted successfully',
        data: message,
        meta: { chat_id: message.chat_id },
      };
    }, MessageValidations.deleteMsg),
  );
};

export default ChatSocket;
