import { Notification as TNotification } from '../../../../prisma';

export const notificationSearchableFields = [
  'title',
  'message',
] satisfies (keyof TNotification)[];
