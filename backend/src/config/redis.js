import Redis from 'ioredis';
import pino from 'pino';
import { env } from './env.js';

const logger = pino();

// Parse Redis connection details dynamically from env.REDIS_URL
let redisUrl;
try {
  redisUrl = new URL(env.REDIS_URL);
} catch {
  redisUrl = new URL('redis://localhost:6379');
}
const isSecure = redisUrl.protocol === 'rediss:' || redisUrl.hostname.includes('upstash.io');
export const isLocalRedis = redisUrl.hostname === 'localhost' || redisUrl.hostname === '127.0.0.1';

export const redis = new Redis({
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  tls: isSecure ? { rejectUnauthorized: false } : undefined,
  family: 4, // Force IPv4 to prevent socket resets
  keepAlive: 30000,
  enableOfflineQueue: false, // Critical: Fail immediately rather than hanging requests when Redis is down
  commandTimeout: 2000, // Never let a Redis command hang for more than 2 seconds
  retryStrategy(times) {
    // If local, stop retrying after 3 attempts so it doesn't spin or block
    if (isLocalRedis && times > 3) {
      return null;
    }
    const delay = Math.min(times * 1000, 30000);
    return delay;
  }
});

redis.on('connect', () => logger.info('Redis Connected Successfully'));
redis.on('error', (err) => {
  // Suppress local connection errors if no local redis exists
  if (!isLocalRedis && !err.message.includes('ECONNRESET') && !err.message.includes('ECONNREFUSED')) {
    logger.error(`Redis Error: ${err.message}`);
  }
});