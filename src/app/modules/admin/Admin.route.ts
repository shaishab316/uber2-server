import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { ContextPageRoutes } from '../contextPage/ContextPage.route';
import { DriverRoutes } from '../driver/Driver.route';
import { CancelTripRoutes } from '../cancelTrip/CancelTrip.route';
import { TripRoutes } from '../trip/Trip.route';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { TransactionRoutes } from '../transaction/Transaction.route';
import { ParcelRoutes } from '../parcel/Parcel.route';

export default injectRoutes(Router(), {
  '/users': [UserRoutes.admin],
  '/drivers': [DriverRoutes.admin],
  '/context-pages': [ContextPageRoutes.admin],
  '/trips': [TripRoutes.admin],
  '/parcels': [ParcelRoutes.admin],
  '/cancel-trips': [CancelTripRoutes.admin],
  '/transactions': [TransactionRoutes.admin],
});
