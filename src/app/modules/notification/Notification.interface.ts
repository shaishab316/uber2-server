import z from 'zod';
import { TList } from '../query/Query.interface';
import { NotificationValidations } from './Notification.validation';

export type TGetAllNotificationsArgs = z.infer<
  typeof NotificationValidations.getAllNotifications
>['query'] &
  TList & { user_id: string };
