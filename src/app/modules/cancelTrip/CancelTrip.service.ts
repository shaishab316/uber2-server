import { Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { TList } from '../query/Query.interface';
import { tripOmit } from '../trip/Trip.constant';
import { userOmit } from '../user/User.constant';

export const CancelTripServices = {
  async cancelTrip({
    trip_id,
    driver_id,
    reason,
    passenger_id,
  }: {
    trip_id: string;
    driver_id?: string;
    passenger_id?: string;
    reason: string;
  }) {
    return prisma.cancelTrip.upsert({
      where: {
        trip_id,
      },
      update: {
        driver_id,
        passenger_id,
        reason,
      },
      create: {
        trip_id,
        driver_id,
        passenger_id,
        reason,
      },
    });
  },

  async getAllCancelTrip({
    limit,
    page,
    driver_id,
    search,
  }: TList & { driver_id: string }) {
    const where: Prisma.CancelTripWhereInput = {};

    if (driver_id) where.driver_id = driver_id;

    if (search)
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { driver: { name: { contains: search, mode: 'insensitive' } } },
      ];

    const cancelTrips = await prisma.cancelTrip.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        driver: {
          omit: userOmit,
        },
        trip: {
          omit: tripOmit,
        },
      },
    });

    const total = await prisma.cancelTrip.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      cancelTrips,
    };
  },
};
