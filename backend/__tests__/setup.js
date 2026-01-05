const mongoose = require('mongoose');

// For testing, use the test database
const testDbUri = process.env.MONGO_URI || 'mongodb://mongo:27017/ikeeper_test';

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key';
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
