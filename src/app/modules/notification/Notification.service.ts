import { Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { SocketServices } from '../socket/Socket.service';
import { notificationSearchableFields } from './Notification.constants';
import { TGetAllNotificationsArgs } from './Notification.interface';

export const NotificationServices = {
  async createNotification(payload: Prisma.NotificationCreateArgs['data']) {
    const user = await prisma.user.findUnique({
      where: { id: payload.user_id },
      select: { is_online: true },
    });

    if (user?.is_online) {
      SocketServices.getIO()?.to(payload.user_id).emit('notification', payload);

      //? if user is online, mark notification as read
      payload.is_read = true;
    }

    //? create a new notification
    return prisma.notification.create({
      data: payload,
    });
  },

  async getAllNotifications({
    limit,
    page,
    is_read,
    search,
  }: TGetAllNotificationsArgs) {
    const where: Prisma.NotificationWhereInput = {};

    if (search) {
      where.OR = notificationSearchableFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (is_read !== undefined) {
      where.is_read = is_read;
    }

    const notifications = await prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ is_read: 'asc' }, { timestamp: 'desc' }],
    });

    const total = await prisma.notification.count({ where });

    return {
      notifications,
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },
};
