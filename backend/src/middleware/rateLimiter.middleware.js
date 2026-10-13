import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis, isLocalRedis } from '../config/redis.js';

// Safe Redis Store helper that transparently falls back to in-memory rate limiting when Redis is offline
const getStore = (prefix) => {
  if (isLocalRedis) {
    return undefined; // Uses built-in high-performance MemoryStore
  }
  return new RedisStore({
    sendCommand: async (...args) => {
      try {
        if (redis.status !== 'ready') return null;
        return await redis.call(...args);
      } catch {
        return null;
      }
    },
    prefix,
  });
};

export const apiLimiter = rateLimit({
  store: getStore('rl-api:'),
  passOnStoreError: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'development' ? 50000 : 2000, // Generous limit in dev to prevent blocking legitimate usage
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => {
    // Never throttle during development or for local development requests
    if (process.env.NODE_ENV === 'development') return true;
    const ip = req.ip || req.connection.remoteAddress || '';
    if (ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) return true;
    return false;
  },
});

export const authLimiter = rateLimit({
  store: getStore('rl-auth:'),
  passOnStoreError: true,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: process.env.NODE_ENV === 'development' ? 5000 : 50, // Limit each IP to login/register requests
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') return true;
    const ip = req.ip || req.connection.remoteAddress || '';
    if (ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) return true;
    return false;
  },
});

export const otpSendLimiter = rateLimit({
  store: getStore('rl-otp-send:'),
  passOnStoreError: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 OTP requests per IP per 15 min
  message: { error: 'Too many verification code requests from this IP, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const otpVerifyLimiter = rateLimit({
  store: getStore('rl-otp-verify:'),
  passOnStoreError: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Max 20 verification attempts per IP per 15 min to prevent brute force
  message: { error: 'Too many verification attempts, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const aiAnalyzeLimiter = rateLimit({
  store: getStore('rl-ai-analyze:'),
  passOnStoreError: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 AI analyze requests per 15 minutes
  message: { error: 'AI analysis rate limit exceeded. Please wait a few minutes before requesting more analyses.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});