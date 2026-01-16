const request = require('supertest');
const app = require('../app');

describe('Integration Tests', () => {
    describe('Complete User Flow', () => {
        it('should complete full user registration to note management flow', async () => {
            // Step 1: Register a new user
            const registerRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Integration Test User',
                    email: 'integration@example.com',
                    password: 'password123',
                });

            expect(registerRes.statusCode).toBe(200);
            expect(registerRes.body).toHaveProperty('authToken');
            const authToken = registerRes.body.authToken;

            // Step 2: Verify user can get their profile
            const profileRes = await request(app)
                .post('/api/auth/getuser')
                .set('auth-token', authToken);

            expect(profileRes.statusCode).toBe(200);
            expect(profileRes.body.user.email).toBe('integration@example.com');

            // Step 3: Create multiple notes
            const notes = [
                { title: 'First Note', description: 'First note description', tag: 'work' },
                { title: 'Second Note', description: 'Second note description', tag: 'personal' },
                { title: 'Third Note', description: 'Third note description', tag: 'ideas' },
            ];

            const noteIds = [];
            for (const note of notes) {
                const noteRes = await request(app)
                    .post('/api/notes/addnote')
                    .set('auth-token', authToken)
                    .send(note);

                expect(noteRes.statusCode).toBe(200);
                noteIds.push(noteRes.body._id);
            }

            // Step 4: Fetch all notes and verify count
            const fetchRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(fetchRes.statusCode).toBe(200);
            expect(fetchRes.body.length).toBe(3);

            // Step 5: Update one note
            const updateRes = await request(app)
                .put(`/api/notes/updatenote/${noteIds[0]}`)
                .set('auth-token', authToken)
                .send({
                    title: 'Updated First Note',
                    description: 'This note has been updated',
                });

            expect(updateRes.statusCode).toBe(200);
            expect(updateRes.body.note.title).toBe('Updated First Note');

            // Step 6: Delete one note
            const deleteRes = await request(app)
                .delete(`/api/notes/deletenote/${noteIds[1]}`)
                .set('auth-token', authToken);

            expect(deleteRes.statusCode).toBe(200);

            // Step 7: Verify final state
            const finalFetchRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(finalFetchRes.statusCode).toBe(200);
            expect(finalFetchRes.body.length).toBe(2);
            expect(finalFetchRes.body.find(n => n._id === noteIds[0]).title).toBe('Updated First Note');
        });

        it('should handle login after registration', async () => {
            // Register
            await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Login Flow User',
                    email: 'loginflow@example.com',
                    password: 'password123',
                });

            // Login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'loginflow@example.com',
                    password: 'password123',
                });

            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body.success).toBe(true);
            expect(loginRes.body).toHaveProperty('authToken');

            // Use login token to access notes
            const notesRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', loginRes.body.authToken);

            expect(notesRes.statusCode).toBe(200);
        });
    });

    describe('Multi-User Isolation', () => {
        let user1Token, user2Token;
        let user1NoteId, user2NoteId;

        beforeEach(async () => {
            // Create two users
            const user1Res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'User One',
                    email: 'user1@example.com',
                    password: 'password123',
                });
            user1Token = user1Res.body.authToken;

            const user2Res = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'User Two',
                    email: 'user2@example.com',
                    password: 'password123',
                });
            user2Token = user2Res.body.authToken;

            // Each user creates a note
            const user1NoteRes = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', user1Token)
                .send({
                    title: 'User 1 Private Note',
                    description: 'This belongs to user 1',
                    tag: 'private',
                });
            user1NoteId = user1NoteRes.body._id;

            const user2NoteRes = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', user2Token)
                .send({
                    title: 'User 2 Private Note',
                    description: 'This belongs to user 2',
                    tag: 'private',
                });
            user2NoteId = user2NoteRes.body._id;
        });

        it('should not allow user to see another user\'s notes', async () => {
            const user1Notes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', user1Token);

            const user2Notes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', user2Token);

            expect(user1Notes.body.length).toBe(1);
            expect(user2Notes.body.length).toBe(1);
            expect(user1Notes.body[0].title).toBe('User 1 Private Note');
            expect(user2Notes.body[0].title).toBe('User 2 Private Note');
        });

        it('should not allow user to update another user\'s note', async () => {
            const res = await request(app)
                .put(`/api/notes/updatenote/${user2NoteId}`)
                .set('auth-token', user1Token)
                .send({ title: 'Hacked by User 1' });

            expect(res.statusCode).toBe(401);

            // Verify note unchanged
            const user2Notes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', user2Token);

            expect(user2Notes.body[0].title).toBe('User 2 Private Note');
        });

        it('should not allow user to delete another user\'s note', async () => {
            const res = await request(app)
                .delete(`/api/notes/deletenote/${user2NoteId}`)
                .set('auth-token', user1Token);

            expect(res.statusCode).toBe(401);

            // Verify note still exists
            const user2Notes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', user2Token);

            expect(user2Notes.body.length).toBe(1);
        });
    });

    describe('API Stress Test', () => {
        it('should handle rapid sequential requests', async () => {
            const registerRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Stress Test User',
                    email: 'stress@example.com',
                    password: 'password123',
                });
            const authToken = registerRes.body.authToken;

            // Create 10 notes sequentially
            for (let i = 0; i < 10; i++) {
                const res = await request(app)
                    .post('/api/notes/addnote')
                    .set('auth-token', authToken)
                    .send({
                        title: `Stress Note ${i}`,
                        description: `Description for stress note ${i}`,
                        tag: 'stress',
                    });
                expect(res.statusCode).toBe(200);
            }

            const fetchRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(fetchRes.body.length).toBe(10);
        });

        it('should handle parallel requests from same user', async () => {
            const registerRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Parallel Test User',
                    email: 'parallel@example.com',
                    password: 'password123',
                });
            const authToken = registerRes.body.authToken;

            // Create notes in parallel
            const requests = Array(5).fill().map((_, i) =>
                request(app)
                    .post('/api/notes/addnote')
                    .set('auth-token', authToken)
                    .send({
                        title: `Parallel Note ${i}`,
                        description: `Description for parallel note ${i}`,
                        tag: 'parallel',
                    })
            );

            const responses = await Promise.all(requests);
            responses.forEach(res => {
                expect(res.statusCode).toBe(200);
            });

            const fetchRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(fetchRes.body.length).toBe(5);
        });
    });

    describe('Health Check Integration', () => {
        it('should return healthy when system is operational', async () => {
            const res = await request(app).get('/api/health');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
        });

        it('should provide detailed health information', async () => {
            const res = await request(app).get('/api/health/detailed');

            expect(res.statusCode).toBeLessThanOrEqual(503);
            expect(res.body).toHaveProperty('services');
            expect(res.body).toHaveProperty('uptime');
            expect(res.body).toHaveProperty('memory');
        });
    });

    describe('Error Recovery', () => {
        it('should continue working after invalid requests', async () => {
            // Make some invalid requests
            await request(app)
                .post('/api/auth/createuser')
                .send({ invalid: 'data' });

            await request(app)
                .get('/api/notes/fetchallnotes');

            await request(app)
                .post('/api/auth/login')
                .send({ email: 'x', password: '' });

            // System should still work
            const healthRes = await request(app).get('/api/health');
            expect(healthRes.statusCode).toBe(200);

            // Should be able to register new user
            const registerRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Recovery Test User',
                    email: 'recovery@example.com',
                    password: 'password123',
                });
            expect(registerRes.statusCode).toBe(200);
        });
    });

    describe('Token Validation Across Endpoints', () => {
        it('should reject same invalid token across all protected endpoints', async () => {
            const invalidToken = 'invalid.token.here';

            const endpoints = [
                { method: 'get', path: '/api/notes/fetchallnotes' },
                { method: 'post', path: '/api/notes/addnote' },
                { method: 'put', path: '/api/notes/updatenote/000000000000000000000000' },
                { method: 'delete', path: '/api/notes/deletenote/000000000000000000000000' },
                { method: 'post', path: '/api/auth/getuser' },
            ];

            for (const endpoint of endpoints) {
                const res = await request(app)
                    [endpoint.method](endpoint.path)
                    .set('auth-token', invalidToken);

                expect(res.statusCode).toBe(401);
            }
        });
    });
});
