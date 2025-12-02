import { Notification as TNotification } from '@/utils/db';

export const notificationSearchableFields = [
  'title',
  'message',
] satisfies (keyof TNotification)[];
