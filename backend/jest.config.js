module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['./__tests__/setup.js'],
    verbose: true,
    // forceExit can mask open handles. Use --detectOpenHandles to diagnose.
    // forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};
