const request = require('supertest');
const app = require('../app');

describe('Notes Routes', () => {
    let authToken;
    let userId;

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
                    description: 'This is a test note description',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', 'Test Note');
            expect(res.body).toHaveProperty('description', 'This is a test note description');
            expect(res.body).toHaveProperty('tag', 'test');
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('date');
        });

        it('should add a note with default tag when tag is not provided', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'No Tag Note',
                    description: 'This note has no explicit tag',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', 'No Tag Note');
            // Tag defaults to "General" based on the model
        });

        it('should return 400 for title too short', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'ab', // Too short (min 3)
                    description: 'This is a valid description',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('should return 400 for description too short', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Valid Title',
                    description: 'abc', // Too short (min 5)
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
                    description: 'This is a test note description',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(401);
        });

        it('should return 400 for missing title', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    description: 'This is a test note description',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(400);
        });

        it('should return 400 for missing description', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Test Note',
                    tag: 'test',
                });

            expect(res.statusCode).toBe(400);
        });

        it('should handle special characters in note content', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: "Note with <html> & 'quotes'",
                    description: "Description with special chars: !@#$%^&*()",
                    tag: 'special',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe("Note with <html> & 'quotes'");
        });

        it('should handle unicode characters', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Note with emoji 😀',
                    description: 'Japanese: 日本語, Chinese: 中文, Arabic: العربية',
                    tag: 'unicode',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toContain('😀');
        });

        it('should create multiple notes for same user', async () => {
            const note1 = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({ title: 'First Note', description: 'First description', tag: 'one' });

            const note2 = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({ title: 'Second Note', description: 'Second description', tag: 'two' });

            expect(note1.statusCode).toBe(200);
            expect(note2.statusCode).toBe(200);
            expect(note1.body._id).not.toBe(note2.body._id);
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

        it('should return empty array for user with no notes', async () => {
            // Create a new user
            const newUserRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'New User No Notes',
                    email: 'nonotes@example.com',
                    password: 'password123',
                });

            const res = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', newUserRes.body.authToken);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it('should only return notes belonging to the authenticated user', async () => {
            // Create another user
            const otherUserRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Other User',
                    email: 'other@example.com',
                    password: 'password123',
                });

            // Add note for other user
            await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', otherUserRes.body.authToken)
                .send({
                    title: 'Other User Note',
                    description: 'This belongs to other user',
                    tag: 'other',
                });

            // Fetch notes for original user
            const res = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            // Should only have the original user's note
            res.body.forEach(note => {
                expect(note.title).not.toBe('Other User Note');
            });
        });

        it('should return notes with all expected fields', async () => {
            const res = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            expect(res.body[0]).toHaveProperty('_id');
            expect(res.body[0]).toHaveProperty('user');
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('description');
            expect(res.body[0]).toHaveProperty('tag');
            expect(res.body[0]).toHaveProperty('date');
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
                    description: 'Original description here',
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
            expect(res.body.note).toHaveProperty('description', 'Updated description');
        });

        it('should update only the title', async () => {
            const res = await request(app)
                .put(`/api/notes/updatenote/${noteId}`)
                .set('auth-token', authToken)
                .send({
                    title: 'Only Title Updated',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.note).toHaveProperty('title', 'Only Title Updated');
            expect(res.body.note).toHaveProperty('description', 'Original description here');
        });

        it('should update only the description', async () => {
            const res = await request(app)
                .put(`/api/notes/updatenote/${noteId}`)
                .set('auth-token', authToken)
                .send({
                    description: 'Only description updated',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.note).toHaveProperty('title', 'Note to Update');
            expect(res.body.note).toHaveProperty('description', 'Only description updated');
        });

        it('should update the tag', async () => {
            const res = await request(app)
                .put(`/api/notes/updatenote/${noteId}`)
                .set('auth-token', authToken)
                .send({
                    tag: 'newtag',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.note).toHaveProperty('tag', 'newtag');
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

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .put(`/api/notes/updatenote/${noteId}`)
                .send({
                    title: 'Updated Title',
                });

            expect(res.statusCode).toBe(401);
        });

        it('should not allow updating another user\'s note', async () => {
            // Create another user
            const otherUserRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Other User',
                    email: 'otherupdate@example.com',
                    password: 'password123',
                });

            const res = await request(app)
                .put(`/api/notes/updatenote/${noteId}`)
                .set('auth-token', otherUserRes.body.authToken)
                .send({
                    title: 'Hacked Title',
                });

            expect(res.statusCode).toBe(401);
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

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .delete(`/api/notes/deletenote/${noteId}`);

            expect(res.statusCode).toBe(401);
        });

        it('should not allow deleting another user\'s note', async () => {
            // Create another user
            const otherUserRes = await request(app)
                .post('/api/auth/createuser')
                .send({
                    name: 'Other User',
                    email: 'otherdelete@example.com',
                    password: 'password123',
                });

            const res = await request(app)
                .delete(`/api/notes/deletenote/${noteId}`)
                .set('auth-token', otherUserRes.body.authToken);

            expect(res.statusCode).toBe(401);

            // Verify note still exists for original user
            const fetchRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);
            expect(fetchRes.body.length).toBe(1);
        });

        it('should return deleted note in response', async () => {
            const res = await request(app)
                .delete(`/api/notes/deletenote/${noteId}`)
                .set('auth-token', authToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('note');
            expect(res.body.note).toHaveProperty('_id', noteId);
        });
    });

    describe('Notes Edge Cases', () => {
        it('should handle invalid MongoDB ObjectId format', async () => {
            const res = await request(app)
                .put('/api/notes/updatenote/invalid-id')
                .set('auth-token', authToken)
                .send({ title: 'Test' });

            // Should return error status for invalid ID (400, 404, or 500)
            expect([400, 404, 500]).toContain(res.statusCode);
        }, 10000); // 10 second timeout for this edge case

        it('should handle very long title and description', async () => {
            const longTitle = 'A'.repeat(1000);
            const longDescription = 'B'.repeat(10000);

            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: longTitle,
                    description: longDescription,
                    tag: 'long',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe(longTitle);
        });

        it('should handle concurrent note operations', async () => {
            // Add 5 notes concurrently
            const addRequests = Array(5).fill().map((_, i) =>
                request(app)
                    .post('/api/notes/addnote')
                    .set('auth-token', authToken)
                    .send({
                        title: `Concurrent Note ${i}`,
                        description: `Description for concurrent note ${i}`,
                        tag: 'concurrent',
                    })
            );

            const responses = await Promise.all(addRequests);

            responses.forEach(res => {
                expect(res.statusCode).toBe(200);
            });

            // Verify all notes were created
            const fetchRes = await request(app)
                .get('/api/notes/fetchallnotes')
                .set('auth-token', authToken);

            expect(fetchRes.body.length).toBe(5);
        });

        it('should handle empty string tag', async () => {
            const res = await request(app)
                .post('/api/notes/addnote')
                .set('auth-token', authToken)
                .send({
                    title: 'Empty Tag Note',
                    description: 'Note with empty tag value',
                    tag: '',
                });

            expect(res.statusCode).toBe(200);
        });
    });
});
