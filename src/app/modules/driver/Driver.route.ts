import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { DriverControllers } from './Driver.controller';
import { AvailableDriverRoutes } from '../availableDriver/AvailableDriver.route';
import { TripRoutes } from '../trip/Trip.route';
import { LoanRoutes } from '../loan/Loan.route';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { TransactionRoutes } from '../transaction/Transaction.route';
import { ParcelRoutes } from '../parcel/Parcel.route';
import capture from '../../middlewares/capture';
import { DriverValidations } from './Driver.validation';

const admin = injectRoutes(Router(), {
  '/loans': [LoanRoutes.admin],
});
{
  admin.get(
    '/pending',
    purifyRequest(QueryValidations.list),
    DriverControllers.superGetPendingDrivers,
  );

  admin.post(
    '/:driverId/approve',
    purifyRequest(QueryValidations.exists('driverId', 'user')),
    DriverControllers.superApproveDriver,
  );

  admin.post(
    '/:driverId/reject',
    purifyRequest(QueryValidations.exists('driverId', 'user')),
    DriverControllers.superRejectDriver,
  );
}

const driver = injectRoutes(Router(), {
  '/available-drivers': [AvailableDriverRoutes.driver],
  '/trips': [TripRoutes.driver],
  '/parcels': [ParcelRoutes.driver],
  '/loans': [LoanRoutes.driver],
  '/transactions': [TransactionRoutes.driver],
});
{
  driver.post(
    '/setup-driver-profile',
    capture({
      nid_photos: {
        size: 5 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
      driving_license_photos: {
        size: 5 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
      avatar: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
    }),
    purifyRequest(DriverValidations.setupDriverProfile),
    DriverControllers.setupDriverProfile,
  );

  driver.post(
    '/setup-vehicle',
    capture({
      vehicle_registration_photos: {
        size: 5 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
      vehicle_photos: {
        size: 5 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
    }),
    purifyRequest(DriverValidations.setupVehicle),
    DriverControllers.setupVehicle,
  );
}

export const DriverRoutes = { admin, driver };
