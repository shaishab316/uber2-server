import Redis from 'ioredis';
import config from '.';

export const getRedis = (): Redis => (
  (redis ??= new Redis(config.url.redis, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    maxLoadingRetryTime: 1,
    lazyConnect: false,
    keepAlive: 30_000,
    connectTimeout: 10_000,
    enableOfflineQueue: false,
  })),
  redis
);

let redis: Redis | null = null;
