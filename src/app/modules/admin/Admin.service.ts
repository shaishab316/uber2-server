import chalk from 'chalk';
import { errorLogger } from '../../../utils/logger';
import { logger } from '../../../utils/logger';
import config from '../../../config';
import { Prisma, prisma } from '../../../utils/db';
import { hashPassword } from '../auth/Auth.utils';
import { TUserTripDetailsArgs } from './Admin.interface';
import { TPagination } from '@/utils/server/serveResponse';

export const AdminServices = {
  /**
   * Seeds the admin user if it doesn't exist in the database
   *
   * This function checks if an admin user already exists in the database.
   * If an admin user exists, it returns without creating a new one.
   * Otherwise, it creates a new admin user with the provided admin data.
   */
  async seed() {
    const { name, email, password } = config.admin;

    logger.info(chalk.green('🔑 admin seed started...'));

    try {
      const admin = await prisma.user.findFirst({
        where: { email },
      });

      if (admin?.is_admin && admin?.is_active && admin?.is_verified) return;

      logger.info(chalk.green('🔑 admin creation started...'));

      if (admin) {
        await prisma.user.update({
          where: {
            id: admin.id,
          },
          data: {
            is_active: true,
            is_verified: true,
            is_admin: true,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            name,
            email,
            password: await hashPassword(password),
            avatar: config.server.default_avatar,

            is_active: true,
            is_verified: true,
            is_admin: true,

            wallet: { create: {} },
          },
        });
      }

      logger.info(chalk.green('✔ admin created successfully!'));
    } catch (error) {
      errorLogger.error(chalk.red('❌ admin creation failed!'), error);
    } finally {
      logger.info(chalk.green('🔑 admin seed completed!'));
    }
  },

  async userTripsDetails({
    limit,
    page,
    user_id,
    end_date,
    start_date,
  }: TUserTripDetailsArgs) {
    const where: Prisma.TripWhereInput = { user_id };

    if (start_date || end_date) {
      where.completed_at = {};

      if (start_date) {
        where.completed_at.gte = start_date;
      }

      if (end_date) {
        where.completed_at.lte = end_date;
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { completed_at: 'desc' },
    });

    const total = await prisma.trip.count({ where });

    const review = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { user_id },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        rating: review._avg.rating ? Number(review._avg.rating.toFixed(2)) : 0,
      },
      data: trips,
    };
  },

  async userParcelsDetails({
    limit,
    page,
    user_id,
    end_date,
    start_date,
  }: TUserTripDetailsArgs) {
    const where: Prisma.ParcelWhereInput = { user_id };

    if (start_date || end_date) {
      where.delivered_at = {};

      if (start_date) {
        where.delivered_at.gte = start_date;
      }

      if (end_date) {
        where.delivered_at.lte = end_date;
      }
    }

    const parcels = await prisma.parcel.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { delivered_at: 'desc' },
    });

    const total = await prisma.parcel.count({ where });

    const review = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { user_id },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        rating: review._avg.rating ? Number(review._avg.rating.toFixed(2)) : 0,
      },
      data: parcels,
    };
  },
};
