import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;
let available = false;

export function initRedis(): void {
  if (redis) return;
  try {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 500, 5000),
      reconnectOnError: () => true,
    });
    redis.on('connect', () => { available = true; });
    redis.on('error', () => { available = false; });
    redis.on('close', () => { available = false; });
    redis.connect().catch(() => {
      console.warn('Redis unavailable, will retry in background');
    });
  } catch {
    console.warn('Redis unavailable');
  }
}

export function getRedis(): Redis | null {
  return redis;
}

export function isRedisAvailable(): boolean {
  return available;
}
