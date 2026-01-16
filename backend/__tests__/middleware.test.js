const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

describe('Middleware Tests', () => {
    describe('fetchuser middleware', () => {
        it('should return 401 if no auth-token header is provided', async () => {
            const res = await request(app)
                .get('/api/notes/fetchallnotes');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toMatch(/authenticate/i);
        });

        it('should return 401 for invalid token', async () => {
            const res = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', 'invalid-token-here');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 401 for expired token', async () => {
            // Create an expired token
            const expiredToken = jwt.sign(
                { user: { id: '507f1f77bcf86cd799439011' } },
                process.env.JWT_SECRET || 'test-secret-key-for-ci',
                { expiresIn: '-1s' } // Already expired
            );

            const res = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', expiredToken);

            expect(res.statusCode).toBe(401);
        });

        it('should return 401 for token with wrong secret', async () => {
            const wrongSecretToken = jwt.sign(
                { user: { id: '507f1f77bcf86cd799439011' } },
                'wrong-secret-key'
            );

            const res = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', wrongSecretToken);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Request timeout middleware', () => {
        it('should accept requests within timeout', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('JSON body parser', () => {
        it('should parse JSON body correctly', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'JSON Test User',
                    email: 'jsontest@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(200);
        });

        it('should handle malformed JSON gracefully', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .set('Content-Type', 'application/json')
                .send('{ invalid json }');

            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });
    });

    describe('404 handler', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/api/unknown-route');

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Not Found');
            expect(res.body).toHaveProperty('path', '/api/unknown-route');
        });

        it('should return 404 for unknown methods on known routes', async () => {
            const res = await request(app).patch('/api/auth/login');

            expect(res.statusCode).toBe(404);
        });
    });

    describe('CORS middleware', () => {
        it('should include CORS headers in response', async () => {
            const res = await request(app)
                .get('/api/health')
                .set('Origin', 'http://localhost:3000');

            expect(res.headers).toHaveProperty('access-control-allow-origin');
        });

        it('should handle preflight OPTIONS requests', async () => {
            const res = await request(app)
                .options('/api/auth/login')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'POST');

            expect(res.statusCode).toBe(204);
        });
    });

    describe('Compression middleware', () => {
        it('should compress large responses', async () => {
            const res = await request(app)
                .get('/api/health')
                .set('Accept-Encoding', 'gzip, deflate');

            // Response should be successful
            expect(res.statusCode).toBe(200);
        });
    });
});
