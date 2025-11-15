import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { ETripStatus, prisma } from '../../../utils/db';
import type { TRequestForTrip, TTripRefreshLocation } from './Trip.interface';
import { calculateTripCost, generateTripSlug } from './Trip.utils';
import { getNearestDriver } from '../parcel/Parcel.utils';

export const TripServices = {
  //! Socket
  async requestForTrip(payload: TRequestForTrip) {
    const driver_ids = await getNearestDriver(payload);

    return prisma.trip.create({
      data: {
        ...payload,
        slug: await generateTripSlug(),
        total_cost: await calculateTripCost(payload),
        helper: {
          create: {
            driver_ids,
          },
        },
      },
    });
  },

  async acceptTrip({
    trip_id,
    driver_id,
  }: {
    trip_id: string;
    driver_id: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      select: {
        driver: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (trip?.driver?.id && trip?.driver?.id !== driver_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `${trip?.driver?.name?.split(' ')[0]} is already accepted this trip`,
      );

    return prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.ACCEPTED,
        driver_id,
        accepted_at: new Date(),
      },
    });
  },

  async cancelTrip({ trip_id, user_id }: { trip_id: string; user_id: string }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      select: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (trip?.user.id !== user_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `You can't cancel ${trip?.user?.name?.split(' ')[0]}'s trip`,
      );

    return prisma.trip.update({
      where: { id: trip_id },
      data: { status: ETripStatus.CANCELLED, cancelled_at: new Date() },
    });
  },

  async getProcessingDriverTrip({ driver_id }: { driver_id: string }) {
    return prisma.trip.findFirst({
      where: { processing_driver_id: driver_id },
      orderBy: { processing_at: 'desc' },
    });
  },

  async getLastUserTrip({ user_id }: { user_id: string }) {
    return prisma.trip.findFirst({
      where: {
        user_id,
        status: {
          notIn: [ETripStatus.COMPLETED, ETripStatus.CANCELLED],
        },
      },
      include: {
        driver: {
          select: {
            name: true,
            avatar: true,
            location_lat: true,
            location_lng: true,
            location_address: true,
          },
        },
      },
      orderBy: {
        requested_at: 'desc',
      },
    });
  },

  async getLastDriverTrip({ driver_id }: { driver_id: string }) {
    return prisma.trip.findFirst({
      where: {
        driver_id,
        status: {
          notIn: [ETripStatus.COMPLETED, ETripStatus.CANCELLED],
        },
      },
      orderBy: {
        accepted_at: 'desc',
      },
    });
  },

  async refreshLocation({ trip_id, ...payload }: TTripRefreshLocation) {
    return prisma.trip.update({
      where: { id: trip_id },
      data: payload,
    });
  },
};
