import catchAsync from '@/app/middlewares/catchAsync';
import { TripServices } from './Trip.service';
import { calculateTripCost } from './Trip.utils';
import type {
  TGetSuperTripDetails,
  TRequestForTripV2,
  TRideResponseV2,
  TCancelTripV2,
} from './Trip.interface';
import { StatusCodes } from 'http-status-codes';
import { ParcelServices } from '../parcel/Parcel.service';
import { NotificationServices } from '../notification/Notification.service';
import { RIDE_KIND } from './Trip.constant';

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

    let parcel: any = null;
    if (user.role === 'DRIVER') {
      parcel = await ParcelServices.getLastDriverParcel({
        driver_id: user.id,
      });
    } else if (user.role === 'USER') {
      parcel = await ParcelServices.getLastUserParcel({
        user_id: user.id,
      });
    }

    return {
      statusCode: trip || parcel ? StatusCodes.OK : StatusCodes.NO_CONTENT,
      message: `Last ${trip ? 'trip' : 'parcel'} fetched successfully`,
      data: {
        isParcel: Boolean(parcel && !trip),
        data: trip ?? parcel,
      },
    };
  }),

  /**
   ****** v2 Trip Request Controller *****
   */

  /**
   * Request for a new trip v2
   */
  requestForTripV2: catchAsync<TRequestForTripV2>(
    async ({ body: payload, user }) => {
      const data = await TripServices.requestForTrip({
        ...payload,
        user_id: user.id,
      });

      //? Notify user that their trip request is being processed
      await NotificationServices.createNotification({
        user_id: user.id,
        title: 'Trip Request Received',
        message: 'Searching for nearby drivers...',
        type: 'INFO',
      });

      return {
        message: 'Trip request created successfully',
        data: {
          kind: RIDE_KIND.TRIP,
          trip: data,
          parcel: null,
        } satisfies TRideResponseV2,
      };
    },
  ),

  /**
   * Cancel trip v2
   */
  cancelTripV2: catchAsync<TCancelTripV2>(async ({ body: payload, user }) => {
    const data = await TripServices.cancelTrip({
      trip_id: payload.trip_id,
      user_id: user.id,
    });

    return {
      message: 'Trip cancelled successfully',
      data: {
        kind: RIDE_KIND.TRIP,
        trip: data,
        parcel: null,
      } satisfies TRideResponseV2,
    };
  }),
};
