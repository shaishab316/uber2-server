import { Router } from 'express';
import { TripControllers } from './Trip.controller';
import purifyRequest from '@/app/middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { TripValidations } from './Trip.validation';

const all = Router();
{
  //? Get last trip for user or driver
  all.get('/recover-trip', TripControllers.getLastTrip);

  //? Get trip details
  all.get(
    '/:trip_id',
    purifyRequest(QueryValidations.exists('trip_id', 'trip')),
    TripControllers.getTripDetails,
  );

  //? Calculate estimated fare
  all.post(
    '/estimate-fare',
    purifyRequest(TripValidations.calculateEstimatedFare),
    TripControllers.calculateEstimatedFare,
  );

  /**
   * v2 Trip Request Route
   */

  /**
   * Request for a new trip v2
   *
   * [user] Requests a new trip by providing pickup and dropoff details.
   */
  all.post(
    '/new-trip-request',
    purifyRequest(TripValidations.requestForTripV2),
    TripControllers.requestForTripV2,
  );

  /**
   * Cancel trip v2
   *
   * [user] Cancels an ongoing trip by providing the trip ID.
   */
  all.post(
    '/cancel-trip',
    purifyRequest(TripValidations.cancelTripV2),
    TripControllers.cancelTripV2,
  );
}

const admin = Router();
{
  //? Get super trip details
  admin.get(
    '/:trip_id',
    purifyRequest(QueryValidations.exists('trip_id', 'trip')),
    TripControllers.getSuperTripDetails,
  );
}

export const TripRoutes = { all, admin };
