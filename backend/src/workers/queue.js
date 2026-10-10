import { Queue } from 'bullmq';
import { env } from '../config/env.js';

// Parse the Redis URL safely
const redisUrl = new URL(env.REDIS_URL);

const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  // CRITICAL FIX: BullMQ needs explicit TLS for Upstash cloud Redis
  tls: {
    rejectUnauthorized: false
  },
  family: 4 // Forces IPv4 to prevent Render network drops
};

export const tenderQueue = new Queue('TenderQueue', { connection });
export const aiQueue = new Queue('AIQueue', { connection });
export const documentQueue = new Queue('DocumentQueue', { connection });
export const notificationQueue = new Queue('NotificationQueue', { connection });

[tenderQueue, aiQueue, documentQueue, notificationQueue].forEach(q => {
  q.on('error', (err) => {
    if (err.message && (err.message.includes('ECONNREFUSED') || err.message.includes('ECONNRESET'))) return;
  });
});