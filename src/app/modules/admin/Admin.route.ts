import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { TransactionRoutes } from '../transaction/Transaction.route';
import { AdminControllers } from './Admin.controller';
import purifyRequest from '@/app/middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { AdminValidations } from './Admin.validation';

const adminRouter = injectRoutes(Router(), {
  '/users': [UserRoutes.admin],
  '/transactions': [TransactionRoutes.admin],
});

adminRouter.get(
  '/user-trip-details',
  purifyRequest(QueryValidations.list, AdminValidations.userTripDetails),
  AdminControllers.userTripDetails,
);

export default adminRouter;
