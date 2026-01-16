const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Auth Routes', () => {
    describe('POST /api/auth/createuser', () => {
        it('should create a new user and return authToken', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('authToken');
        });

        it('should return 400 if user already exists', async () => {
            await User.create({
                name: 'Existing User',
                email: 'existing@example.com',
                password: 'hashedpassword',
            });

            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Another User',
                    email: 'existing@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 for invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a user for login tests
            await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'password123',
                });
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('authToken');
        });

        it('should return 400 for invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/getuser', () => {
        let authToken;

        beforeEach(async () => {
            const createRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Get User Test',
                    email: 'getuser@example.com',
                    password: 'password123',
                });
            authToken = createRes.body.authToken;
        });

        it('should return user details with valid token', async () => {
            const res = await request(app)
                .post('/api/auth/getuser')
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty('email', 'getuser@example.com');
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should return 401 without token', async () => {
            const res = await request(app).post('/api/auth/getuser');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });
});
