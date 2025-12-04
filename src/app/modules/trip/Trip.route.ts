import { Router } from 'express';
import { TripControllers } from './Trip.controller';
import purifyRequest from '@/app/middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const all = Router();
{
  //? Get trip details
  all.get(
    '/:trip_id',
    purifyRequest(QueryValidations.exists('trip_id', 'trip')),
    TripControllers.getTripDetails,
  );
}

export const TripRoutes = { all };
