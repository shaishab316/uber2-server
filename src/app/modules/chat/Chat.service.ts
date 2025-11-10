import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { Prisma, Chat as TChat, prisma } from '../../../utils/db';
import { TDeleteChatArgs, TGetInboxArgs, TNewChatArgs } from './Chat.interface';
import { TPagination } from '../../../utils/server/serveResponse';

/**
 * All chat related services
 */
export const ChatServices = {
  /**
   * Create new chat
   */
  async newChat({ user_id, target_id }: TNewChatArgs): Promise<TChat> {
    const user_ids = Array.from(new Set([user_id, target_id])).sort();

    if (user_ids.length < 2) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'You cannot chat with yourself',
      );
    }

    //? find or create chat between users
    return prisma.chat.upsert({
      where: { user_ids },
      update: {},
      create: {
        user_ids,
        users: {
          connect: user_ids.map(id => ({ id })),
        },
      },
    });
  },

  /**
   * Delete chat
   */
  async deleteChat({ chat_id, user_id }: TDeleteChatArgs): Promise<void> {
    const chat = await prisma.chat.findUnique({
      where: { id: chat_id },
      select: { user_ids: true },
    });

    //? ensure that user has permission to delete chat
    if (!chat?.user_ids.includes(user_id)) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        "You can't delete other's chat",
      );
    }

    await prisma.chat.delete({
      where: { id: chat_id },
      select: { id: true }, //? skip body
    });
  },

  /**
   * Get inbox of user
   */
  async getInbox({ limit, page, user_id, search, unread }: TGetInboxArgs) {
    const chatWhere: Prisma.ChatWhereInput = {
      user_ids: { has: user_id },
    };

    if (search) {
      chatWhere.users = {
        some: {
          name: { contains: search, mode: 'insensitive' },
        },
      };
    }

    if (unread) {
      chatWhere.messages = {
        some: {
          user_id: { not: user_id },
          seen_by: {
            none: {
              id: user_id, //? user has not seen message
            },
          },
        },
      };
    }

    const chats = await prisma.chat.findMany({
      where: chatWhere,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        users: {
          select: { id: true, name: true, avatar: true },
        },
        messages: {
          take: 1,
          orderBy: { updated_at: 'desc' },
          select: {
            text: true,
            updated_at: true,
            seen_by: { select: { id: true } },
            user_id: true,
          },
        },
      },
    });

    const total = await prisma.chat.count({ where: chatWhere });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      chats: chats.map(({ id, users, messages }) => {
        const opponent = users.find(user => user.id !== user_id);
        const lastMessage = messages[0];

        return {
          id,
          name: opponent?.name ?? null,
          avatar: opponent?.avatar ?? null,
          last_message: lastMessage?.text ?? null,
          timestamp: lastMessage?.updated_at ?? null,
          unread: lastMessage
            ? !lastMessage.seen_by.some(sb => sb.id === user_id) &&
              lastMessage.user_id !== user_id
            : false,
        };
      }),
    };
  },
};
