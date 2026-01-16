const mongoose = require('mongoose');

// For testing, use the test database
const testDbUri = process.env.MONGO_URI || 'mongodb://mongo:27017/ikeeper_test';

beforeAll(async () => {
    // Use TEST_JWT_SECRET from environment, falling back to a test-only default
    process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key-for-ci';
    await mongoose.connect(testDbUri);
});

afterAll(async () => {
    await mongoose.disconnect();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
