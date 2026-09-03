import Redis, { RedisOptions } from 'ioredis';

let _redisInstance: Redis | null = null;

export function getRedisConfig(): RedisOptions {
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      if (times > 2) return null; // Stop looping if Redis server is not running
      return 500;
    },
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
  };
}

export function getRedisClient(): Redis {
  if (_redisInstance) {
    return _redisInstance;
  }

  const url = process.env.REDIS_URL;
  if (url && url.startsWith('redis')) {
    _redisInstance = new Redis(url, getRedisConfig());
  } else {
    _redisInstance = new Redis(getRedisConfig());
  }

  _redisInstance.on('connect', () => {
    console.log('[Redis] Connected to Redis instance.');
  });

  _redisInstance.on('error', (err) => {
    console.error('[Redis Error]', err.message || err);
  });

  return _redisInstance;
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const pong = await client.ping();
    return pong === 'PONG';
  } catch (err: any) {
    console.error('[Redis Health Check Failed]:', err.message);
    return false;
  }
}

export async function closeRedisClient(): Promise<void> {
  if (_redisInstance) {
    await _redisInstance.quit();
    _redisInstance = null;
  }
}
