import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { ETripStatus, prisma } from '../../../utils/db';
import type { TRequestForTrip } from './Trip.interface';
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
};
