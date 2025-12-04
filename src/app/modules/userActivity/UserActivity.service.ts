import { prisma, type Prisma } from '@/utils/db';
import {
  TDeleteUserActivity,
  TGetAllUserActivity,
  TToggleUserActivityReadStatus,
} from './UserActivity.interface';
import { TPagination } from '@/utils/server/serveResponse';
import { userActivitySearchableFields } from './UserActivity.constant';

/**
 * Service layer for managing user activities
 */
export const UserActivityServices = {
  /**
   * Create a new user activity record
   */
  async createActivity(payload: Prisma.UserActivityCreateInput) {
    return prisma.userActivity.create({
      data: payload,
    });
  },

  /**
   * Toggle the read status of a user activity
   */
  async toggleReadStatus({
    activity_id,
    unread,
  }: TToggleUserActivityReadStatus) {
    return prisma.userActivity.updateMany({
      where: { id: activity_id },
      data: { unread },
    });
  },

  /**
   * Delete activity by ID or delete all activities if no ID is provided
   */
  async deleteActivity({ activity_id }: TDeleteUserActivity) {
    return prisma.userActivity.deleteMany({
      where: { id: activity_id },
    });
  },

  /**
   * Get all user activities with optional filters and pagination
   */
  async getAllActivity({
    limit,
    page,
    search,
    unread,
    user_id,
    end_date,
    start_date,
  }: TGetAllUserActivity) {
    const where: Prisma.UserActivityWhereInput = {
      user_id,
    };

    if (unread !== undefined) {
      where.unread = unread;
    }

    if (search) {
      where.OR = userActivitySearchableFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) {
        where.timestamp.gte = start_date;
      }
      if (end_date) {
        where.timestamp.lte = end_date;
      }
    }

    const activities = await prisma.userActivity.findMany({
      where,
      orderBy: [{ unread: 'desc' }, { timestamp: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.userActivity.count({ where });

    return {
      activities,
      meta: {
        pagination: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },
};
