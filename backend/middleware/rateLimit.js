const Redis = require('ioredis');
const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient = null;
let rateLimiter = null;

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
    points: 100,          // 100 requests
    duration: 60,         // per 60 seconds (1 minute)
    blockDuration: 60,    // Block for 60 seconds if limit exceeded
};

/**
 * Initialize Redis connection and rate limiter
 */
const initializeRateLimiter = async () => {
    try {
        redisClient = new Redis(redisUrl, {
            enableOfflineQueue: false,
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            lazyConnect: true,
        });

        await redisClient.connect();
        console.log('✅ Redis connected for rate limiting');

        // Create Redis-backed rate limiter
        rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'ratelimit',
            points: RATE_LIMIT_CONFIG.points,
            duration: RATE_LIMIT_CONFIG.duration,
            blockDuration: RATE_LIMIT_CONFIG.blockDuration,
        });

        // Handle Redis errors
        redisClient.on('error', (err) => {
            console.error('❌ Redis error:', err.message);
            fallbackToMemory();
        });

        redisClient.on('close', () => {
            console.warn('⚠️ Redis connection closed');
        });

    } catch (err) {
        console.warn('⚠️ Redis unavailable, using in-memory rate limiter:', err.message);
        fallbackToMemory();
    }
};

/**
 * Fallback to in-memory rate limiter if Redis is unavailable
 */
const fallbackToMemory = () => {
    rateLimiter = new RateLimiterMemory({
        points: RATE_LIMIT_CONFIG.points,
        duration: RATE_LIMIT_CONFIG.duration,
        blockDuration: RATE_LIMIT_CONFIG.blockDuration,
    });
    console.log('ℹ️ Using in-memory rate limiter (not distributed)');
};

/**
 * Rate limiting middleware
 */
const rateLimitMiddleware = async (req, res, next) => {
    // Initialize on first request if not already done
    if (!rateLimiter) {
        await initializeRateLimiter();
    }

    // Use IP address as the key
    const key = req.ip || req.connection.remoteAddress || 'unknown';

    try {
        const rateLimiterRes = await rateLimiter.consume(key);

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.points,
            'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
            'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
        });

        next();
    } catch (rateLimiterRes) {
        // Rate limit exceeded
        res.set({
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.points,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
            'Retry-After': Math.ceil(rateLimiterRes.msBeforeNext / 1000),
        });

        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please slow down.',
            retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
        });
    }
};

/**
 * Get rate limiter health status
 */
const getHealthStatus = () => {
    return {
        type: redisClient && redisClient.status === 'ready' ? 'redis' : 'memory',
        connected: redisClient ? redisClient.status === 'ready' : false,
    };
};

/**
 * Close Redis connection
 */
const closeConnection = async () => {
    if (redisClient) {
        await redisClient.quit();
        console.log('✅ Redis connection closed');
    }
};

module.exports = {
    rateLimitMiddleware,
    initializeRateLimiter,
    getHealthStatus,
    closeConnection,
};
