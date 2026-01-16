module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    // setupFiles runs BEFORE test framework is installed (before module imports)
    setupFiles: ['./__tests__/setupEnv.js'],
    // setupFilesAfterEnv runs AFTER test framework is installed
    setupFilesAfterEnv: ['./__tests__/setup.js'],
    verbose: true,
    // Increase timeout for MongoMemoryServer startup
    testTimeout: 30000,
    // forceExit can mask open handles. Use --detectOpenHandles to diagnose.
    // forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};
