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
