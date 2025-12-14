import catchAsync from '@/app/middlewares/catchAsync';
import { TripServices } from './Trip.service';
import { calculateTripCost } from './Trip.utils';

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
      data: { estimated_fare: estimatedFare },
    };
  }),
};
