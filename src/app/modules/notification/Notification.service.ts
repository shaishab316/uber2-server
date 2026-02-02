import { prisma, type Prisma } from '@/utils/db';
import { TPagination } from '@/utils/server/serveResponse';
import { notificationSearchableFields } from './Notification.constants';
import { TGetAllNotificationsArgs } from './Notification.interface';
import {sendPushNotification} from './Notification.utils';

export const NotificationServices = {
  async createNotification(payload: Prisma.NotificationCreateArgs['data']) {
    const user = await prisma.user.findUnique({
      where: { id: payload.user_id },
      select: { onesignal_id: true },
    });

    if (!user) {
      return; //? user not found
    }

    if (user.onesignal_id) {
      await sendPushNotification({
        message: payload.message,
        onesignal_id: user.onesignal_id,
      });
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
    user_id,
  }: TGetAllNotificationsArgs) {
    const where: Prisma.NotificationWhereInput = { user_id };

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
