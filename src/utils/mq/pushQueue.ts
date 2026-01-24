import Queue from 'bull';
import config from '@/config';
import {
  sendPushNotification,
  type TSendPushNotificationPayload,
} from '@/app/modules/notification/Notification.utils';
import { queueOptions } from '.';

/**
 * Push Notification Queue used to send push notifications to users in the background
 */
const pushQueue = new Queue<TSendPushNotificationPayload>(
  `${config.server.name}:push-notifications`,
  queueOptions,
);

pushQueue.process(async ({ data }) => {
  await sendPushNotification(data);
});

export default pushQueue;
