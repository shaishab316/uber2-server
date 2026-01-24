import { getRedis } from '@/config/redis';
import { QueueOptions } from 'bull';

export const queueOptions: QueueOptions = {
  createClient: getRedis,
};
