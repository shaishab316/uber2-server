import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { type Prisma, prisma } from '../../../utils/db';
import type {
  TCreateMessageArgs,
  TDeleteMessageArgs,
  TGetChatMessagesArgs,
} from './Message.interface';
import { messageSearchableFields } from './Message.constant';
import type { TPagination } from '../../../utils/server/serveResponse';
import { deleteFiles } from '../../middlewares/capture';

/**
 * All message related services
 */
export const MessageServices = {
  /**
   * Create new message
   */
  async createMessage(payload: TCreateMessageArgs) {
    return prisma.$transaction(async tx => {
      //? update chat timestamp
      tx.chat.update({
        where: { id: payload.chat_id },
        data: { timestamp: new Date() },
      });

      //? create message
      return tx.message.create({
        data: {
          ...payload,
          seen_by: {
            connect: {
              id: payload.user_id,
            },
          },
        },
        include: {
          chat: {
            select: {
              user_ids: true,
            },
          },
          seen_by: {
            select: {
              avatar: true,
            },
          },
        },
      });
    });
  },

  /**
   * Delete message
   */
  async deleteMessage({ message_id, user_id }: TDeleteMessageArgs) {
    const message = await prisma.message.findUnique({
      where: { id: message_id },
      select: { user_id: true, media_urls: true, isDeleted: true },
    });

    //? ensure that user has permission to delete message
    if (message?.user_id !== user_id) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        "You can't delete other's message",
      );
    }

    if (message.isDeleted) {
      throw new ServerError(StatusCodes.BAD_REQUEST, 'Message already deleted');
    }

    await deleteFiles(message.media_urls);

    return prisma.message.update({
      where: { id: message_id },
      data: {
        media_urls: [],
        text: '𝒹𝑒𝓁𝑒𝓉𝑒𝒹 𝓂𝑒𝓈𝓈𝒶𝑔𝑒',
        isDeleted: true,
      },
      select: {
        chat: {
          select: { id: true, user_ids: true },
        },
      },
    });
  },

  /**
   * Get chat messages
   */
  async getChatMessages({
    chat_id,
    limit,
    page,
    search,
  }: TGetChatMessagesArgs) {
    const messageWhere: Prisma.MessageWhereInput = {
      chat_id,
    };

    if (search) {
      messageWhere.OR = messageSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const messages = await prisma.message.findMany({
      where: messageWhere,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        seen_by: {
          select: {
            avatar: true,
          },
        },
      },
    });

    const total = await prisma.message.count({ where: messageWhere });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      messages: messages.map(({ seen_by, ...message }) => ({
        ...message,
        seen_by: seen_by.map(user => user.avatar),
      })),
    };
  },
};
