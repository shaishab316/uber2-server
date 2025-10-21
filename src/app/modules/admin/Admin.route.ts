import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { TransactionRoutes } from '../transaction/Transaction.route';
import { ParcelRoutes } from '../parcel/Parcel.route';

export default injectRoutes(Router(), {
  '/users': [UserRoutes.admin],
  '/parcels': [ParcelRoutes.admin],
  '/transactions': [TransactionRoutes.admin],
});
