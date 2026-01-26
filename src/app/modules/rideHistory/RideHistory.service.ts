import type { TGetRideHistoryArgs } from './RideHistory.interface';
import { prisma, type Prisma } from '@/utils/db';
import { dateRange } from '../datetime/Datetime.utils';
import type { TPagination } from '@/utils/server/serveResponse';
import { userOmit } from '../user/User.constant';

export const RideHistoryServices = {
  async tripHistory({
    limit,
    page,
    user_id,
    driver_id,
    dateRange: range,
    startDate,
    endDate,
  }: TGetRideHistoryArgs) {
    const whereTrip: Prisma.TripWhereInput = {
      user_id,
      driver_id,
    };

    //? if has date range filter
    if (range) {
      whereTrip.payment_at = dateRange[range](startDate, endDate, false);
    }

    const trips = await prisma.trip.findMany({
      where: whereTrip,
      include: {
        user: { omit: userOmit.USER },
        driver: { omit: userOmit.DRIVER },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { requested_at: 'desc' },
    });

    const total = await prisma.trip.count({ where: whereTrip });

    return {
      data: trips,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },

  async parcelHistory({
    limit,
    page,
    user_id,
    driver_id,
    dateRange: range,
    startDate,
    endDate,
  }: TGetRideHistoryArgs) {
    const whereParcel: Prisma.ParcelWhereInput = {
      user_id,
      driver_id,
    };

    //? if has date range filter
    if (range) {
      whereParcel.payment_at = dateRange[range](startDate, endDate, false);
    }

    const parcels = await prisma.parcel.findMany({
      where: whereParcel,
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        driver: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { requested_at: 'desc' },
    });

    const total = await prisma.parcel.count({ where: whereParcel });

    return {
      data: parcels,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },
};
