import axios from 'axios';
import config from '@/config';
import { prisma } from '@/utils/db';

const ONE_SIGNAL_API_URL = 'https://onesignal.com/api/v1';
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  Authorization: `Basic ${config.onesignal.onesignal_api_key}`,
};

const oneSignalClient = axios.create({
  baseURL: ONE_SIGNAL_API_URL,
  headers,
  timeout: 5000,
});

/**
 * Send Push Notification via OneSignal
 *
 * @deprecated use pushQueue instead
 */
export const sendPushNotification = async ({
  message,
  onesignal_ids: user_ids,
}: TSendPushNotificationPayload) => {
  if (!user_ids?.length) {
    return;
  }

  const include_player_ids = await prisma.user
    .findMany({
      where: {
        id: { in: user_ids },
        onesignal_id: { not: null },
      },
      select: { onesignal_id: true },
    })
    .then(users => users.map(user => user.onesignal_id));

  if (!include_player_ids.length) {
    return;
  }

  const payload = {
    app_id: config.onesignal.onesignal_app_id,
    include_player_ids,
    contents: { en: message },
  };

  await oneSignalClient.post('/notifications', payload);
};

export type TSendPushNotificationPayload = {
  onesignal_ids: string[];
  message: string;
};
