import { Router } from 'express';
import { UserRoutes } from '../user/User.route';
import { injectRoutes } from '../../../utils/router/injectRouter';
import { TransactionRoutes } from '../transaction/Transaction.route';
import { AdminControllers } from './Admin.controller';
import purifyRequest from '@/app/middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { AdminValidations } from './Admin.validation';
import { ContextPageRoutes } from '../contextPage/ContextPage.route';
import { UserActivityRoutes } from '../userActivity/UserActivity.route';

const adminRouter = injectRoutes(Router(), {
  '/users': [UserRoutes.admin],
  '/transactions': [TransactionRoutes.admin],
  '/context-pages': [ContextPageRoutes.admin],
  '/user-activities': [UserActivityRoutes.admin],
});

adminRouter.get(
  '/overview',
  purifyRequest(AdminValidations.getOverview),
  AdminControllers.getOverview,
);

adminRouter.get(
  '/user-trip-details',
  purifyRequest(QueryValidations.list, AdminValidations.userTripDetails),
  AdminControllers.userTripDetails,
);

export default adminRouter;
