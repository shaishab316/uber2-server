import purifyRequest from '@/app/middlewares/purifyRequest';
import { Router } from 'express';
import { QueryValidations } from '../query/Query.validation';
import { ParcelControllers } from './Parcel.controller';

const all = Router();
{
  //? Get parcel details
  all.get(
    '/:parcel_id',
    purifyRequest(QueryValidations.exists('parcel_id', 'parcel')),
    ParcelControllers.getParcelDetails,
  );
}

export const ParcelRoutes = { all };
