import Queue from 'bull';
import config from '@/config';
import {
  sendPushNotification,
  type TSendPushNotificationPayload,
} from '@/app/modules/notification/Notification.utils';

/**
 * Push Notification Queue used to send push notifications to users in the background
 */
const pushQueue = new Queue<TSendPushNotificationPayload>(
  'push-notifications',
  config.url.redis,
);

pushQueue.process(async ({ data }) => {
  await sendPushNotification(data);
});

export default pushQueue;
