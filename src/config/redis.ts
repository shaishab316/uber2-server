import Redis, { type RedisOptions as TRedisOptions } from 'ioredis';
import config from '.';

export const getRedis = (): Redis => (
  (redis ??= new Redis(redisOptions)),
  redis
);

let redis: Redis | null = null;

export const redisOptions: TRedisOptions = {
  ...config.redis,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  maxLoadingRetryTime: 1,
  lazyConnect: false,
  keepAlive: 30_000,
  connectTimeout: 10_000,
  enableOfflineQueue: false,
};
