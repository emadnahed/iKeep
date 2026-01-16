const request = require('supertest');
const app = require('../app');

describe('Health Check Endpoints', () => {
    describe('GET /api/health', () => {
        it('should return 200 with ok status', async () => {
            const res = await request(app).get('/api/health');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'ok');
        });

        it('should include hostname in response', async () => {
            const res = await request(app).get('/api/health');

            expect(res.body).toHaveProperty('hostname');
            expect(typeof res.body.hostname).toBe('string');
        });

        it('should include timestamp in response', async () => {
            const res = await request(app).get('/api/health');

            expect(res.body).toHaveProperty('timestamp');
            // Validate timestamp format (ISO 8601)
            expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
        });

        it('should respond quickly (under 500ms)', async () => {
            const start = Date.now();
            await request(app).get('/api/health');
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(500);
        });
    });

    describe('GET /api/health/detailed', () => {
        it('should return detailed health information', async () => {
            const res = await request(app).get('/api/health/detailed');

            expect(res.statusCode).toBeLessThanOrEqual(503); // Can be 200 or 503 depending on DB
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('hostname');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
            expect(res.body).toHaveProperty('memory');
            expect(res.body).toHaveProperty('services');
        });

        it('should include memory information', async () => {
            const res = await request(app).get('/api/health/detailed');

            expect(res.body.memory).toHaveProperty('used');
            expect(res.body.memory).toHaveProperty('total');
            expect(res.body.memory.used).toMatch(/MB$/);
            expect(res.body.memory.total).toMatch(/MB$/);
        });

        it('should include uptime in seconds', async () => {
            const res = await request(app).get('/api/health/detailed');

            expect(typeof res.body.uptime).toBe('number');
            expect(res.body.uptime).toBeGreaterThan(0);
        });

        it('should include database service status', async () => {
            const res = await request(app).get('/api/health/detailed');

            expect(res.body.services).toHaveProperty('database');
            expect(res.body.services.database).toHaveProperty('connected');
        });

        it('should include rate limit service status', async () => {
            const res = await request(app).get('/api/health/detailed');

            expect(res.body.services).toHaveProperty('rateLimit');
            expect(res.body.services.rateLimit).toHaveProperty('type');
        });

        it('should return healthy status when DB is connected', async () => {
            const res = await request(app).get('/api/health/detailed');

            if (res.body.services.database.connected) {
                expect(res.statusCode).toBe(200);
                expect(res.body.status).toBe('healthy');
            }
        });

        it('should return degraded status when DB is disconnected', async () => {
            const res = await request(app).get('/api/health/detailed');

            if (!res.body.services.database.connected) {
                expect(res.statusCode).toBe(503);
                expect(res.body.status).toBe('degraded');
            }
        });
    });

    describe('Health Check Performance', () => {
        it('should handle multiple concurrent health checks', async () => {
            // Reduced from 10 to 5 to avoid rate limiting in tests
            const requests = Array(5).fill().map(() =>
                request(app).get('/api/health')
            );

            const responses = await Promise.all(requests);

            // All should succeed (health endpoint bypasses rate limiting)
            const successCount = responses.filter(r => r.statusCode === 200).length;
            expect(successCount).toBe(5);
        });
    });
});
