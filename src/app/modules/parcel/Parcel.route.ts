import purifyRequest from '@/app/middlewares/purifyRequest';
import { Router } from 'express';
import { QueryValidations } from '../query/Query.validation';
import { ParcelControllers } from './Parcel.controller';
import { ParcelValidations } from './Parcel.validation';
import auth from '@/app/middlewares/auth';
import capture from '@/app/middlewares/capture';

const all = Router();
{
  //? Recover last parcel
  all.get('/recover-parcel', ParcelControllers.getLastParcel);

  //? Get parcel details
  all.get(
    '/:parcel_id',
    purifyRequest(QueryValidations.exists('parcel_id', 'parcel')),
    ParcelControllers.getParcelDetails,
  );

  /**
   * Deliver parcel
   */
  all.post(
    '/deliver-parcel',
    auth.driver,
    capture({
      files: {
        fileType: 'images',
        maxCount: 5,
        size: 10 * 1024 * 1024, // 10 MB
      },
    }),
    purifyRequest(ParcelValidations.deliverParcel),
    ParcelControllers.deliverParcel,
  );

  //? Calculate estimated fare
  all.post(
    '/estimate-fare',
    purifyRequest(ParcelValidations.calculateEstimatedFare),
    ParcelControllers.calculateEstimatedFare,
  );
}

const admin = Router();
{
  //? Get super detailed parcel info for admin
  admin.get(
    '/:parcel_id',
    purifyRequest(QueryValidations.exists('parcel_id', 'parcel')),
    ParcelControllers.getSuperParcelDetails,
  );
}

export const ParcelRoutes = { all, admin };
