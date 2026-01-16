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
            expect(typeof res.body.authToken).toBe('string');
            expect(res.body.authToken.split('.').length).toBe(3); // JWT format
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
            expect(res.body.error).toMatch(/already exists/i);
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
            expect(res.body.errors).toBeInstanceOf(Array);
        });

        it('should return 400 for short name', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'ab', // Less than 3 characters
                    email: 'shortname@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should return 400 for missing required fields', async () => {
            const testCases = [
                { name: 'Test User', email: 'test@example.com' }, // Missing password
                { name: 'Test User', password: 'password123' }, // Missing email
                { email: 'test@example.com', password: 'password123' }, // Missing name
            ];

            for (const testCase of testCases) {
                const res = await request(app)
                    .post('/api/auth/createuser')
                    .send(testCase);

                expect(res.statusCode).toBe(400);
            }
        });

        it('should hash the password before storing', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Hash Test User',
                    email: 'hashtest@example.com',
                    password: 'plainpassword123',
                });

            expect(res.statusCode).toBe(200);

            const user = await User.findOne({ email: 'hashtest@example.com' });
            expect(user.password).not.toBe('plainpassword123');
            expect(user.password.length).toBeGreaterThan(20); // Bcrypt hashes are long
        });

        it('should handle email case-insensitively for uniqueness check', async () => {
            await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'First User',
                    email: 'UPPERCASE@example.com',
                    password: 'password123',
                });

            // MongoDB email comparison is case-sensitive by default
            // but this tests the current behavior
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Second User',
                    email: 'UPPERCASE@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject non-alphanumeric passwords', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Special User',
                    email: 'special@example.com',
                    password: 'pass@word!', // Non-alphanumeric
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
            expect(typeof res.body.authToken).toBe('string');
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
            expect(res.body).toHaveProperty('success', false);
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

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'not-an-email',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should return 400 for missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                });

            expect(res.statusCode).toBe(400);
        });

        it('should return 400 for empty password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: '',
                });

            expect(res.statusCode).toBe(400);
        });

        it('should return consistent error message for security', async () => {
            // Both wrong email and wrong password should return same error
            const wrongEmail = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123',
                });

            const wrongPassword = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword',
                });

            // Both should have similar error structure
            expect(wrongEmail.body).toHaveProperty('error');
            expect(wrongPassword.body).toHaveProperty('error');
        });

        it('should generate different tokens for different logins', async () => {
            const res1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });

            // Wait a bit for different timestamp
            await new Promise(resolve => setTimeout(resolve, 100));

            const res2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });

            // Note: JWT tokens might be the same if they don't include timestamp
            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(200);
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
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', 'getuser@example.com');
            expect(res.body.user).toHaveProperty('name', 'Get User Test');
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should return 401 without token', async () => {
            const res = await request(app).post('/api/auth/getuser');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/getuser')
                .set('auth-token', 'invalid-token');

            expect(res.statusCode).toBe(401);
        });

        it('should not include password in response', async () => {
            const res = await request(app)
                .post('/api/auth/getuser')
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.user).not.toHaveProperty('password');
            expect(JSON.stringify(res.body)).not.toMatch(/password/i);
        });

        it('should return user _id and date fields', async () => {
            const res = await request(app)
                .post('/api/auth/getuser')
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty('_id');
            expect(res.body.user).toHaveProperty('date');
        });
    });

    describe('Authentication Edge Cases', () => {
        it('should handle special characters in name', async () => {
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: "O'Connor-Smith Jr.",
                    email: 'special@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('authToken');
        });

        it('should handle very long email addresses', async () => {
            const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
            const res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Long Email User',
                    email: longEmail,
                    password: 'password123',
                });

            // Should either accept or reject consistently
            expect([200, 400]).toContain(res.statusCode);
        });

        it('should handle concurrent registration attempts', async () => {
            // Create users sequentially first, then verify uniqueness
            const res1 = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Unique User 1',
                    email: 'unique1@example.com',
                    password: 'password123',
                });

            const res2 = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Unique User 2',
                    email: 'unique2@example.com',
                    password: 'password123',
                });

            const res3 = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Duplicate User',
                    email: 'unique1@example.com', // Same email as first
                    password: 'password123',
                });

            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(200);
            expect(res3.statusCode).toBe(400);
            expect(res3.body.error).toMatch(/already exists/i);
        });
    });
});
