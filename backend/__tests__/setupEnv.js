// Set environment variables BEFORE any modules are loaded
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key-for-ci';
process.env.NODE_ENV = 'test';
