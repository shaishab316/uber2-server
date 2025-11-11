import { prisma } from '../../../utils/db';
import { getNearestDriver } from '../parcel/Parcel.utils';
import type { TRequestForTrip } from './Trip.interface';
import { calculateTripCost, generateTripSlug } from './Trip.utils';

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
};
