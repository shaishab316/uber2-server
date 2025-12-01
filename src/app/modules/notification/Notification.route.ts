import { Router } from 'express';
import { NotificationControllers } from './Notification.controller';
import { NotificationValidations } from './Notification.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const all = Router();
{
  all.get(
    '/',
    purifyRequest(
      NotificationValidations.getAllNotifications,
      QueryValidations.list,
    ),
    NotificationControllers.getAllNotifications,
  );
}

export const NotificationRoutes = { all };
