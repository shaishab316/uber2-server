import axios from 'axios';
import config from '@/config';

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
  onesignal_ids,
}: TSendPushNotificationPayload) => {
  const payload = {
    app_id: config.onesignal.onesignal_app_id,
    include_player_ids: onesignal_ids,
    contents: { en: message },
  };

  await oneSignalClient.post('/notifications', payload);
};

export type TSendPushNotificationPayload = {
  onesignal_ids: string[];
  message: string;
};
