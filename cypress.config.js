const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:8080',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/e2e.js',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
    viewportWidth: 1280,
    viewportHeight: 720,
});
