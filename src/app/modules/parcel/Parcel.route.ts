import { Router } from 'express';
import { ParcelControllers } from './Parcel.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { ParcelValidations } from './Parcel.validation';

const user = Router();
{
  user.post(
    '/request-for-parcel',
    purifyRequest(ParcelValidations.requestForParcel),
    ParcelControllers.requestForParcel,
  );
}

const driver = Router();
{
  // driver routes ...
}

const admin = Router();
{
  // admin routes ...
}

export const ParcelRoutes = { user, driver, admin };
