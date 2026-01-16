const express = require('express');
const cors = require('cors');
const os = require('os');
const compression = require('compression');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { getHealthStatus: getDbHealth } = require('./db');
const { getHealthStatus: getRateLimitHealth } = require('./middleware/rateLimit');

const app = express();

// Trust proxy for accurate IP detection behind Nginx
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }

        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : ['http://localhost:3000', 'http://localhost:8080'];

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'auth-token', 'Authorization'],
    maxAge: 86400 // 24 hours - preflight cache
};

// Middleware stack
app.use(cors(corsOptions));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware (30 seconds)
app.use((req, res, next) => {
    req.setTimeout(30000, () => {
        if (!res.headersSent) {
            res.status(408).json({ error: 'Request Timeout' });
        }
    });
    next();
});

// Basic Health Check (for container health checks - no rate limiting)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        hostname: os.hostname(),
        timestamp: new Date().toISOString(),
    });
});

// Detailed Health Check (includes DB and Redis status)
app.get('/api/health/detailed', (req, res) => {
    const dbHealth = getDbHealth();
    const rateLimitHealth = getRateLimitHealth();

    const isHealthy = dbHealth.connected;

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        hostname: os.hostname(),
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        },
        services: {
            database: dbHealth,
            rateLimit: rateLimitHealth,
        },
    });
});

// Apply rate limiting to API routes (except health checks)
app.use('/api/auth', rateLimitMiddleware, require('./routes/auth'));
app.use('/api/notes', rateLimitMiddleware, require('./routes/notes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    });
});

module.exports = app;
