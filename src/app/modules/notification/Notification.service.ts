import { prisma, type Prisma } from '@/utils/db';
import { TPagination } from '@/utils/server/serveResponse';
import { notificationSearchableFields } from './Notification.constants';
import { TGetAllNotificationsArgs } from './Notification.interface';
import pushQueue from '@/utils/mq/pushQueue';

export const NotificationServices = {
  async createNotification(payload: Prisma.NotificationCreateArgs['data']) {
    await pushQueue.add({
      message: payload.message,
      onesignal_ids: [payload.user_id],
    });

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
