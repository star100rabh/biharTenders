import Redis from 'ioredis';
import pino from 'pino';
import { env } from './env.js';

const logger = pino();

// Parse Redis connection details dynamically from env.REDIS_URL
const redisUrl = new URL(env.REDIS_URL);
const isSecure = redisUrl.protocol === 'rediss:' || redisUrl.hostname.includes('upstash.io');

export const redis = new Redis({
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  tls: isSecure ? { rejectUnauthorized: false } : undefined,
  family: 4, // Force IPv4 to prevent socket resets
  keepAlive: 30000,
  maxRetriesPerRequest: null, // Critical requirement for BullMQ
  retryStrategy(times) {
    // If local, slow down retries significantly to prevent CPU/terminal spam
    if (redisUrl.hostname === 'localhost' || redisUrl.hostname === '127.0.0.1') {
      return Math.min(times * 2000, 30000); 
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => logger.info('Redis Connected Successfully'));
redis.on('error', (err) => {
  if (!err.message.includes('ECONNRESET') && !err.message.includes('ECONNREFUSED')) {
    logger.error(`Redis Error: ${err.message}`);
  }
});