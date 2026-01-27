import catchAsync from '@/app/middlewares/catchAsync';
import { TripServices } from './Trip.service';
import { calculateTripCost } from './Trip.utils';
import type { TGetSuperTripDetails } from './Trip.interface';
import { StatusCodes } from 'http-status-codes';

export const TripControllers = {
  getTripDetails: catchAsync(async ({ params }) => {
    const trip = await TripServices.getTripDetails(params.trip_id);

    return {
      message: 'Trip details fetched successfully',
      data: trip,
    };
  }),

  /**
   * Calculate estimated fare for a trip
   */
  calculateEstimatedFare: catchAsync(async ({ body }) => {
    const estimatedFare = await calculateTripCost(body);

    return {
      message: 'Estimated fare calculated successfully',
      data: { estimated_fare: estimatedFare, query: body },
    };
  }),

  /**
   * Get super detailed trip info for admin
   */
  getSuperTripDetails: catchAsync<TGetSuperTripDetails>(async ({ params }) => {
    const trip = await TripServices.getSuperTripDetails(params);

    return {
      message: 'Super trip details fetched successfully',
      data: trip,
    };
  }),

  /**
   * Get last trip for user or driver
   */
  getLastTrip: catchAsync(async ({ user }) => {
    let trip: any = null;
    if (user.role === 'USER') {
      trip = await TripServices.getLastUserTrip({ user_id: user.id });
    } else if (user.role === 'DRIVER') {
      trip = await TripServices.getLastDriverTrip({ driver_id: user.id });
    }

    return {
      statusCode: trip ? StatusCodes.OK : StatusCodes.NOT_FOUND,
      message: 'Last trip fetched successfully',
      data: trip,
    };
  }),
};
