import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { StatusCodes } from 'http-status-codes';
import { fileTypes } from '../app/middlewares/capture';
import { PaymentRoutes } from '../app/modules/payment/Payment.route';
import { TransactionRoutes } from '../app/modules/transaction/Transaction.route';
import { injectRoutes } from '../utils/router/injectRouter';
import { ParcelRoutes } from '../app/modules/parcel/Parcel.route';
import { DriverRoutes } from '../app/modules/driver/Driver.route';
import { ReviewRoutes } from '../app/modules/review/Review.route';
import { MessageRoutes } from '../app/modules/message/Message.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';
import { NotificationRoutes } from '../app/modules/notification/Notification.route';

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
  // No auth
  '/auth': [AuthRoutes],
  '/payments': [PaymentRoutes.user],

  // Free auth
  '/profile': [auth.all, UserRoutes.all],
  '/transactions': [auth.all, TransactionRoutes.all],
  '/reviews': [auth.all, ReviewRoutes.all],
  '/inbox': [auth.all, ChatRoutes.all],
  '/messages': [auth.all, MessageRoutes.all],
  '/notifications': [auth.all, NotificationRoutes.all],

  // User auth
  '/parcels': [auth.user, ParcelRoutes.user],

  // Driver auth
  '/drivers': [auth.driver, DriverRoutes.driver],

  // Admin auth
  '/admin': [auth.admin, AdminRoutes],
});
