import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { StatusCodes } from 'http-status-codes';
import { ContextPageRoutes } from '../app/modules/contextPage/ContextPage.route';
import { fileTypes } from '../app/middlewares/capture';
import { DriverRoutes } from '../app/modules/driver/Driver.route';
import { TripRoutes } from '../app/modules/trip/Trip.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';
import { PaymentRoutes } from '../app/modules/payment/Payment.route';
import { TransactionRoutes } from '../app/modules/transaction/Transaction.route';
import { injectRoutes } from '../utils/router/injectRouter';
import { ParcelRoutes } from '../app/modules/parcel/Parcel.route';

const appRouter = Router();

/** Forward uploaded files requests */
fileTypes.map((filetype: string) =>
  appRouter.get(`/${filetype}/:filename`, (req, res) =>
    res.redirect(
      StatusCodes.MOVED_PERMANENTLY,
      `/${filetype}/${encodeURIComponent(req.params.filename)}`,
    ),
  ),
);

export default injectRoutes(appRouter, {
  '/context-pages': [ContextPageRoutes.user],

  // No auth
  '/auth': [AuthRoutes],
  '/payments': [PaymentRoutes.user],

  // Free auth
  '/profile': [auth.all, UserRoutes.user],
  '/transactions': [auth.all, TransactionRoutes.user],
  '/chats': [auth.all, ChatRoutes.user],

  // User auth
  '/trips': [auth.user, TripRoutes.user],
  '/parcels': [auth.user, ParcelRoutes.user],

  // Driver auth
  '/drivers': [auth.driver, DriverRoutes.driver],

  // Admin auth
  '/admin': [auth.admin, AdminRoutes],
});
