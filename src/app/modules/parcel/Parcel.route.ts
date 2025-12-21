import purifyRequest from '@/app/middlewares/purifyRequest';
import { Router } from 'express';
import { QueryValidations } from '../query/Query.validation';
import { ParcelControllers } from './Parcel.controller';
import { ParcelValidations } from './Parcel.validation';

const all = Router();
{
  //? Get parcel details
  all.get(
    '/:parcel_id',
    purifyRequest(QueryValidations.exists('parcel_id', 'parcel')),
    ParcelControllers.getParcelDetails,
  );

  //? Calculate estimated fare
  all.post(
    '/estimate-fare',
    purifyRequest(ParcelValidations.calculateEstimatedFare),
    ParcelControllers.calculateEstimatedFare,
  );
}

export const ParcelRoutes = { all };
