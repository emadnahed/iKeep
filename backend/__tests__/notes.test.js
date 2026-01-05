const request = require('supertest');
const app = require('../app');

describe('Notes Routes', () => {
    let authToken;

    beforeEach(async () => {
        // Create a user and get token for authenticated requests
        const res = await request(app)
            .post('/api/auth/createuser')
            .send({
                name: 'Notes Test User',
                email: 'notes@example.com',
                password: 'password123',
            });
        authToken = res.body.authToken;
    });

    describe('POST /api/notes/addnote', () => {
        it('should add a new note', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Test Note',
                    description: 'This is a test note',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', 'Test Note');
            expect(res.body).toHaveProperty('description', 'This is a test note');
        });

        it('should return 400 for invalid title', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'ab', // Too short
                    description: 'This is a test note',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .send({
                    title: 'Test Note',
                    description: 'This is a test note',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/notes/fetchallnotes', () => {
        beforeEach(async () => {
            // Add a note before fetching
            await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Existing Note',
                    description: 'This note exists for fetch test',
                    tag: 'fetch',
                });
        });

        it('should fetch all notes for authenticated user', async () => {
            const res = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('title', 'Existing Note');
        });

        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/notes/fetchallnotes');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/notes/updatenote/:id', () => {
        let noteId;

        beforeEach(async () => {
            const noteRes = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Note to Update',
                    description: 'Original description',
                    tag: 'update',
                });
            noteId = noteRes.body._id;
        });

        it('should update an existing note', async () => {
            const res = await request(app)
                .put(`/api/notes/updatenote/${noteId}`)
                .set('auth-token', authToken)
                .send({
                    title: 'Updated Title',
                    description: 'Updated description',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.note).toHaveProperty('title', 'Updated Title');
        });

        it('should return 404 for non-existent note', async () => {
            const res = await request(app)
                .put('/api/notes/updatenote/000000000000000000000000')
                .set('auth-token', authToken)
                .send({
                    title: 'Updated Title',
                });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/notes/deletenote/:id', () => {
        let noteId;

        beforeEach(async () => {
            const noteRes = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Note to Delete',
                    description: 'This note will be deleted',
                    tag: 'delete',
                });
            noteId = noteRes.body._id;
        });

        it('should delete an existing note', async () => {
            const res = await request(app)
                .delete(`/api/notes/deletenote/${noteId}`)
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('Success');

            // Verify note is deleted
            const fetchRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);
            expect(fetchRes.body.length).toBe(0);
        });

        it('should return 404 for non-existent note', async () => {
            const res = await request(app)
                .delete('/api/notes/deletenote/000000000000000000000000')
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(404);
        });
    });
});
